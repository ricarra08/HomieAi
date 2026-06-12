-- 020: Define increment_uploads_received.
-- api/collaborator/upload has called this RPC since the collaborator feature shipped,
-- but it was never created in a migration — the code falls back to a non-atomic update
-- and logs an RPC error on every collaborator upload. This makes the atomic path real.
-- Called only via the service-role client; not client-callable.

create or replace function public.increment_uploads_received(link_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  update collaborator_links
  set uploads_received = coalesce(uploads_received, 0) + 1
  where id = link_id;
$$;

revoke execute on function public.increment_uploads_received(uuid)
  from public, anon, authenticated;
grant execute on function public.increment_uploads_received(uuid)
  to service_role;
