-- Dedicated server-only state. Existing course tables and login are unchanged.
begin;
create table if not exists public.telegram_bot_runtime (
  id integer primary key check (id = 1),
  payload jsonb not null,
  lease_owner uuid,
  lease_until timestamptz
);
alter table public.telegram_bot_runtime enable row level security;
revoke all on public.telegram_bot_runtime from public, anon, authenticated;
grant select, insert, update on public.telegram_bot_runtime to service_role;
insert into public.telegram_bot_runtime (id, payload) values (1,
  '{"state":{"version":1,"offset":0,"users":{},"usage":{},"globalUsage":{"day":"","count":0}},"completed":[]}'::jsonb
) on conflict (id) do nothing;

-- 330 seconds exceeds the webhook's 300-second function limit. No process can
-- take over a live invocation, and a crashed invocation is recoverable on retry.
create or replace function public.telegram_bot_claim(p_owner uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_payload jsonb;
begin
  update public.telegram_bot_runtime
  set lease_owner = p_owner, lease_until = clock_timestamp() + interval '330 seconds'
  where id = 1 and (lease_owner is null or lease_until <= clock_timestamp())
  returning payload into v_payload;
  return v_payload;
end;
$$;
create or replace function public.telegram_bot_save(p_owner uuid, p_payload jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.telegram_bot_runtime set payload = p_payload
  where id = 1 and lease_owner = p_owner and lease_until > clock_timestamp();
  return found;
end;
$$;
create or replace function public.telegram_bot_release(p_owner uuid)
returns void language sql security invoker set search_path = '' as $$
  update public.telegram_bot_runtime set lease_owner = null, lease_until = null
  where id = 1 and lease_owner = p_owner;
$$;
revoke all on function public.telegram_bot_claim(uuid) from public, anon, authenticated;
revoke all on function public.telegram_bot_save(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.telegram_bot_release(uuid) from public, anon, authenticated;
grant execute on function public.telegram_bot_claim(uuid) to service_role;
grant execute on function public.telegram_bot_save(uuid,jsonb) to service_role;
grant execute on function public.telegram_bot_release(uuid) to service_role;
commit;
