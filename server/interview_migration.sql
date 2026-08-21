-- Interview platform signaling table
-- Used as a message bus between host and candidates
-- No Realtime subscription needed — clients poll this table

create table if not exists interview_signals (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null,
  from_id     text not null,
  to_id       text,           -- null = broadcast to all in room
  event       text not null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Index for fast polling queries
create index if not exists interview_signals_room_created
  on interview_signals (room_id, created_at desc);

create index if not exists interview_signals_to_id
  on interview_signals (room_id, to_id, created_at desc);

-- Auto-clean rows older than 5 minutes (optional, via a scheduled job or just let them age)
-- In production you'd run: DELETE FROM interview_signals WHERE created_at < now() - interval '5 minutes'

-- RLS: allow anon read/write (signals contain no sensitive data, just WebRTC SDP)
alter table interview_signals enable row level security;

create policy "allow_all_interview_signals"
  on interview_signals
  for all
  to anon, authenticated
  using (true)
  with check (true);
