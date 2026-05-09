-- One logged-in completion per activity type per UTC calendar day (story quiz submit).
create table if not exists public.activity_daily_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null,
  completion_day date not null default ((timezone('utc', now())))::date,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_type, completion_day)
);

create index if not exists activity_daily_completions_user_day_idx
  on public.activity_daily_completions (user_id, completion_day desc);

alter table public.activity_daily_completions enable row level security;

create policy "activity_daily_completions_select_own"
  on public.activity_daily_completions for select
  using (auth.uid() = user_id);

create policy "activity_daily_completions_insert_own"
  on public.activity_daily_completions for insert
  with check (auth.uid() = user_id);

create policy "activity_daily_completions_delete_own"
  on public.activity_daily_completions for delete
  using (auth.uid() = user_id);
