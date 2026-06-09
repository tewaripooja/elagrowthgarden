-- COPPA compliance: record explicit parental consent before any child data is collected.
-- Each row = one consent event. user_id links to the parent's auth account.

create table if not exists public.parental_consents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  consent_version text not null default '1.0',
  given_at        timestamptz not null default now(),
  ip_hash         text,           -- SHA-256 of IP — never store raw IP
  user_agent      text,
  revoked_at      timestamptz     -- null = consent active
);

create index if not exists parental_consents_user_idx
  on public.parental_consents (user_id);

alter table public.parental_consents enable row level security;

create policy "parental_consents_select_own"
  on public.parental_consents for select
  using (auth.uid() = user_id);

create policy "parental_consents_insert_own"
  on public.parental_consents for insert
  with check (auth.uid() = user_id);

create policy "parental_consents_update_own"
  on public.parental_consents for update
  using (auth.uid() = user_id);

create policy "parental_consents_delete_own"
  on public.parental_consents for delete
  using (auth.uid() = user_id);
