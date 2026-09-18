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
