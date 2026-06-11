/**
 * POST /api/join/resolve — resolve an agent invite slug to the agent's id + display name.
 *
 * Called by onboarding when a buyer who arrived via /join/<slug> creates their profile,
 * so the referral can be stored as profiles.referred_by_agent_id. Slugs are public
 * handles by design; the response reveals only what the /join page already shows
 * (the agent's display name) plus the agent's user id, which grants nothing by itself —
 * agent access flows only through transactions.agent_id under RLS.
 *
 * Service role is used for the lookup because profiles RLS is own-row only.
 */
import { NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { isValidInviteSlug } from "@/lib/invites";
import { isSameOrigin } from "@/lib/security/same-origin";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return json(403, { error: "invalid_origin" });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { limited } = rateLimit(`join-resolve:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (limited) {
    return json(429, { error: "rate_limited" });
  }

  let body: { slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (!isValidInviteSlug(body.slug)) {
    return json(400, { error: "invalid_slug" });
  }

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: agent } = await admin
    .from("profiles")
    .select("user_id, display_name")
    .eq("invite_slug", body.slug)
    .eq("role", "agent")
    .maybeSingle();

  if (!agent) {
    return json(404, { error: "unknown_slug" });
  }

  return json(200, { agentId: agent.user_id, agentName: agent.display_name });
}
