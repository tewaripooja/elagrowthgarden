import type { CombinedStoryData } from "@/lib/ai";
import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

/** UTC calendar date YYYY-MM-DD (matches row default in DB). */
export function utcCalendarDate(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function storyFingerprint(data: CombinedStoryData): string {
  return `${data.title.trim()}::${data.genre.trim()}`;
}

export type DailyStorySessionRow = {
  user_id: string;
  completion_day: string;
  story_fingerprint: string;
  genre_label: string;
  story_title: string;
  story_round: number;
  completed_activities: string[];
  reading_done: boolean;
  story_snapshot: Json | null;
  updated_at: string;
};

export async function fetchTodaysStorySession(userId: string): Promise<DailyStorySessionRow | null> {
  const day = utcCalendarDate();
  const { data, error } = await supabase
    .from("user_daily_story_session")
    .select("*")
    .eq("user_id", userId)
    .eq("completion_day", day)
    .maybeSingle();

  if (error) {
    console.error("fetchTodaysStorySession:", error.message);
    return null;
  }
  return data as DailyStorySessionRow | null;
}

/** Start today’s story or confirm resume of the same fingerprint. */
export async function claimDailyStorySession(
  userId: string,
  params: {
    fingerprint: string;
    genreLabel: string;
    storyTitle: string;
    storyRound: number;
    storySnapshot: Json | null;
  },
): Promise<{ ok: true } | { ok: false; reason: "other_story_locked" }> {
  const day = utcCalendarDate();
  const { data: existing, error: selErr } = await supabase
    .from("user_daily_story_session")
    .select("*")
    .eq("user_id", userId)
    .eq("completion_day", day)
    .maybeSingle();

  if (selErr) {
    console.error("claimDailyStorySession select:", selErr.message);
    return { ok: false, reason: "other_story_locked" };
  }

  if (!existing) {
    const { error } = await supabase.from("user_daily_story_session").insert({
      user_id: userId,
      story_fingerprint: params.fingerprint,
      genre_label: params.genreLabel,
      story_title: params.storyTitle,
      story_round: params.storyRound,
      completed_activities: [],
      reading_done: false,
      story_snapshot: params.storySnapshot,
    });

    if (error) {
      console.error("claimDailyStorySession insert:", error.message);
      return { ok: false, reason: "other_story_locked" };
    }
    return { ok: true };
  }

  const row = existing as DailyStorySessionRow;
  if (row.story_fingerprint === params.fingerprint) {
    return { ok: true };
  }

  return { ok: false, reason: "other_story_locked" };
}

export async function appendDailyStoryCompletedActivity(userId: string, activityType: string): Promise<void> {
  const day = utcCalendarDate();
  const { data: row, error: selErr } = await supabase
    .from("user_daily_story_session")
    .select("completed_activities")
    .eq("user_id", userId)
    .eq("completion_day", day)
    .maybeSingle();

  if (selErr || !row) return;

  const prev = (row as { completed_activities: string[] | null }).completed_activities ?? [];
  const next = [...new Set([...prev, activityType])];

  await supabase
    .from("user_daily_story_session")
    .update({ completed_activities: next, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("completion_day", day);
}

export async function setDailyStoryReadingDone(userId: string, done: boolean): Promise<void> {
  const day = utcCalendarDate();
  await supabase
    .from("user_daily_story_session")
    .update({ reading_done: done, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("completion_day", day);
}
