-- ============================================================================
-- 0001_init.sql
-- Initial schema for the Mujertech bootcamp:
--   * Tables: modules, lessons, lesson_progress, marketing_assessment_submissions
--   * RLS policies (modules/lessons public; user-owned progress + submissions)
--   * Seed data for modules + one placeholder lesson per module
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table public.modules (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  position    smallint not null,
  is_bonus    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  slug        text not null,
  position    smallint not null,
  created_at  timestamptz not null default now(),
  unique (module_id, slug)
);

create table public.lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz null,
  updated_at    timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- Keep lesson_progress.updated_at in sync on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row
  execute function public.set_updated_at();

create table public.marketing_assessment_submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  business_goal   text not null,
  prompt_v1       text not null,
  ai_output       text not null,
  prompt_v2       text not null,
  what_changed    text not null,
  why_changed     text not null,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

-- modules: anyone (anon + authenticated) can read; no writes via PostgREST.
alter table public.modules enable row level security;
create policy "modules public read"
  on public.modules for select
  using (true);

-- lessons: same as modules.
alter table public.lessons enable row level security;
create policy "lessons public read"
  on public.lessons for select
  using (true);

-- lesson_progress: a user can read/insert/update only their own rows.
-- No delete policy → deletion is denied for non-service-role callers.
alter table public.lesson_progress enable row level security;
create policy "lesson_progress owner select"
  on public.lesson_progress for select
  using (auth.uid() = user_id);
create policy "lesson_progress owner insert"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);
create policy "lesson_progress owner update"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- marketing_assessment_submissions: a user can read + insert their own.
-- No update/delete policy → write-once from the user's side; only the service
-- role (which bypasses RLS) can moderate.
alter table public.marketing_assessment_submissions enable row level security;
create policy "submissions owner select"
  on public.marketing_assessment_submissions for select
  using (auth.uid() = user_id);
create policy "submissions owner insert"
  on public.marketing_assessment_submissions for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Seed data
-- ----------------------------------------------------------------------------

-- Module slugs match the i18n keys under progress.modules.* and are NOT the
-- localized URL paths. URL paths (e.g. /es/modulo-1) are handled in the app.
insert into public.modules (slug, position, is_bonus) values
  ('module1',  1,  false),
  ('module2',  2,  false),
  ('module3',  3,  false),
  ('capstone', 99, true);

-- One placeholder lesson per module. Prompt 4 will refine lesson granularity
-- when useProgress is replaced with real DB-backed tracking.
insert into public.lessons (module_id, slug, position)
select id, 'main', 1 from public.modules;
