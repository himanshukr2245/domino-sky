-- Additive migration. Runtime uses the publishable role, never a service-role key.
-- Ownership is a 256-bit browser-session capability, hashed before database use.
begin;
create schema if not exists domino_private;
revoke all on schema domino_private from public, anon, authenticated;

create or replace function public.domino_owner() returns text
language sql stable security invoker set search_path = '' as $$
  select case when (coalesce(current_setting('request.headers', true), '{}')::jsonb ->> 'x-domino-owner') ~ '^[a-f0-9]{64}$'
    then coalesce(current_setting('request.headers', true), '{}')::jsonb ->> 'x-domino-owner' else null end;
$$;
revoke all on function public.domino_owner() from public;
grant execute on function public.domino_owner() to anon;

create table if not exists public.domino_scenarios (
  id uuid primary key default gen_random_uuid(),
  owner_hash text not null check (owner_hash ~ '^[a-f0-9]{64}$'),
  airport text not null check (airport in ('DEL','BOM','BLR','HYD','MAA','CCU','AMD','COK','GOI','PNQ','JAI','GAU','LKO','IXC','BBI','TRV')),
  start_minute integer not null check (start_minute between 0 and 1439),
  end_minute integer not null,
  candidate_id text check (candidate_id ~ '^plan-[a-f0-9]{1,8}$'),
  created_at timestamptz not null default now(),
  check (end_minute > start_minute and end_minute <= start_minute + 1440 and end_minute <= 2879)
);
create index if not exists domino_scenarios_owner_created on public.domino_scenarios (owner_hash, created_at desc);
create index if not exists domino_scenarios_created on public.domino_scenarios (created_at);
alter table public.domino_scenarios enable row level security;
revoke all on public.domino_scenarios from public, anon, authenticated;
grant select, insert, delete on public.domino_scenarios to anon;
create policy domino_scenarios_select on public.domino_scenarios for select to anon using (owner_hash = public.domino_owner());
create policy domino_scenarios_insert on public.domino_scenarios for insert to anon with check (owner_hash = public.domino_owner());
create policy domino_scenarios_delete on public.domino_scenarios for delete to anon using (owner_hash = public.domino_owner());

create or replace function public.domino_save_quota() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public.domino_owner() is null or new.owner_hash is distinct from public.domino_owner() then
    raise exception 'Session ownership required' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(1920261120);
  delete from public.domino_scenarios where created_at < now() - interval '30 days';
  if (select count(*) from public.domino_scenarios where owner_hash = new.owner_hash) >= 30
    or (select count(*) from public.domino_scenarios where created_at >= current_date) >= 1000 then
    raise exception 'Scenario storage limit reached' using errcode = 'P0001';
  end if;
  new.created_at := now();
  return new;
end;
$$;
revoke all on function public.domino_save_quota() from public, anon, authenticated;
create trigger domino_save_quota before insert on public.domino_scenarios for each row execute function public.domino_save_quota();

create table if not exists domino_private.ai_usage (
  budget_key text primary key,
  used integer not null default 0,
  expires_at timestamptz not null
);
revoke all on domino_private.ai_usage from public, anon, authenticated;
create or replace function public.domino_claim_ai() returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  actor text := public.domino_owner();
  actor_key text;
  global_key text;
begin
  if actor is null then return false; end if;
  actor_key := 'actor:' || actor || ':' || date_trunc('minute', now())::text;
  global_key := 'global:' || current_date::text;
  perform pg_advisory_xact_lock(1920261121);
  delete from domino_private.ai_usage where expires_at < now();
  if coalesce((select used from domino_private.ai_usage where budget_key = actor_key), 0) >= 6
    or coalesce((select used from domino_private.ai_usage where budget_key = global_key), 0) >= 200 then return false; end if;
  insert into domino_private.ai_usage (budget_key, used, expires_at) values (actor_key, 1, now() + interval '2 minutes')
    on conflict (budget_key) do update set used = domino_private.ai_usage.used + 1;
  insert into domino_private.ai_usage (budget_key, used, expires_at) values (global_key, 1, current_date + interval '1 day')
    on conflict (budget_key) do update set used = domino_private.ai_usage.used + 1;
  return true;
end;
$$;
revoke all on function public.domino_claim_ai() from public, authenticated;
grant execute on function public.domino_claim_ai() to anon;
commit;
