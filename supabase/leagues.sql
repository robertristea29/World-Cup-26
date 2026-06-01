-- ============================================================
-- League system tables — run this in Supabase SQL Editor
-- Run AFTER schema.sql (the profiles table must already exist)
-- ============================================================

-- leagues: each row is one private league
create table if not exists public.leagues (
  id           serial primary key,
  name         text not null,
  invite_code  text not null unique,   -- short random code friends use to join
  created_by   uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- league_members: which users belong to which league
create table if not exists public.league_members (
  league_id  int  not null references public.leagues(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

-- Enable Row Level Security
alter table public.leagues        enable row level security;
alter table public.league_members enable row level security;

-- ── leagues RLS ─────────────────────────────────────────────
-- A user can see a league only if they are a member of it
create policy "Members can view their leagues"
  on public.leagues for select
  using (
    exists (
      select 1 from public.league_members lm
      where lm.league_id = id and lm.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a league
create policy "Authenticated users can create leagues"
  on public.leagues for insert
  with check (auth.uid() = created_by);

-- Only the creator can delete their league
create policy "Creator can delete league"
  on public.leagues for delete
  using (auth.uid() = created_by);

-- ── league_members RLS ───────────────────────────────────────
-- Helper function: returns all league_ids the current user belongs to.
-- SECURITY DEFINER means it runs as the function owner (bypasses RLS),
-- which breaks the infinite recursion that would occur if the policy
-- queried league_members directly.
create or replace function public.my_league_ids()
returns setof int
language sql
security definer
stable
as $$
  select league_id from public.league_members where user_id = auth.uid()
$$;

-- A user can see all membership rows for leagues they belong to
create policy "Members can view league membership"
  on public.league_members for select
  using (
    league_id in (select public.my_league_ids())
  );

-- Any authenticated user can insert themselves as a member
create policy "Users can join leagues"
  on public.league_members for insert
  with check (auth.uid() = user_id);

-- Users can remove themselves from a league
create policy "Users can leave leagues"
  on public.league_members for delete
  using (auth.uid() = user_id);
