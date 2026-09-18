-- STMS (Sweet Tennis Management System)
-- Supabase / PostgreSQL schema v1.0
-- Core operational schema. RLS policies are intentionally added after the
-- Supabase Auth project is connected and verified.

create extension if not exists pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================

create type member_role as enum ('ADMIN', 'STAFF', 'MEMBER');
create type member_status as enum ('ACTIVE', 'INACTIVE', 'LEFT', 'BANNED');
create type member_gender as enum ('MALE', 'FEMALE');

create type event_type as enum ('CLUB', 'CREW', 'LIGHTNING');
create type event_category as enum ('REGULAR', 'RANKING', 'COMPETITION', 'EXCHANGE', 'LIGHTNING');
create type event_status as enum ('DRAFT', 'OPEN', 'CLOSED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

create type participant_registration_status as enum (
  'APPLIED', 'WAITLISTED', 'CONFIRMED', 'CANCELLED'
);
create type payment_status as enum ('PENDING', 'PAID', 'REFUNDED', 'NOT_REQUIRED');
create type attendance_status as enum ('PENDING', 'ATTENDED', 'NO_SHOW');

create type game_type as enum ('MIXED_DOUBLES', 'MEN_DOUBLES', 'WOMEN_DOUBLES', 'SINGLES');
create type draw_status as enum (
  'CREATED', 'REVIEW', 'MODIFIED', 'CONFIRMED', 'IN_PROGRESS', 'FINISHED'
);
create type candidate_label as enum ('A', 'B', 'C');

create type history_type as enum ('AUTO', 'MANUAL');

create type ranking_scope as enum ('OVERALL', 'CLUB', 'CREW');

-- ============================================================
-- 1. MEMBER
-- ============================================================

create table members (
  member_id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,

  name text not null,
  gender member_gender not null,
  birth_date date not null,
  phone text,

  join_date date not null default current_date,
  tennis_start_date date not null,

  ntrp numeric(2,1),
  role member_role not null default 'MEMBER',
  status member_status not null default 'ACTIVE',

  is_club_member boolean not null default true,
  is_crew_member boolean not null default false,
  is_guest boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint members_ntrp_range
    check (ntrp is null or (ntrp >= 1.0 and ntrp <= 7.0)),

  constraint members_dates_valid
    check (tennis_start_date <= current_date and join_date <= current_date),

  constraint members_guest_affiliation
    check (not is_guest or (not is_club_member and not is_crew_member))
);

-- Exactly one ADMIN.
create unique index members_single_admin_idx
  on members (role)
  where role = 'ADMIN';

create index members_status_idx on members (status);
create index members_club_idx on members (is_club_member) where is_club_member = true;
create index members_crew_idx on members (is_crew_member) where is_crew_member = true;
create index members_guest_idx on members (is_guest) where is_guest = true;

-- ============================================================
-- 2. EVENT
-- ============================================================

create table events (
  event_id uuid primary key default gen_random_uuid(),

  title text not null,
  event_type event_type not null,
  event_category event_category not null,

  event_date date not null,
  start_at timestamptz not null,
  end_at timestamptz not null,

  venue_name text not null,
  court_names text[] not null default '{}',

  capacity integer,
  host_member_id uuid references members(member_id) on delete set null,
  opponent_club_name text,

  -- Example:
  -- [{"game_type":"MIXED_DOUBLES","count":3},{"game_type":"MEN_DOUBLES","count":2}]
  game_composition jsonb not null default '[]'::jsonb,

  status event_status not null default 'DRAFT',

  created_by uuid references members(member_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_time_valid
    check (end_at > start_at),

  constraint events_capacity_valid
    check (capacity is null or capacity > 0),

  constraint events_game_composition_array
    check (jsonb_typeof(game_composition) = 'array'),

  constraint events_lightning_host
    check (
      event_type <> 'LIGHTNING'
      or host_member_id is not null
    ),

  constraint events_category_consistency
    check (
      (event_type = 'LIGHTNING' and event_category = 'LIGHTNING')
      or
      (event_type <> 'LIGHTNING' and event_category <> 'LIGHTNING')
    )
);

create index events_date_idx on events (event_date, start_at);
create index events_type_idx on events (event_type);
create index events_status_idx on events (status);
create index events_host_idx on events (host_member_id);

-- ============================================================
-- 3. PARTICIPANT
-- Historical snapshot: member changes must not rewrite past events.
-- ============================================================

create table participants (
  participant_id uuid primary key default gen_random_uuid(),

  event_id uuid not null references events(event_id) on delete cascade,
  member_id uuid references members(member_id) on delete set null,

  -- Snapshot fields
  display_name_snapshot text not null,
  name_snapshot text not null,
  gender_snapshot member_gender not null,
  birth_date_snapshot date,
  tennis_start_date_snapshot date,
  ntrp_snapshot numeric(2,1),
  is_guest boolean not null default false,

  registration_status participant_registration_status not null default 'APPLIED',
  payment_status payment_status not null default 'PENDING',
  attendance_status attendance_status not null default 'PENDING',

  applied_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  attended_at timestamptz,
  no_show_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint participants_guest_member_relation
    check (
      (is_guest = true and member_id is null)
      or
      (is_guest = false and member_id is not null)
    ),

  constraint participants_ntrp_range
    check (ntrp_snapshot is null or (ntrp_snapshot >= 1.0 and ntrp_snapshot <= 7.0)),

  constraint participants_attendance_dates
    check (
      (attendance_status = 'ATTENDED' and attended_at is not null)
      or
      (attendance_status <> 'ATTENDED')
    ),

  constraint participants_no_show_dates
    check (
      (attendance_status = 'NO_SHOW' and no_show_at is not null)
      or
      (attendance_status <> 'NO_SHOW')
    )
);

create unique index participants_event_member_unique_idx
  on participants(event_id, member_id)
  where member_id is not null;

create index participants_event_idx on participants(event_id);
create index participants_member_idx on participants(member_id);
create index participants_attendance_idx on participants(attendance_status);
create index participants_registration_idx on participants(registration_status);

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

  status draw_status not null default 'CONFIRMED',

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

-- ============================================================
-- 8. RANKING
-- Derived/cache table. Never manually edited by operators.
-- Guest has no ranking row.
-- ============================================================

create table rankings (
  ranking_id uuid primary key default gen_random_uuid(),

  member_id uuid not null references members(member_id) on delete cascade,
  scope ranking_scope not null,
  game_type game_type not null,

  rank integer not null,
  points numeric(10,2) not null default 0,

  updated_at timestamptz not null default now(),

  constraint rankings_rank_valid check (rank > 0),
  constraint rankings_points_valid check (points >= 0)
);

create unique index rankings_member_scope_game_unique_idx
  on rankings(member_id, scope, game_type);

create index rankings_scope_game_rank_idx
  on rankings(scope, game_type, rank);

-- ============================================================
-- 9. HISTORY
-- Draw/version history. JSONB keeps an immutable snapshot.
-- ============================================================

create table history (
  history_id uuid primary key default gen_random_uuid(),

  event_id uuid not null references events(event_id) on delete cascade,
  draw_id uuid not null references draws(draw_id) on delete cascade,

  version_no integer not null,
  history_type history_type not null,

  snapshot jsonb not null,

  created_by uuid references members(member_id) on delete set null,
  created_at timestamptz not null default now(),

  constraint history_version_valid check (version_no > 0),
  constraint history_snapshot_object
    check (jsonb_typeof(snapshot) = 'object')
);

create unique index history_draw_version_unique_idx
  on history(draw_id, version_no);

create index history_event_idx on history(event_id);
create index history_created_idx on history(created_at desc);

-- ============================================================
-- COMMON UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_set_updated_at
before update on members
for each row execute function set_updated_at();

create trigger events_set_updated_at
before update on events
for each row execute function set_updated_at();

create trigger participants_set_updated_at
before update on participants
for each row execute function set_updated_at();

create trigger draws_set_updated_at
before update on draws
for each row execute function set_updated_at();

create trigger matches_set_updated_at
before update on matches
for each row execute function set_updated_at();

create trigger results_set_updated_at
before update on results
for each row execute function set_updated_at();

-- ============================================================
-- DISPLAY / EXPERIENCE HELPERS
-- No nickname column: display name is always derived.
-- ============================================================

create or replace function member_display_name(
  p_birth_date date,
  p_name text,
  p_gender member_gender
)
returns text
language sql
immutable
as $$
  select to_char(p_birth_date, 'YY')
    || p_name
    || '('
    || case p_gender
         when 'MALE' then '남'
         when 'FEMALE' then '여'
       end
    || ')';
$$;

create or replace function experience_category(p_tennis_start_date date)
returns text
language sql
stable
as $$
  select case
    when age(current_date, p_tennis_start_date) < interval '1 year'
      then '1년 미만'
    when age(current_date, p_tennis_start_date) < interval '2 years'
      then '1~2년'
    else '2년 이상'
  end;
$$;

create view member_directory as
select
  m.member_id,
  m.auth_user_id,
  member_display_name(m.birth_date, m.name, m.gender) as display_name,
  m.name,
  m.gender,
  m.birth_date,
  m.phone,
  m.join_date,
  m.tennis_start_date,
  experience_category(m.tennis_start_date) as experience_category,
  m.ntrp,
  m.role,
  m.status,
  m.is_club_member,
  m.is_crew_member,
  m.is_guest,
  m.created_at,
  m.updated_at
from members m;

-- ============================================================
-- IMPORTANT IMPLEMENTATION NOTES
-- ============================================================
-- 1) Supabase Auth/RLS policies are applied after the project is connected.
-- 2) Ranking calculation is application/service logic; rankings is a derived cache.
-- 3) A/B/C candidate generation is grouped by generation_group_id + candidate.
-- 4) Draw confirmation must validate player counts/team composition before CONFIRMED.
-- 5) Result saving must validate participant/team membership against the match draw.
-- 6) NO_SHOW visibility is operator-only and must be enforced by RLS/API, not UI alone.
-- 7) Attendance counts are derived from participants.attendance_status.
-- 8) Payment instructions are derived from event_type:
--    LIGHTNING -> KakaoPay or transfer;
--    others -> operator Toss transfer.
