-- One story per learner per UTC day: finish all activities on that story; progress is resumable.
drop table if exists public.activity_daily_completions;

create table if not exists public.user_daily_story_session (
  user_id uuid not null references auth.users (id) on delete cascade,
  completion_day date not null default ((timezone('utc', now())))::date,
  story_fingerprint text not null,
  genre_label text not null,
  story_title text not null,
  story_round int not null default 1,
  completed_activities text[] not null default '{}',
  reading_done boolean not null default false,
  story_snapshot jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, completion_day)
);

create index if not exists user_daily_story_session_user_day_idx
  on public.user_daily_story_session (user_id, completion_day desc);

alter table public.user_daily_story_session enable row level security;

create policy "user_daily_story_session_select_own"
  on public.user_daily_story_session for select
  using (auth.uid() = user_id);

create policy "user_daily_story_session_insert_own"
  on public.user_daily_story_session for insert
  with check (auth.uid() = user_id);

create policy "user_daily_story_session_update_own"
  on public.user_daily_story_session for update
  using (auth.uid() = user_id);

create policy "user_daily_story_session_delete_own"
  on public.user_daily_story_session for delete
  using (auth.uid() = user_id);
