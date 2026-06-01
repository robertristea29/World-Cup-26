-- ============================================================
-- Migration: add league_id to predictions and point_entries
-- Run this in Supabase SQL Editor AFTER leagues.sql
--
-- ⚠ This truncates predictions and point_entries — only do this
--   while in development (no real data yet).
-- ============================================================

-- Clear existing test data (foreign keys cascade automatically)
truncate public.point_entries restart identity cascade;
truncate public.predictions   restart identity cascade;

-- Drop old unique constraints (named by Postgres convention)
alter table public.predictions
  drop constraint if exists predictions_user_id_match_id_key;

alter table public.point_entries
  drop constraint if exists point_entries_user_id_match_id_key;

-- Add league_id column to predictions
alter table public.predictions
  add column league_id int references public.leagues(id) on delete cascade not null;

-- Add league_id column to point_entries
alter table public.point_entries
  add column league_id int references public.leagues(id) on delete cascade not null;

-- New unique constraints: one prediction per user per match per league
alter table public.predictions
  add constraint predictions_user_match_league_key unique (user_id, match_id, league_id);

alter table public.point_entries
  add constraint point_entries_user_match_league_key unique (user_id, match_id, league_id);
