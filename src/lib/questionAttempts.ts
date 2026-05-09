import { supabase } from "@/integrations/supabase/client";

export type QuestionAttemptPayload = {
  userId: string;
  storyKey: string;
  activityType: string;
  questionKey: string;
  attemptNumber: number;
  answerCorrect: boolean;
  evidenceCorrect: boolean;
};

export async function logQuestionAttempt(payload: QuestionAttemptPayload): Promise<void> {
  const { error } = await supabase.from("question_attempts").insert({
    user_id: payload.userId,
    story_key: payload.storyKey,
    activity_type: payload.activityType,
    question_key: payload.questionKey,
    attempt_number: payload.attemptNumber,
    answer_correct: payload.answerCorrect,
    evidence_correct: payload.evidenceCorrect,
  });
  if (error) console.warn("question_attempts insert:", error.message);
}
