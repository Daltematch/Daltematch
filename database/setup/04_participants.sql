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
      is_guest = true
      or member_id is not null
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

