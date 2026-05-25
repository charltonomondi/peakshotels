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
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          num_guests: number
          reference: string
          room_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          num_guests?: number
          reference?: string
          room_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          num_guests?: number
          reference?: string
          room_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          data: Json
          id: string
          section: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          id?: string
          section: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          id?: string
          section?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_blocks: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reason: string | null
          room_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          room_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          room_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          callback_payload: Json | null
          checkout_request_id: string | null
          created_at: string
          created_by: string | null
          environment: string
          id: string
          merchant_request_id: string | null
          mpesa_receipt: string | null
          payment_id: string | null
          phone: string
          result_code: string | null
          result_desc: string | null
          status: string
          transaction_date: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          callback_payload?: Json | null
          checkout_request_id?: string | null
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          payment_id?: string | null
          phone: string
          result_code?: string | null
          result_desc?: string | null
          status?: string
          transaction_date?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          callback_payload?: Json | null
          checkout_request_id?: string | null
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          payment_id?: string | null
          phone?: string
          result_code?: string | null
          result_desc?: string | null
          status?: string
          transaction_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          created_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_ref: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[]
          capacity: number
          category: Database["public"]["Enums"]["room_category"]
          created_at: string
          description: string | null
          id: string
          images: string[]
          name: string
          price_per_night: number
          room_number: string
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          capacity?: number
          category?: Database["public"]["Enums"]["room_category"]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          name: string
          price_per_night: number
          room_number: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          capacity?: number
          category?: Database["public"]["Enums"]["room_category"]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          name?: string
          price_per_night?: number
          room_number?: string
          status?: Database["public"]["Enums"]["room_status"]
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "manager" | "receptionist"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_method: "mpesa" | "card" | "cash" | "bank"
      payment_status: "paid" | "pending" | "failed" | "refunded"
      room_category: "single" | "double" | "deluxe" | "suite" | "family"
      room_status: "available" | "booked" | "maintenance"
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
      app_role: ["super_admin", "manager", "receptionist"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_method: ["mpesa", "card", "cash", "bank"],
      payment_status: ["paid", "pending", "failed", "refunded"],
      room_category: ["single", "double", "deluxe", "suite", "family"],
      room_status: ["available", "booked", "maintenance"],
    },
  },
} as const
