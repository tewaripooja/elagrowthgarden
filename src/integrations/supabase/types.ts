export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      reading_progress: {
        Row: {
          id: string
          user_id: string
          story_key: string
          section_index: number
          attempts_used: number
          passed: boolean
          seconds_spent: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_key: string
          section_index: number
          attempts_used?: number
          passed?: boolean
          seconds_spent?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_key?: string
          section_index?: number
          attempts_used?: number
          passed?: boolean
          seconds_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_daily_story_session: {
        Row: {
          user_id: string
          completion_day: string
          story_fingerprint: string
          genre_label: string
          story_title: string
          story_round: number
          completed_activities: string[]
          reading_done: boolean
          story_snapshot: Json | null
          updated_at: string
        }
        Insert: {
          user_id: string
          completion_day?: string
          story_fingerprint: string
          genre_label: string
          story_title: string
          story_round?: number
          completed_activities?: string[]
          reading_done?: boolean
          story_snapshot?: Json | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          completion_day?: string
          story_fingerprint?: string
          genre_label?: string
          story_title?: string
          story_round?: number
          completed_activities?: string[]
          reading_done?: boolean
          story_snapshot?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          story_key: string
          activity_type: string
          question_key: string
          attempt_number: number
          answer_correct: boolean
          evidence_correct: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_key: string
          activity_type: string
          question_key: string
          attempt_number?: number
          answer_correct: boolean
          evidence_correct: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_key?: string
          activity_type?: string
          question_key?: string
          attempt_number?: number
          answer_correct?: boolean
          evidence_correct?: boolean
          created_at?: string
        }
        Relationships: []
      }
      question_score_breakdown: {
        Row: {
          id: string
          user_id: string
          story_key: string
          activity_type: string
          question_key: string
          attempts_to_correct: number
          answer_points: number
          evidence_bonus: number
          subtotal_before_reading: number
          reading_ratio: number | null
          reading_factor: number
          final_points: number
          breakdown: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_key: string
          activity_type: string
          question_key: string
          attempts_to_correct: number
          answer_points: number
          evidence_bonus?: number
          subtotal_before_reading: number
          reading_ratio?: number | null
          reading_factor?: number
          final_points: number
          breakdown?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_key?: string
          activity_type?: string
          question_key?: string
          attempts_to_correct?: number
          answer_points?: number
          evidence_bonus?: number
          subtotal_before_reading?: number
          reading_ratio?: number | null
          reading_factor?: number
          final_points?: number
          breakdown?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_question_score_components: {
        Row: {
          id: string
          user_id: string
          story_key: string
          activity_type: string
          question_key: string
          attempts_to_correct: number
          answer_points: number
          evidence_bonus: number
          subtotal_before_reading: number
          reading_ratio: number | null
          reading_factor: number
          final_points: number
          created_at: string
          first_attempt_success: boolean
          had_success: boolean
          reading_seconds_reported: number | null
          reading_minimum_seconds_reported: number | null
          scoring_base_answer: number | null
          scoring_retry_decay: number | null
          scoring_evidence_bonus_configured: number | null
          breakdown_raw: Json
        }
        Relationships: []
      }
      analytics_growth_signups_daily: {
        Row: {
          signup_day: string
          new_users: number
        }
        Relationships: []
      }
      analytics_growth_signups_weekly: {
        Row: {
          week_start_utc: string
          new_users: number
        }
        Relationships: []
      }
      analytics_growth_signups_monthly: {
        Row: {
          month_start_utc: string
          new_users: number
        }
        Relationships: []
      }
      analytics_growth_active_users_daily: {
        Row: {
          activity_day: string
          attempt_rows: number
          active_users: number
        }
        Relationships: []
      }
      analytics_growth_daily_story_engagement: {
        Row: {
          completion_day: string
          session_rows: number
          distinct_users: number
          sessions_reading_done: number
          sessions_all_five_activities_done: number
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
