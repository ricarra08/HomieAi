/**
 * Shared snapshot lookup / fetch / upsert logic used by both the projection and market routes.
 *
 * Responsibilities:
 *  - Look up an existing snapshot by normalized address (read-only, service-role).
 *  - On miss: run `onCacheMiss` (the caller's rate-limit charge), then the DataProvider,
 *    upsert the result, and return the new row.
 *  - Single-flight in-process lock by address: if two concurrent requests for the same address
 *    arrive on the same Node instance, only one fetches (and only that one is charged); the
 *    second awaits the first's result.
 *  - Forward-compatibility coercion: missing fields from pre-existing cached rows get `null`.
 *
 * NOT responsible for:
 *  - Auth or ownership checks (route does this before calling).
 *  - Sanitization (caller decides whether/when to sanitize for its own consumer).
 *
 * The charge decision lives here (via `onCacheMiss`) rather than in the routes so the
 * cache check and the charge are a single read: routes previously pre-probed the cache to
 * decide whether to charge, which double-read the table, double-charged when the two
 * shopping cards raced on a cold address, and could skip the charge entirely when a row
 * expired between the probe and the fetch.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getDataProvider,
  type PropertySnapshot,
  type SavedHomeInput,
} from "@/lib/valuation";

const SNAPSHOT_TTL_DAYS = 30;
const SHORT_SNAPSHOT_TTL_HOURS = 24;

const inflight = new Map<string, Promise<EnsureResult>>();

export interface EnsureSnapshotInput {
  admin: SupabaseClient;
  addressNormalized: string;
  fullAddress: string;
  savedHome: SavedHomeInput;
  /**
   * Runs exactly once per cost-incurring fetch, before the DataProvider call.
   * Throw to abort (e.g. rate limit exceeded); concurrent requests that join the
   * in-flight fetch are not charged.
   */
  onCacheMiss?: () => void | Promise<void>;
}

export interface EnsureResult {
  snapshot: PropertySnapshot;
  snapshotId: string;
}

/** Upsert into property_data_snapshots failed — a DB write problem, not a provider problem. */
export class SnapshotPersistError extends Error {
  constructor(detail: string) {
    super(`snapshot_persist_failed: ${detail}`);
    this.name = "SnapshotPersistError";
  }
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

/**
 * Coerce a freshly-read snapshot row to the current TypeScript shape. Older rows pre-date
 * `metro_median_price` (added in market-snapshot PR); this fills missing fields with null
 * so consumers can assume the field exists.
 */
function coerceForwardCompat(snapshot: PropertySnapshot): PropertySnapshot {
  const m = snapshot.macro_snapshot as Partial<PropertySnapshot["macro_snapshot"]>;
  return {
    ...snapshot,
    macro_snapshot: {
      mortgage_rate_30y: m.mortgage_rate_30y ?? null,
      cpi_yoy: m.cpi_yoy ?? null,
      metro_unemployment: m.metro_unemployment ?? null,
      metro_hpi_yoy: m.metro_hpi_yoy ?? null,
      metro_inventory_months: m.metro_inventory_months ?? null,
      metro_dom_median: m.metro_dom_median ?? null,
      metro_median_price: m.metro_median_price ?? null,
    },
  };
}

async function fetchFresh(input: EnsureSnapshotInput): Promise<EnsureResult> {
  const { admin, addressNormalized, fullAddress, savedHome, onCacheMiss } = input;
  const provider = getDataProvider();

  await onCacheMiss?.();

  const snapshot = await provider.fetchSnapshot({
    address: fullAddress,
    savedHome,
  });

  const ttl =
    snapshot.source_quality.completeness_score < 0.3
      ? addHours(new Date(), SHORT_SNAPSHOT_TTL_HOURS)
      : addDays(new Date(), SNAPSHOT_TTL_DAYS);

  const { data: upserted, error } = await admin
    .from("property_data_snapshots")
    .upsert(
      {
        address_normalized: addressNormalized,
        provider: provider.name,
        snapshot,
        fetched_at: new Date().toISOString(),
        expires_at: ttl.toISOString(),
      },
      { onConflict: "address_normalized,provider" },
    )
    .select("id")
    .single();

  if (error || !upserted) {
    throw new SnapshotPersistError(error?.message ?? "unknown");
  }

  return { snapshot, snapshotId: upserted.id };
}

/**
 * Look up or fetch a property snapshot. Service-role required for the admin client.
 * Throws on persist failures. Caller handles auth and error mapping.
 */
export async function ensureSnapshot(input: EnsureSnapshotInput): Promise<EnsureResult> {
  const { admin, addressNormalized } = input;
  const provider = getDataProvider();

  // 1. Cache hit?
  const { data: existing } = await admin
    .from("property_data_snapshots")
    .select("id, snapshot, expires_at")
    .eq("address_normalized", addressNormalized)
    .eq("provider", provider.name)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existing) {
    return {
      snapshot: coerceForwardCompat(existing.snapshot as PropertySnapshot),
      snapshotId: existing.id,
    };
  }

  // 2. Cache miss — single-flight by normalized address. Only the request that initiates
  // the fetch runs onCacheMiss (and gets charged); joiners share the result for free.
  const lockKey = `${provider.name}::${addressNormalized}`;
  const existingPromise = inflight.get(lockKey);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = fetchFresh(input).finally(() => {
    inflight.delete(lockKey);
  });
  inflight.set(lockKey, promise);
  return promise;
}
