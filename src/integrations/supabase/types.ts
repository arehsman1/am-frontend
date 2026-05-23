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
      boosts: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          package: Database["public"]["Enums"]["boost_package"]
          starts_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at: string
          id?: string
          package: Database["public"]["Enums"]["boost_package"]
          starts_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          package?: Database["public"]["Enums"]["boost_package"]
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          request_id: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          related_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profile_unlocks: {
        Row: {
          amount: number
          created_at: string
          id: string
          target_id: string
          viewer_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          target_id: string
          viewer_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          target_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          blood_group: string | null
          created_at: string
          display_name: string | null
          gender: Database["public"]["Enums"]["user_gender"]
          genotype: string | null
          has_profile_image: boolean | null
          id: string
          interests: string[]
          is_verified: boolean
          location: string | null
          marital_status: string | null
          number_of_kids: number | null
          occupation: string | null
          onboarded: boolean
          profile_image_url: string | null
          religion: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          blood_group?: string | null
          created_at?: string
          display_name?: string | null
          gender: Database["public"]["Enums"]["user_gender"]
          genotype?: string | null
          has_profile_image?: boolean | null
          id?: string
          interests?: string[]
          is_verified?: boolean
          location?: string | null
          marital_status?: string | null
          number_of_kids?: number | null
          occupation?: string | null
          onboarded?: boolean
          profile_image_url?: string | null
          religion?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          blood_group?: string | null
          created_at?: string
          display_name?: string | null
          gender?: Database["public"]["Enums"]["user_gender"]
          genotype?: string | null
          has_profile_image?: boolean | null
          id?: string
          interests?: string[]
          is_verified?: boolean
          location?: string | null
          marital_status?: string | null
          number_of_kids?: number | null
          occupation?: string | null
          onboarded?: boolean
          profile_image_url?: string | null
          religion?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          auto_flag: boolean
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          updated_at: string
        }
        Insert: {
          auto_flag?: boolean
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          updated_at?: string
        }
        Update: {
          auto_flag?: boolean
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          intent: Database["public"]["Enums"]["request_intent"]
          kind: Database["public"]["Enums"]["request_kind"]
          location_label: string | null
          location_lat: number | null
          location_lng: number | null
          location_radius_km: number | null
          message: string | null
          recipient_id: string | null
          sender_id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["request_intent"]
          kind?: Database["public"]["Enums"]["request_kind"]
          location_label?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          message?: string | null
          recipient_id?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["request_intent"]
          kind?: Database["public"]["Enums"]["request_kind"]
          location_label?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          message?: string | null
          recipient_id?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["txn_kind"]
          note: string | null
          reference: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["txn_kind"]
          note?: string | null
          reference?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["txn_kind"]
          note?: string | null
          reference?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_boost: {
        Args: { _package: Database["public"]["Enums"]["boost_package"] }
        Returns: Json
      }
      get_profile_image_path: { Args: { _target: string }; Returns: string }
      get_whatsapp: { Args: { _target: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_request: { Args: { p_receiver: string }; Returns: Json }
      unlock_profile: { Args: { _target: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      boost_package: "starter" | "pro" | "elite"
      notification_type:
        | "request_new"
        | "request_accepted"
        | "request_declined"
        | "match"
        | "location_alert"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      report_target: "user" | "request" | "profile"
      request_intent:
        | "serious"
        | "situationship"
        | "friendship"
        | "ovn_st"
        | "marriage"
      request_kind: "user" | "location"
      request_status: "new" | "accepted" | "declined" | "expired"
      txn_kind: "topup" | "unlock" | "boost" | "refund" | "bonus"
      user_gender: "male" | "female"
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
      app_role: ["admin", "moderator", "user"],
      boost_package: ["starter", "pro", "elite"],
      notification_type: [
        "request_new",
        "request_accepted",
        "request_declined",
        "match",
        "location_alert",
      ],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      report_target: ["user", "request", "profile"],
      request_intent: [
        "serious",
        "situationship",
        "friendship",
        "ovn_st",
        "marriage",
      ],
      request_kind: ["user", "location"],
      request_status: ["new", "accepted", "declined", "expired"],
      txn_kind: ["topup", "unlock", "boost", "refund", "bonus"],
      user_gender: ["male", "female"],
    },
  },
} as const
