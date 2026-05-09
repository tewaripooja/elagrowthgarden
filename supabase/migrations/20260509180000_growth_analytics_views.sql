-- Growth / acquisition metrics for operators only (not exposed to anon/authenticated clients).
-- All timestamps derive from UTC calendar boundaries unless noted on individual views.
-- Query via Supabase SQL Editor or any backend using the service_role key — never from the browser.

create or replace view public.analytics_growth_signups_daily as
select
  ((u.created_at at time zone 'utc'))::date as signup_day,
  count(*)::bigint as new_users
from auth.users u
group by 1;

comment on view public.analytics_growth_signups_daily is
  'New auth.users rows grouped by UTC calendar day (created_at).';

create or replace view public.analytics_growth_signups_weekly as
select
  date_trunc('week', (u.created_at at time zone 'utc'))::date as week_start_utc,
  count(*)::bigint as new_users
from auth.users u
group by 1;

comment on view public.analytics_growth_signups_weekly is
  'New auth.users rows grouped by ISO week start (Monday 00:00 UTC).';

create or replace view public.analytics_growth_signups_monthly as
select
  date_trunc('month', (u.created_at at time zone 'utc'))::date as month_start_utc,
  count(*)::bigint as new_users
from auth.users u
group by 1;

comment on view public.analytics_growth_signups_monthly is
  'New auth.users rows grouped by UTC calendar month.';

-- KPI: distinct learners with at least one question attempt per UTC day.
create or replace view public.analytics_growth_active_users_daily as
select
  ((qa.created_at at time zone 'utc'))::date as activity_day,
  count(*)::bigint as attempt_rows,
  count(distinct qa.user_id)::bigint as active_users
from public.question_attempts qa
group by 1;

comment on view public.analytics_growth_active_users_daily is
  'Daily activity from question_attempts: raw attempts and distinct user_ids (UTC day).';

-- KPI: daily story habit surface — sessions row count, readers finished, “full” activity rows (5+ checklist items).
create or replace view public.analytics_growth_daily_story_engagement as
select
  s.completion_day,
  count(*)::bigint as session_rows,
  count(distinct s.user_id)::bigint as distinct_users,
  count(*) filter (where s.reading_done)::bigint as sessions_reading_done,
  count(*) filter (
    where coalesce(array_length(s.completed_activities, 1), 0) >= 5
  )::bigint as sessions_all_five_activities_done
from public.user_daily_story_session s
group by s.completion_day;

comment on view public.analytics_growth_daily_story_engagement is
  'Daily aggregates from user_daily_story_session: DAU-style counts and completion proxies (5 completed_activities).';

grant select on public.analytics_growth_signups_daily to service_role;
grant select on public.analytics_growth_signups_weekly to service_role;
grant select on public.analytics_growth_signups_monthly to service_role;
grant select on public.analytics_growth_active_users_daily to service_role;
grant select on public.analytics_growth_daily_story_engagement to service_role;
