-- 019: Durable rate limiting (security finding H2).
-- In-memory rate limiting is per-instance on serverless, so counters reset on every cold
-- start and never coordinate across lambdas — leaving OpenAI-backed and public routes
-- effectively unlimited. This migration adds fixed-window counters keyed by
-- (key, window_start), consumed through a single atomic upsert RPC.
--
-- Access model: service-role only. RLS is enabled with zero policies and EXECUTE is
-- revoked from client roles — the limiter is infrastructure, never client-callable
-- (same posture as property_data_snapshots; lesson from finding L-1).

create table if not exists public.rate_limit_counters (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limit_counters enable row level security;

revoke all on table public.rate_limit_counters from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after_seconds integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_window_end timestamptz;
  v_count integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 256 then
    raise exception 'invalid rate-limit key';
  end if;
  if p_max is null or p_max < 1 or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'invalid rate-limit parameters';
  end if;

  -- Fixed window aligned to the epoch so all instances agree on boundaries.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  v_window_end := v_window_start + make_interval(secs => p_window_seconds);

  insert into rate_limit_counters as c (key, window_start, count)
  values (p_key, v_window_start, 1)
  on conflict (key, window_start)
  do update set count = c.count + 1
  returning c.count into v_count;

  -- Opportunistic cleanup once per fresh window: per-IP keys would otherwise
  -- accumulate a row per window forever. Index-scoped to this key, so it's cheap.
  if v_count = 1 then
    delete from rate_limit_counters
    where key = p_key
      and window_start < now() - interval '1 day';
  end if;

  return query select
    v_count <= p_max,
    greatest(p_max - v_count, 0),
    greatest(0, ceil(extract(epoch from (v_window_end - now()))))::integer;
end;
$$;

revoke execute on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;
