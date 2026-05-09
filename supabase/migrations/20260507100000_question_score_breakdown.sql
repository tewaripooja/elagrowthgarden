-- Per-question score breakdown (quiz activities) — supports reading-time factor and retries.
create table if not exists public.question_score_breakdown (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  story_key text not null,
  activity_type text not null,
  question_key text not null,
  attempts_to_correct int not null,
  answer_points int not null,
  evidence_bonus int not null default 0,
  subtotal_before_reading int not null,
  reading_ratio numeric,
  reading_factor numeric not null default 1,
  final_points int not null,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, story_key, activity_type, question_key)
);

create index if not exists question_score_breakdown_user_story_idx
  on public.question_score_breakdown (user_id, story_key);

alter table public.question_score_breakdown enable row level security;

create policy "question_score_breakdown_select_own"
  on public.question_score_breakdown for select
  using (auth.uid() = user_id);

create policy "question_score_breakdown_insert_own"
  on public.question_score_breakdown for insert
  with check (auth.uid() = user_id);

create policy "question_score_breakdown_update_own"
  on public.question_score_breakdown for update
  using (auth.uid() = user_id);

create policy "question_score_breakdown_delete_own"
  on public.question_score_breakdown for delete
  using (auth.uid() = user_id);
