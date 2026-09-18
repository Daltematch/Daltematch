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

