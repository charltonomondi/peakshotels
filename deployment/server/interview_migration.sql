-- ─── Interview Platform — Persistence Tables ────────────────────────────────
-- Run this in Supabase SQL Editor before using the interview platform.
-- These tables enable session persistence: host page reloads restore the room.

-- 1. Room sessions — tracks active meeting rooms
create table if not exists interview_rooms (
  room_id       text primary key,
  host_name     text not null,
  form_url      text,
  duration_secs int not null default 3600,
  exam_started  boolean not null default false,
  exam_started_at timestamptz,
  exam_ends_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Participants — tracks everyone who joined a room
create table if not exists interview_participants (
  id            uuid primary key default gen_random_uuid(),
  room_id       text not null references interview_rooms(room_id) on delete cascade,
  participant_id text not null,   -- client-generated UUID
  name          text not null,
  email         text,
  role          text not null check (role in ('host','candidate')),
  admitted      boolean not null default false,
  last_seen     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (room_id, participant_id)
);

create index if not exists ipart_room on interview_participants(room_id);

-- 3. Signals table (optional — only needed if you want DB-backed fallback)
create table if not exists interview_signals (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null,
  from_id     text not null,
  to_id       text,
  event       text not null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists isig_room_created on interview_signals(room_id, created_at desc);

-- RLS: allow anon read/write on all three tables
alter table interview_rooms        enable row level security;
alter table interview_participants enable row level security;
alter table interview_signals      enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'interview_rooms' and policyname = 'allow_all_interview_rooms') then
    create policy "allow_all_interview_rooms" on interview_rooms for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'interview_participants' and policyname = 'allow_all_interview_participants') then
    create policy "allow_all_interview_participants" on interview_participants for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'interview_signals' and policyname = 'allow_all_interview_signals') then
    create policy "allow_all_interview_signals" on interview_signals for all to anon, authenticated using (true) with check (true);
  end if;
end $$;
