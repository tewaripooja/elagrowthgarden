create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  story_key text not null,
  activity_type text not null,
  question_key text not null,
  attempt_number int not null default 1,
  answer_correct boolean not null,
  evidence_correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists question_attempts_user_story_idx
  on public.question_attempts (user_id, story_key);

alter table public.question_attempts enable row level security;

create policy "question_attempts_select_own"
  on public.question_attempts for select
  using (auth.uid() = user_id);

create policy "question_attempts_insert_own"
  on public.question_attempts for insert
  with check (auth.uid() = user_id);

create policy "question_attempts_delete_own"
  on public.question_attempts for delete
  using (auth.uid() = user_id);
