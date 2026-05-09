import { supabase } from "@/integrations/supabase/client";
import type { ActivityType } from "@/lib/ai";
import type { QuestionScoreComputation } from "@/lib/activityScoring";
import type { Json } from "@/integrations/supabase/types";

export type PersistedQuestionScore = {
  question_key: string;
  row: QuestionScoreComputation;
};

export async function persistActivityQuestionScores(
  userId: string,
  storyKey: string,
  activityType: ActivityType,
  scores: PersistedQuestionScore[],
): Promise<void> {
  if (scores.length === 0) return;

  const payload = scores.map(({ question_key, row }) => ({
    user_id: userId,
    story_key: storyKey,
    activity_type: activityType,
    question_key,
    attempts_to_correct: row.attempts_to_correct,
    answer_points: row.answer_points,
    evidence_bonus: row.evidence_bonus,
    subtotal_before_reading: row.subtotal_before_reading,
    reading_ratio: row.reading_ratio,
    reading_factor: row.reading_factor,
    final_points: row.final_points,
    breakdown: row.breakdown as Json,
  }));

  const { error } = await supabase.from("question_score_breakdown").upsert(payload, {
    onConflict: "user_id,story_key,activity_type,question_key",
  });
  if (error) console.warn("question_score_breakdown upsert:", error.message);
}
