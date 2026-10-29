-- Session revocation for the auth database (the project behind SUPABASE_URL).
-- Logging out records the session token's id here; middleware rejects revoked ids.
-- Apply: node --env-file=.env.local db/apply.mjs db/revoked-sessions.sql

create table if not exists public.revoked_sessions (
  jti uuid primary key,
  -- the token's own expiry; after this it's rejected anyway and the row can go
  expires_at timestamptz not null
);
create index if not exists revoked_sessions_expires_at_idx on public.revoked_sessions (expires_at);

-- No policies: only the service role (server-side) can read or write it.
alter table public.revoked_sessions enable row level security;
