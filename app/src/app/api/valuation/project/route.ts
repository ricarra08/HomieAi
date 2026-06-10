/**
 * POST /api/valuation/project
 *
 * Returns a Monte Carlo projection of future home value over 15 years using the spec-faithful
 * 5-layer engine. Snapshot-fetching infrastructure is shared with /api/market/snapshot via
 * `ensureSnapshot`; the projection cache is per-(saved_home_id, model_version, snapshot_id,
 * anchor_price). Rate-limit key `valuation:${userId}` is shared with the market route to
 * prevent doubling OpenAI cost across the two cards.
 *
 * Security invariant: the service-role admin client is used only after auth.getUser() and an
 * RLS-gated saved_homes lookup confirm ownership of the savedHomeId.
 */
import { NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { searchAddresses } from "@/lib/geocode";
import { rateLimit, RateLimitExceededError } from "@/lib/rate-limit";
import { normalizeAddress, projectHome, MODEL_VERSION } from "@/lib/valuation";
import { ensureSnapshot, SnapshotPersistError } from "@/lib/valuation/snapshot-fetcher";
import { PromptSafetyError, escapeForPrompt } from "@/lib/valuation/prompt-safety";
import { logRouteError } from "@/lib/log";
import { isSameOrigin } from "@/lib/security/same-origin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PROJECTION_TTL_DAYS = 7;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ROUTE = "api/valuation/project";

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
  // CSRF defense-in-depth: reject cross-site POSTs (cookie-authenticated route).
  if (!isSameOrigin(request)) {
    return json(403, { error: "invalid_origin" });
  }

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

  // 2. Verify ownership (RLS gates this; admin client is used only after this passes).
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

  // 3. Geocode (best-effort).
  const geocodeResults = await searchAddresses(savedHome.address).catch(() => []);
  const geocode = geocodeResults[0] ?? null;
  const geocodeSucceeded = geocode !== null;
  const fullAddress = geocode?.formattedAddress ?? savedHome.address;
  const addressNormalized = normalizeAddress(fullAddress);

  // Reject prompt-unsafe addresses before any DB read or rate-limit charge — these can
  // never produce a snapshot, so they must not consume the user's hourly budget.
  try {
    escapeForPrompt(fullAddress);
  } catch (err) {
    if (err instanceof PromptSafetyError) {
      return json(400, { error: "invalid_address" });
    }
    throw err;
  }

  // 4. Snapshot via shared helper. The rate limit is charged inside ensureSnapshot's
  // single-flight miss path (onCacheMiss), so concurrent requests from the two shopping
  // cards cost one token, not two, and the charge can't drift from the cache check.
  // TODO(v2): move rateLimit to a distributed store (e.g., Supabase valuation_rate_limits table)
  // so it survives multi-instance deployment.
  let snapshotResult;
  try {
    snapshotResult = await ensureSnapshot({
      admin,
      addressNormalized,
      fullAddress,
      savedHome: {
        address: fullAddress,
        price: savedHome.price,
        beds: savedHome.beds,
        baths: savedHome.baths,
        sqft: savedHome.sqft,
      },
      onCacheMiss: () => {
        const { limited } = rateLimit(`valuation:${userId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
        if (limited) {
          throw new RateLimitExceededError(RATE_LIMIT_WINDOW_MS / 1000);
        }
      },
    });
  } catch (err) {
    if (err instanceof RateLimitExceededError) {
      return json(
        429,
        { error: "rate_limited", message: "Hourly projection limit reached. Try again later." },
        { "Retry-After": String(err.retryAfterSeconds) },
      );
    }
    if (err instanceof PromptSafetyError) {
      return json(400, { error: "invalid_address" });
    }
    if (err instanceof SnapshotPersistError) {
      logRouteError({ route: ROUTE, event: "snapshot_persist_failed", userId, status: 500 }, err);
      return json(500, { error: "snapshot_persist_failed" });
    }
    logRouteError({ route: ROUTE, event: "snapshot_fetch_failed", userId, status: 503 }, err);
    const debug =
      process.env.NODE_ENV !== "production"
        ? { stage: "data_provider", detail: err instanceof Error ? err.message : String(err) }
        : undefined;
    return json(503, { error: "projection_unavailable", ...(debug ?? {}) });
  }

  const { snapshot, snapshotId } = snapshotResult;

  // 5. Projection cache lookup.
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

  // 6. Run the engine.
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
    logRouteError({ route: ROUTE, event: "engine_failed", userId, status: 500 }, err);
    return json(500, { error: "engine_failed" });
  }

  // Geocode-failure confidence penalty.
  if (!geocodeSucceeded) {
    result.currentValue.confidenceScore = Math.max(0, result.currentValue.confidenceScore - 15);
    result.warnings.push("Geocoding failed; spatial micro-location features were excluded.");
  }

  // 7. Insert projection (ON CONFLICT handles concurrent-request races).
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
    logRouteError({ route: ROUTE, event: "projection_persist_failed", userId, status: 500 }, insertError ?? new Error("no row"));
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
