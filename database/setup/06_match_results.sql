-- ============================================================
-- 6. MATCH
-- Created from a confirmed draw.
-- ============================================================

create table matches (
  match_id uuid primary key default gen_random_uuid(),

  event_id uuid not null references events(event_id) on delete cascade,
  draw_id uuid not null unique references draws(draw_id) on delete restrict,

  game_type game_type not null,
  round integer not null,
  court_name text not null,
  scheduled_at timestamptz,

  status match_status not null default 'CONFIRMED',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint matches_round_valid check (round > 0)
);

create index matches_event_idx on matches(event_id);
create index matches_status_idx on matches(status);
create index matches_scheduled_idx on matches(scheduled_at);

-- ============================================================
-- 7. RESULT
-- One row per participant in a match.
-- Singles = 2 rows, doubles = 4 rows.
-- ============================================================

create table results (
  result_id uuid primary key default gen_random_uuid(),

  match_id uuid not null references matches(match_id) on delete cascade,
  participant_id uuid not null references participants(participant_id) on delete restrict,

  team_no smallint not null,
  score integer not null default 0,

  created_by uuid references members(member_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint results_team_valid check (team_no in (1, 2)),
  constraint results_score_valid check (score >= 0)
);

create unique index results_match_participant_unique_idx
  on results(match_id, participant_id);

create index results_match_idx on results(match_id);
create index results_participant_idx on results(participant_id);

