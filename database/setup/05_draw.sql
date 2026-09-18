-- ============================================================
-- 4. DRAW
-- One row = one scheduled game slot.
-- A/B/C are candidate outputs; generation_group_id groups one run.
-- ============================================================

create table draws (
  draw_id uuid primary key default gen_random_uuid(),

  event_id uuid not null references events(event_id) on delete cascade,

  generation_group_id uuid,
  candidate candidate_label,

  game_type game_type not null,
  round integer not null,
  court_name text not null,
  draw_no integer not null,

  generation_options jsonb not null default '{}'::jsonb,

  status draw_status not null default 'CREATED',

  created_by uuid references members(member_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint draws_round_valid check (round > 0),
  constraint draws_no_valid check (draw_no > 0),
  constraint draws_options_object
    check (jsonb_typeof(generation_options) = 'object')
);

create index draws_event_idx on draws(event_id);
create index draws_generation_group_idx on draws(generation_group_id);
create index draws_status_idx on draws(status);

-- Prevent duplicate slot numbers inside the same candidate/event.
create unique index draws_slot_unique_idx
  on draws(event_id, coalesce(generation_group_id, '00000000-0000-0000-0000-000000000000'::uuid),
           coalesce(candidate, 'A'::candidate_label), round, court_name, draw_no);

-- ============================================================
-- 5. DRAW PLAYER
-- Team/slot composition for each draw slot.
-- Singles: team 1/2, one player each.
-- Doubles: team 1/2, two players each.
-- ============================================================

create table draw_players (
  draw_player_id uuid primary key default gen_random_uuid(),

  draw_id uuid not null references draws(draw_id) on delete cascade,
  participant_id uuid not null references participants(participant_id) on delete restrict,

  team_no smallint not null,
  slot_no smallint not null,

  created_at timestamptz not null default now(),

  constraint draw_players_team_valid check (team_no in (1, 2)),
  constraint draw_players_slot_valid check (slot_no in (1, 2))
);

create unique index draw_players_draw_participant_unique_idx
  on draw_players(draw_id, participant_id);

create unique index draw_players_draw_team_slot_unique_idx
  on draw_players(draw_id, team_no, slot_no);

create index draw_players_participant_idx on draw_players(participant_id);

