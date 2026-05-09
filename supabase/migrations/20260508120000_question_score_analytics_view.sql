-- Flatten score columns + breakdown JSON for dashboards, exports, and BI tools.
-- RLS: reads still restricted to owning user via underlying question_score_breakdown (PostgreSQL 15+ security_invoker).

create or replace view public.analytics_question_score_components
with (security_invoker = true)
as
select
  q.id,
  q.user_id,
  q.story_key,
  q.activity_type,
  q.question_key,
  q.attempts_to_correct,
  q.answer_points,
  q.evidence_bonus,
  q.subtotal_before_reading,
  q.reading_ratio,
  q.reading_factor,
  q.final_points,
  q.created_at,
  coalesce((q.breakdown->>'firstAttemptSuccess')::boolean, false) as first_attempt_success,
  coalesce((q.breakdown->>'hadSuccess')::boolean, false) as had_success,
  nullif(q.breakdown->>'readingSeconds', '')::numeric as reading_seconds_reported,
  nullif(q.breakdown->>'readingMinimumSeconds', '')::numeric as reading_minimum_seconds_reported,
  nullif(q.breakdown->>'baseAnswer', '')::int as scoring_base_answer,
  nullif(q.breakdown->>'retryDecay', '')::numeric as scoring_retry_decay,
  nullif(q.breakdown->>'evidenceBonusConfigured', '')::int as scoring_evidence_bonus_configured,
  q.breakdown as breakdown_raw
from public.question_score_breakdown q;

comment on view public.analytics_question_score_components is
  'Analytics-facing projection of quiz scores: scalar components + parsed breakdown fields + raw JSON.';

grant select on public.analytics_question_score_components to authenticated;
grant select on public.analytics_question_score_components to service_role;
