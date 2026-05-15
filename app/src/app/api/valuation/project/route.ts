import { NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { searchAddresses } from "@/lib/geocode";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDataProvider,
  normalizeAddress,
  projectHome,
  MODEL_VERSION,
  type PropertySnapshot,
} from "@/lib/valuation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SNAPSHOT_TTL_DAYS = 30;
const SHORT_SNAPSHOT_TTL_HOURS = 24;
const PROJECTION_TTL_DAYS = 7;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function getServiceRoleClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

interface ProjectionResponse {
  id: string;
  savedHomeId: string;
  transactionId: string;
  modelVersion: string;
  anchorPrice: number;
  address: string;
  currentValue: ReturnType<typeof projectHome>["currentValue"];
  scenarios: ReturnType<typeof projectHome>["scenarios"];
  series: ReturnType<typeof projectHome>["series"];
  attribution: ReturnType<typeof projectHome>["attribution"];
  regime: ReturnType<typeof projectHome>["regime"];
  explanation: string;
  warnings: string[];
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  let body: { savedHomeId?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const savedHomeId = body.savedHomeId;
  if (!savedHomeId || typeof savedHomeId !== "string") {
    return json(400, { error: "savedHomeId required" });
  }

  // 1. Auth
  const supabase = await createSupabaseServer();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return json(401, { error: "unauthenticated" });
  }
  const userId = authData.user.id;

  // 2. Verify ownership (RLS gates this for us if we read with the user's session)
  const { data: savedHome, error: shError } = await supabase
    .from("saved_homes")
    .select("id, deal_id, address, price, beds, baths, sqft")
    .eq("id", savedHomeId)
    .maybeSingle();

  if (shError || !savedHome) {
    return json(404, { error: "saved_home_not_found" });
  }
  if (!savedHome.deal_id) {
    return json(400, { error: "saved_home_not_linked_to_transaction" });
  }
  if (!savedHome.price || savedHome.price <= 0) {
    return json(422, { error: "saved_home_missing_price" });
  }

  const admin = getServiceRoleClient();
  const provider = getDataProvider();

  // 3. Geocode (best-effort)
  const geocodeResults = await searchAddresses(savedHome.address).catch(() => []);
  const geocode = geocodeResults[0] ?? null;
  const geocodeSucceeded = geocode !== null;
  const fullAddress = geocode?.formattedAddress ?? savedHome.address;
  const addressNormalized = normalizeAddress(fullAddress);

  // 4. Snapshot lookup or fetch
  const { data: existingSnapshot } = await admin
    .from("property_data_snapshots")
    .select("id, snapshot, expires_at")
    .eq("address_normalized", addressNormalized)
    .eq("provider", provider.name)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  let snapshot: PropertySnapshot;
  let snapshotId: string;

  if (existingSnapshot) {
    snapshot = existingSnapshot.snapshot as PropertySnapshot;
    snapshotId = existingSnapshot.id;
  } else {
    // Rate-limit only the snapshot-miss path (the expensive one).
    const { limited } = rateLimit(`valuation:${userId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (limited) {
      return json(
        429,
        { error: "rate_limited", message: "Hourly projection limit reached. Try again later." },
        { "Retry-After": "3600" },
      );
    }

    try {
      snapshot = await provider.fetchSnapshot({
        address: fullAddress,
        savedHome: {
          address: fullAddress,
          price: savedHome.price,
          beds: savedHome.beds,
          baths: savedHome.baths,
          sqft: savedHome.sqft,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error("[valuation] provider error:", { message, stack, err });
      const debug =
        process.env.NODE_ENV !== "production"
          ? { stage: "data_provider", detail: message }
          : undefined;
      return json(503, { error: "projection_unavailable", ...(debug ?? {}) });
    }

    // Short TTL when data was sparse, so we re-try sooner.
    const ttlExpiresAt =
      snapshot.source_quality.completeness_score < 0.3
        ? addHours(new Date(), SHORT_SNAPSHOT_TTL_HOURS)
        : addDays(new Date(), SNAPSHOT_TTL_DAYS);

    const { data: upserted, error: upsertError } = await admin
      .from("property_data_snapshots")
      .upsert(
        {
          address_normalized: addressNormalized,
          provider: provider.name,
          snapshot,
          fetched_at: new Date().toISOString(),
          expires_at: ttlExpiresAt.toISOString(),
        },
        { onConflict: "address_normalized,provider" },
      )
      .select("id")
      .single();

    if (upsertError || !upserted) {
      console.error("[valuation] snapshot upsert error:", upsertError);
      return json(500, { error: "snapshot_persist_failed" });
    }
    snapshotId = upserted.id;
  }

  // 5. Projection cache lookup
  const { data: cachedProjection } = await admin
    .from("home_value_projections")
    .select("*")
    .eq("saved_home_id", savedHomeId)
    .eq("model_version", MODEL_VERSION)
    .eq("snapshot_id", snapshotId)
    .eq("anchor_price", savedHome.price)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (cachedProjection) {
    return json(200, projectionRowToResponse(cachedProjection, fullAddress));
  }

  // 6. Run the engine
  let result;
  try {
    result = projectHome({
      snapshot,
      savedHome: {
        address: fullAddress,
        price: savedHome.price,
        beds: savedHome.beds,
        baths: savedHome.baths,
        sqft: savedHome.sqft,
      },
      geocodeSucceeded,
      address: fullAddress,
    });
  } catch (err) {
    console.error("[valuation] engine error:", err);
    return json(500, { error: "engine_failed" });
  }

  // Apply the geocode-failure confidence penalty here so the engine doesn't need to know about it.
  if (!geocodeSucceeded) {
    result.currentValue.confidenceScore = Math.max(0, result.currentValue.confidenceScore - 15);
    result.warnings.push("Geocoding failed; spatial micro-location features were excluded.");
  }

  // 7. Insert projection (ON CONFLICT handles concurrent-request races)
  const expiresAt = addDays(new Date(), PROJECTION_TTL_DAYS).toISOString();

  const { data: inserted, error: insertError } = await admin
    .from("home_value_projections")
    .upsert(
      {
        saved_home_id: savedHomeId,
        transaction_id: savedHome.deal_id,
        model_version: result.modelVersion,
        anchor_price: result.anchorPrice,
        series: result.series,
        current_value: result.currentValue,
        attribution: result.attribution,
        regime: result.regime,
        confidence_score: result.currentValue.confidenceScore,
        explanation: result.explanation,
        snapshot_id: snapshotId,
        generated_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: "saved_home_id,model_version,snapshot_id,anchor_price" },
    )
    .select("*")
    .single();

  if (insertError || !inserted) {
    console.error("[valuation] projection persist error:", insertError);
    return json(500, { error: "projection_persist_failed" });
  }

  return json(200, projectionRowToResponse(inserted, fullAddress, result.warnings));
}

type ProjectionRow = {
  id: string;
  saved_home_id: string;
  transaction_id: string;
  model_version: string;
  anchor_price: number;
  series: ProjectionResponse["series"];
  current_value: ProjectionResponse["currentValue"];
  attribution: ProjectionResponse["attribution"];
  regime: ProjectionResponse["regime"];
  explanation: string | null;
  generated_at: string;
};

function projectionRowToResponse(
  row: ProjectionRow,
  address: string,
  warningsOverride?: string[],
): ProjectionResponse {
  const scenarios = row.series[0]
    ? {
        conservative: row.series[0].conservative,
        moderate: row.series[0].moderate,
        optimistic: row.series[0].optimistic,
      }
    : { conservative: 0, moderate: 0, optimistic: 0 };

  return {
    id: row.id,
    savedHomeId: row.saved_home_id,
    transactionId: row.transaction_id,
    modelVersion: row.model_version,
    anchorPrice: Number(row.anchor_price),
    address,
    currentValue: row.current_value,
    scenarios,
    series: row.series,
    attribution: row.attribution,
    regime: row.regime,
    explanation: row.explanation ?? "",
    warnings: warningsOverride ?? [],
    generatedAt: row.generated_at,
  };
}
