-- ============================================================
-- World Cup 2026 Prediction App - Database Schema
-- Run this once in your Supabase project > SQL Editor
-- ============================================================

-- Profiles table (extends Supabase auth.users)
-- One row per registered user
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Matches table — all 72 group stage fixtures
-- home_score / away_score are null until the match result is entered
create table public.matches (
  id serial primary key,
  home_team text not null,
  away_team text not null,
  kickoff_time timestamptz not null,
  group_name text not null,       -- 'A', 'B', ... 'L'
  matchday int not null,          -- 1, 2, or 3
  home_score int,                 -- null = not yet played
  away_score int,                 -- null = not yet played
  status text not null default 'scheduled', -- 'scheduled' | 'finished'
  api_fixture_id int              -- optional: API-Football fixture ID for automation
);

-- Predictions table — one row per user per match
-- predicted_home / predicted_away are the user's guessed scores
create table public.predictions (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id int references public.matches(id) on delete cascade not null,
  predicted_home int not null,
  predicted_away int not null,
  created_at timestamptz not null default now(),
  unique(user_id, match_id)       -- one prediction per user per match
);

-- Point entries — calculated after each match result is saved
-- One row per user per match, written when admin enters the result
create table public.point_entries (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id int references public.matches(id) on delete cascade not null,
  points int not null default 0,
  unique(user_id, match_id)
);

-- ============================================================
-- Row Level Security (RLS) policies
-- ============================================================

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.point_entries enable row level security;

-- Profiles: users can read all profiles, only update their own
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Matches: everyone can read, only service role (admin API) can write
create policy "matches_select" on public.matches for select using (true);
create policy "matches_insert" on public.matches for insert with check (true);
create policy "matches_update" on public.matches for update using (true);

-- Predictions: users can read all predictions (for leaderboard), only insert/update their own
create policy "predictions_select" on public.predictions for select using (true);
create policy "predictions_insert" on public.predictions for insert with check (auth.uid() = user_id);
create policy "predictions_update" on public.predictions for update using (auth.uid() = user_id);

-- Point entries: everyone can read (for leaderboard), only service role writes
create policy "points_select" on public.point_entries for select using (true);
create policy "points_insert" on public.point_entries for insert with check (true);
create policy "points_update" on public.point_entries for update using (true);

-- ============================================================
-- Auto-create profile row when a new user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
