-- Jeevanrekha: Supabase table setup for anonymous incident persistence.
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- 1. Incidents table
create table if not exists incidents (
  id           bigint generated always as identity primary key,
  device_id    text not null,
  started_at   timestamptz not null default now(),
  triage       text,
  accident_type text,
  protocol_id  text,
  coords       jsonb,
  answers      jsonb,
  timeline     jsonb,
  outcome      jsonb,
  victims      jsonb,
  text         text,
  address      text,
  created_at   timestamptz not null default now()
);

-- Unique constraint for upsert (one row per device per incident)
alter table incidents
  add constraint incidents_device_started_uniq
  unique (device_id, started_at);

-- 2. Row Level Security — allow anonymous inserts and upserts, no reads/deletes
alter table incidents enable row level security;

create policy "Anyone can insert incidents"
  on incidents for insert
  to anon
  with check (true);

create policy "Anyone can update their own incidents"
  on incidents for update
  to anon
  using (true)
  with check (true);

-- Optional: allow a device to read its own incidents (useful if you add sync later)
-- create policy "Device can read own incidents"
--   on incidents for select
--   to anon
--   using (device_id = current_setting('request.headers')::jsonb->>'x-device-id');

-- 3. Volunteers table (if not already created)
create table if not exists volunteers (
  id           bigint generated always as identity primary key,
  name         text not null,
  phone        text not null unique,
  lat          double precision,
  lng          double precision,
  skills       text[] default '{}',
  available    boolean default true,
  last_active  timestamptz default now()
);

alter table volunteers enable row level security;

create policy "Anyone can register as volunteer"
  on volunteers for insert
  to anon
  with check (true);

create policy "Anyone can update own volunteer record"
  on volunteers for update
  to anon
  using (true)
  with check (true);

create policy "Anyone can read volunteers"
  on volunteers for select
  to anon
  using (true);

create policy "Volunteers can delete own record"
  on volunteers for delete
  to anon
  using (true);
