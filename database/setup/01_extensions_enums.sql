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
create type match_status as enum ('CONFIRMED', 'IN_PROGRESS', 'FINISHED');

