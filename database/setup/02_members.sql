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

