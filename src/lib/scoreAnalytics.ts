import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/** Row shape from view `analytics_question_score_components` — flat columns + parsed breakdown fields + raw JSON. */
export type QuestionScoreAnalyticsRow = Tables<"analytics_question_score_components">;

/**
 * Loads flattened score rows for the signed-in user (RLS applies).
 * Use for in-app dashboards or ad-hoc analytics; SQL consumers can query the view directly.
 */
export async function fetchQuestionScoreAnalytics(options?: {
  limit?: number;
  storyKey?: string;
}): Promise<{ rows: QuestionScoreAnalyticsRow[]; error?: string }> {
  const limit = Math.min(Math.max(options?.limit ?? 80, 1), 500);

  let q = supabase
    .from("analytics_question_score_components")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.storyKey) {
    q = q.eq("story_key", options.storyKey);
  }

  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as QuestionScoreAnalyticsRow[] };
}

/** Summaries derived client-side for quick KPIs (matches fetched rows only). */
export function summarizeScoreComponents(rows: QuestionScoreAnalyticsRow[]) {
  if (rows.length === 0) {
    return {
      count: 0,
      avgFinalPoints: null as number | null,
      avgAnswerPoints: null as number | null,
      avgEvidenceBonus: null as number | null,
      avgReadingFactor: null as number | null,
      firstAttemptRateAmongSolves: null as number | null,
    };
  }

  const withSolve = rows.filter((r) => r.had_success);
  const firstAmong = withSolve.filter((r) => r.first_attempt_success).length;

  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  return {
    count: rows.length,
    avgFinalPoints: Math.round(avg(rows.map((r) => r.final_points))),
    avgAnswerPoints: Math.round(avg(rows.map((r) => r.answer_points))),
    avgEvidenceBonus: Math.round(avg(rows.map((r) => r.evidence_bonus)) * 10) / 10,
    avgReadingFactor: Math.round(avg(rows.map((r) => r.reading_factor)) * 100) / 100,
    firstAttemptRateAmongSolves:
      withSolve.length === 0 ? null : Math.round((firstAmong / withSolve.length) * 100),
  };
}
