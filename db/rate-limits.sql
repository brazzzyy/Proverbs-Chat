-- Rate limiting for the auth database (the project behind SUPABASE_URL).
-- Fixed-window counters shared by every serverless instance; used by lib/rate-limit.ts.
-- Apply: node --env-file=.env.local db/apply.mjs db/rate-limits.sql

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (key, window_start)
);
create index if not exists rate_limits_window_start_idx on public.rate_limits (window_start);

-- No policies: only the service role (server-side) can read or write it.
alter table public.rate_limits enable row level security;

-- Counts one hit for p_key in the current window and returns whether it's within p_limit.
create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start)
  values (p_key, v_window)
  on conflict (key, window_start) do update set count = r.count + 1
  returning r.count into v_count;

  -- occasional cleanup keeps the table small
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
