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
      answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          question_id: string
          score: number
          user_id: string
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          question_id: string
          score?: number
          user_id?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          answerid: string | null
          created_at: string
          eventid: number
          id: number
          instanceid: string
          points: number | null
          questionid: string | null
          team: number | null
          userid: string | null
        }
        Insert: {
          answerid?: string | null
          created_at?: string
          eventid: number
          id?: number
          instanceid: string
          points?: number | null
          questionid?: string | null
          team?: number | null
          userid?: string | null
        }
        Update: {
          answerid?: string | null
          created_at?: string
          eventid?: number
          id?: number
          instanceid?: string
          points?: number | null
          questionid?: string | null
          team?: number | null
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_events_answerid_fkey"
            columns: ["answerid"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_instanceid_fkey"
            columns: ["instanceid"]
            isOneToOne: false
            referencedRelation: "active_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_instanceid_fkey"
            columns: ["instanceid"]
            isOneToOne: false
            referencedRelation: "game_instance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_questionid_fkey"
            columns: ["questionid"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_instance: {
        Row: {
          answers: Json
          confetti_mode: string
          created_at: string
          current_question_id: string | null
          finished: string | null
          gameid: string
          id: string
          join_code: string | null
          join_code_expires: string | null
          left_score: number
          question_text: string
          right_score: number
          round_score: number
          strikes: number
          team_left: string | null
          team_right: string | null
          userid: string
        }
        Insert: {
          answers?: Json
          confetti_mode?: string
          created_at?: string
          current_question_id?: string | null
          finished?: string | null
          gameid: string
          id?: string
          join_code?: string | null
          join_code_expires?: string | null
          left_score?: number
          question_text?: string
          right_score?: number
          round_score?: number
          strikes?: number
          team_left?: string | null
          team_right?: string | null
          userid?: string
        }
        Update: {
          answers?: Json
          confetti_mode?: string
          created_at?: string
          current_question_id?: string | null
          finished?: string | null
          gameid?: string
          id?: string
          join_code?: string | null
          join_code_expires?: string | null
          left_score?: number
          question_text?: string
          right_score?: number
          round_score?: number
          strikes?: number
          team_left?: string | null
          team_right?: string | null
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_instance_game_fkey"
            columns: ["gameid"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_questions: {
        Row: {
          created_at: string
          gameid: string
          position: string
          questionid: string
          userid: string
        }
        Insert: {
          created_at?: string
          gameid: string
          position: string
          questionid: string
          userid?: string
        }
        Update: {
          created_at?: string
          gameid?: string
          position?: string
          questionid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_questions_gameid_fkey"
            columns: ["gameid"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_questions_questionid_fkey"
            columns: ["questionid"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          id: string
          name: string
          userid: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          userid?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          userid?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          id: string
          question: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_games: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          userid: string | null
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
