-- COPPA data minimisation: auto-purge old records from tables that don't yet have retention.
-- question_attempts already has a 30-day purge job (20260504140000).
-- This adds 90-day retention for reading_progress, question_score_breakdown,
-- and user_daily_story_session, plus 365-day retention for parental_consents.

create extension if not exists pg_cron with schema extensions;

-- Unschedule existing jobs before re-scheduling to make this migration idempotent.
select cron.unschedule(jobid)
  from cron.job
  where jobname in (
    'purge_reading_progress_90d',
    'purge_question_score_breakdown_90d',
    'purge_user_daily_story_session_90d',
    'purge_parental_consents_365d'
  );

select cron.schedule(
  'purge_reading_progress_90d',
  '0 3 * * *',
  $$
    delete from public.reading_progress
    where updated_at < now() - interval '90 days';
  $$
);

select cron.schedule(
  'purge_question_score_breakdown_90d',
  '0 3 * * *',
  $$
    delete from public.question_score_breakdown
    where created_at < now() - interval '90 days';
  $$
);

select cron.schedule(
  'purge_user_daily_story_session_90d',
  '0 3 * * *',
  $$
    delete from public.user_daily_story_session
    where completion_day < (current_date - interval '90 days')::date;
  $$
);

-- Keep consent records for 1 year after account deletion (legal requirement)
select cron.schedule(
  'purge_parental_consents_365d',
  '0 4 * * *',
  $$
    delete from public.parental_consents
    where revoked_at is not null
      and revoked_at < now() - interval '365 days';
  $$
);
