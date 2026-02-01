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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          characters_added: number | null
          characters_deleted: number | null
          duration_seconds: number | null
          id: string
          metadata: Json | null
          platform: string | null
          project_id: string
          student_id: string
          timestamp: string
          url: string | null
        }
        Insert: {
          activity_type: string
          characters_added?: number | null
          characters_deleted?: number | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          project_id: string
          student_id: string
          timestamp?: string
          url?: string | null
        }
        Update: {
          activity_type?: string
          characters_added?: number | null
          characters_deleted?: number | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          project_id?: string
          student_id?: string
          timestamp?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_scores: {
        Row: {
          communication_score: number | null
          document_edit_score: number | null
          id: string
          last_calculated: string | null
          meeting_score: number | null
          project_id: string
          student_id: string
          total_score: number | null
        }
        Insert: {
          communication_score?: number | null
          document_edit_score?: number | null
          id?: string
          last_calculated?: string | null
          meeting_score?: number | null
          project_id: string
          student_id: string
          total_score?: number | null
        }
        Update: {
          communication_score?: number | null
          document_edit_score?: number | null
          id?: string
          last_calculated?: string | null
          meeting_score?: number | null
          project_id?: string
          student_id?: string
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contribution_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          group_name: string | null
          group_number: number
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          group_name?: string | null
          group_number: number
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          group_name?: string | null
          group_number?: number
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_students: {
        Row: {
          created_at: string
          extension_installed: boolean | null
          extension_last_sync: string | null
          group_id: string | null
          id: string
          project_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          extension_installed?: boolean | null
          extension_last_sync?: string | null
          group_id?: string | null
          id?: string
          project_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          extension_installed?: boolean | null
          extension_last_sync?: string | null
          group_id?: string | null
          id?: string
          project_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_students_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_students_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          group_id: string | null
          id: string
          project_id: string
          task_name: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          group_id?: string | null
          id?: string
          project_id: string
          task_name: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          group_id?: string | null
          id?: string
          project_id?: string
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_urls: {
        Row: {
          created_at: string
          description: string | null
          id: string
          platform: string | null
          project_id: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          platform?: string | null
          project_id: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          platform?: string | null
          project_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_urls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          course_name: string | null
          created_at: string
          deadline: string | null
          description: string | null
          group_size: number | null
          id: string
          name: string
          status: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          course_name?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          group_size?: number | null
          id?: string
          name: string
          status?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          course_name?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          group_size?: number | null
          id?: string
          name?: string
          status?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          project_id: string
          start_time: string
          student_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          project_id: string
          start_time: string
          student_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          project_id?: string
          start_time?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_availability_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "teacher" | "student"
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
    Enums: {
      app_role: ["teacher", "student"],
    },
  },
} as const
