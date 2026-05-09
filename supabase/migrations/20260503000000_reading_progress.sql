-- Per-user reading checkpoints and time per story section.
-- Run with Supabase CLI or paste into SQL editor.

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  story_key text not null,
  section_index int not null,
  attempts_used int not null default 0,
  passed boolean not null default false,
  seconds_spent int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, story_key, section_index)
);

create index if not exists reading_progress_user_story_idx
  on public.reading_progress (user_id, story_key);

alter table public.reading_progress enable row level security;

create policy "reading_progress_select_own"
  on public.reading_progress for select
  using (auth.uid() = user_id);

create policy "reading_progress_insert_own"
  on public.reading_progress for insert
  with check (auth.uid() = user_id);

create policy "reading_progress_update_own"
  on public.reading_progress for update
  using (auth.uid() = user_id);

create policy "reading_progress_delete_own"
  on public.reading_progress for delete
  using (auth.uid() = user_id);
