export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      retention_actions: {
        Row: {
          action_type: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          outcome: string | null;
          owner: string | null;
          scheduled_at: string | null;
          status: string;
          subscriber_id: string;
        };
        Insert: {
          action_type: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          outcome?: string | null;
          owner?: string | null;
          scheduled_at?: string | null;
          status?: string;
          subscriber_id: string;
        };
        Update: {
          action_type?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          outcome?: string | null;
          owner?: string | null;
          scheduled_at?: string | null;
          status?: string;
          subscriber_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retention_actions_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          },
        ];
      };
      risk_assessments: {
        Row: {
          calculated_at: string;
          contributing_signals: Json;
          id: string;
          principal_reason: string;
          principal_signal_key: string | null;
          priority_score: number;
          recommended_action: string;
          risk_level: string;
          risk_score: number;
          subscriber_id: string;
        };
        Insert: {
          calculated_at?: string;
          contributing_signals?: Json;
          id?: string;
          principal_reason: string;
          principal_signal_key?: string | null;
          priority_score?: number;
          recommended_action: string;
          risk_level: string;
          risk_score: number;
          subscriber_id: string;
        };
        Update: {
          calculated_at?: string;
          contributing_signals?: Json;
          id?: string;
          principal_reason?: string;
          principal_signal_key?: string | null;
          priority_score?: number;
          recommended_action?: string;
          risk_level?: string;
          risk_score?: number;
          subscriber_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "risk_assessments_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: true;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          },
        ];
      };
      risk_history: {
        Row: {
          created_at: string;
          critical_count: number;
          high_count: number;
          id: string;
          low_count: number;
          medium_count: number;
          revenue_at_risk: number;
          snapshot_date: string;
        };
        Insert: {
          created_at?: string;
          critical_count?: number;
          high_count?: number;
          id?: string;
          low_count?: number;
          medium_count?: number;
          revenue_at_risk?: number;
          snapshot_date: string;
        };
        Update: {
          created_at?: string;
          critical_count?: number;
          high_count?: number;
          id?: string;
          low_count?: number;
          medium_count?: number;
          revenue_at_risk?: number;
          snapshot_date?: string;
        };
        Relationships: [];
      };
      risk_rules: {
        Row: {
          configuration: Json;
          created_at: string;
          description: string;
          enabled: boolean;
          id: string;
          name: string;
          rule_key: string;
          updated_at: string;
          weight: number;
        };
        Insert: {
          configuration?: Json;
          created_at?: string;
          description: string;
          enabled?: boolean;
          id?: string;
          name: string;
          rule_key: string;
          updated_at?: string;
          weight: number;
        };
        Update: {
          configuration?: Json;
          created_at?: string;
          description?: string;
          enabled?: boolean;
          id?: string;
          name?: string;
          rule_key?: string;
          updated_at?: string;
          weight?: number;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          articles_read_30d: number;
          articles_read_previous_30d: number;
          avg_read_time_minutes: number;
          billing_period: string;
          complaints_90d: number;
          created_at: string;
          customer_code: string;
          email: string;
          full_name: string;
          id: string;
          is_demo: boolean;
          last_access_at: string | null;
          monthly_value: number;
          newsletter_open_rate: number;
          payment_failures_90d: number;
          payment_method: string;
          plan: string;
          renewal_date: string;
          renewal_intent_score: number | null;
          satisfaction_score: number | null;
          sessions_30d: number;
          sessions_previous_30d: number;
          subscription_start_date: string;
          subscription_status: string;
          updated_at: string;
        };
        Insert: {
          articles_read_30d?: number;
          articles_read_previous_30d?: number;
          avg_read_time_minutes?: number;
          billing_period?: string;
          complaints_90d?: number;
          created_at?: string;
          customer_code: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_demo?: boolean;
          last_access_at?: string | null;
          monthly_value?: number;
          newsletter_open_rate?: number;
          payment_failures_90d?: number;
          payment_method?: string;
          plan: string;
          renewal_date: string;
          renewal_intent_score?: number | null;
          satisfaction_score?: number | null;
          sessions_30d?: number;
          sessions_previous_30d?: number;
          subscription_start_date: string;
          subscription_status?: string;
          updated_at?: string;
        };
        Update: {
          articles_read_30d?: number;
          articles_read_previous_30d?: number;
          avg_read_time_minutes?: number;
          billing_period?: string;
          complaints_90d?: number;
          created_at?: string;
          customer_code?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_demo?: boolean;
          last_access_at?: string | null;
          monthly_value?: number;
          newsletter_open_rate?: number;
          payment_failures_90d?: number;
          payment_method?: string;
          plan?: string;
          renewal_date?: string;
          renewal_intent_score?: number | null;
          satisfaction_score?: number | null;
          sessions_30d?: number;
          sessions_previous_30d?: number;
          subscription_start_date?: string;
          subscription_status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
