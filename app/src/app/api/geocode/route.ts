import { NextRequest } from "next/server";
import { searchAddresses } from "@/lib/geocode";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function clientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: NextRequest) {
  const ip = clientIdentifier(request);
  const { limited } = rateLimit(`geocode:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (limited) {
    return Response.json(
      { error: "Too many address lookups. Please wait a moment." },
      { status: 429 }
    );
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const stateCode = request.nextUrl.searchParams.get("state") ?? undefined;

  if (q.length < 3) {
    return Response.json([]);
  }

  const results = await searchAddresses(q, {
    stateCode,
    signal: request.signal,
  }).catch(() => []);

  return Response.json(results);
}
