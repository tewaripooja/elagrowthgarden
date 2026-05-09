-- Retention: delete question_attempts older than 30 days.
--
-- 1) Enable extension (Supabase Dashboard → Database → Extensions → pg_cron → Enable).
-- 2) Run this migration (CLI push or SQL Editor). If schedule step errors because the job
--    already exists, run:  SELECT cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'purge_question_attempts_30d'));
--    then re-run only the SELECT cron.schedule(...) line.

create index if not exists question_attempts_created_at_idx
  on public.question_attempts (created_at);

create or replace function public.purge_question_attempts_retention(p_days int default 30)
returns bigint
language sql
security definer
set search_path = public
as $$
  with deleted as (
    delete from public.question_attempts
    where created_at < (now() - (p_days || ' days')::interval)
    returning 1
  )
  select count(*)::bigint from deleted;
$$;

comment on function public.purge_question_attempts_retention(int) is
  'Deletes rows older than p_days (default 30). Used by pg_cron; you can call SELECT public.purge_question_attempts_retention(30) manually.';

revoke all on function public.purge_question_attempts_retention(int) from public;
grant execute on function public.purge_question_attempts_retention(int) to postgres;

create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'purge_question_attempts_30d',
  '15 6 * * *',
  $$select public.purge_question_attempts_retention(30)$$
);
