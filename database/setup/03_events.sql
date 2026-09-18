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

