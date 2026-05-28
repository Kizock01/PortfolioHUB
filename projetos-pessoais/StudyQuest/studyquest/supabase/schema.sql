create table if not exists public.profiles (
  id uuid primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_academic_profile (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  weak_subjects jsonb default '[]'::jsonb,
  strong_subjects jsonb default '[]'::jsonb,
  selected_topics jsonb default '[]'::jsonb,
  onboarding_completed boolean default false,
  updated_at timestamptz default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  player jsonb not null,
  subjects jsonb not null,
  completed_quest_ids jsonb not null default '[]'::jsonb,
  selected_title text,
  unlocked_titles jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.user_competitive (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  competitive_points int default 0,
  wins int default 0,
  losses int default 0,
  draws int default 0,
  best_combo int default 0,
  average_accuracy int default 0,
  highest_score int default 0,
  most_played_subject text default 'all',
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

create index if not exists idx_user_academic_profile_user_id on public.user_academic_profile(user_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_competitive_user_id on public.user_competitive(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_academic_profile_updated_at on public.user_academic_profile;
create trigger trg_user_academic_profile_updated_at
before update on public.user_academic_profile
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_competitive_updated_at on public.user_competitive;
create trigger trg_user_competitive_updated_at
before update on public.user_competitive
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_academic_profile enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_competitive enable row level security;

drop policy if exists "profiles_owner_select" on public.profiles;
create policy "profiles_owner_select" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_owner_upsert" on public.profiles;
create policy "profiles_owner_upsert" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "academic_owner_all" on public.user_academic_profile;
create policy "academic_owner_all" on public.user_academic_profile for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "progress_owner_all" on public.user_progress;
create policy "progress_owner_all" on public.user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "competitive_owner_all" on public.user_competitive;
create policy "competitive_owner_all" on public.user_competitive for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
