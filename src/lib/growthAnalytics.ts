import type { Tables } from "@/integrations/supabase/types";

/**
 * Operator growth metrics live in Postgres views granted only to `service_role`.
 * Stack decision (choose-stack): Supabase-native views + SQL Editor / backend —
 * avoids shipping third-party SDK keys to the browser. Optional later: PostHog
 * etc. for marketing funnels without widening DB access.
 *
 * Non-signup KPIs (pair-metrics) surfaced here:
 * - DAU proxy: `analytics_growth_active_users_daily.active_users`
 * - Story habit / completion proxy: `analytics_growth_daily_story_engagement`
 *   (use `sessions_all_five_activities_done` vs `session_rows` for completion rate)
 * - AI unit cost: no ledger in-app — reconcile gateway billing vs `active_users` externally.
 *
 * See `supabase/analytics/growth_queries.sql` for ad-hoc timezone buckets and example queries.
 */

export type GrowthSignupsDailyRow = Tables<"analytics_growth_signups_daily">;
export type GrowthSignupsWeeklyRow = Tables<"analytics_growth_signups_weekly">;
export type GrowthSignupsMonthlyRow = Tables<"analytics_growth_signups_monthly">;
export type GrowthActiveUsersDailyRow = Tables<"analytics_growth_active_users_daily">;
export type GrowthDailyStoryEngagementRow = Tables<"analytics_growth_daily_story_engagement">;

export const GROWTH_ANALYTICS_VIEW_NAMES = [
  "analytics_growth_signups_daily",
  "analytics_growth_signups_weekly",
  "analytics_growth_signups_monthly",
  "analytics_growth_active_users_daily",
  "analytics_growth_daily_story_engagement",
] as const;
