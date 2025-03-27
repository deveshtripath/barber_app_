export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_controls: {
        Row: {
          admin_id: string;
          created_at: string | null;
          id: string;
          reports: Json | null;
          settings: Json | null;
          updated_at: string | null;
        };
        Insert: {
          admin_id: string;
          created_at?: string | null;
          id?: string;
          reports?: Json | null;
          settings?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          admin_id?: string;
          created_at?: string | null;
          id?: string;
          reports?: Json | null;
          settings?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_controls_admin_id_fkey";
            columns: ["admin_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          appointment_time: string;
          barber_id: string;
          created_at: string | null;
          customer_id: string;
          id: string;
          payment_status: Database["public"]["Enums"]["payment_status"];
          service_type: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string | null;
        };
        Insert: {
          appointment_time: string;
          barber_id: string;
          created_at?: string | null;
          customer_id: string;
          id?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          service_type: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string | null;
        };
        Update: {
          appointment_time?: string;
          barber_id?: string;
          created_at?: string | null;
          customer_id?: string;
          id?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          service_type?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey";
            columns: ["barber_id"];
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      barbers: {
        Row: {
          availability_status: boolean | null;
          created_at: string | null;
          earnings: number | null;
          experience: number | null;
          id: string;
          rating: number | null;
          services_offered: Json | null;
          shop_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          availability_status?: boolean | null;
          created_at?: string | null;
          earnings?: number | null;
          experience?: number | null;
          id: string;
          rating?: number | null;
          services_offered?: Json | null;
          shop_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          availability_status?: boolean | null;
          created_at?: string | null;
          earnings?: number | null;
          experience?: number | null;
          id?: string;
          rating?: number | null;
          services_offered?: Json | null;
          shop_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "barbers_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      loyalty_rewards: {
        Row: {
          created_at: string | null;
          customer_id: string;
          id: string;
          last_updated: string | null;
          points: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id: string;
          id?: string;
          last_updated?: string | null;
          points?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string;
          id?: string;
          last_updated?: string | null;
          points?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          type: Database["public"]["Enums"]["notification_type"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          type: Database["public"]["Enums"]["notification_type"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          appointment_id: string;
          created_at: string | null;
          customer_id: string;
          id: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          transaction_date: string | null;
          transaction_status: Database["public"]["Enums"]["transaction_status"];
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          appointment_id: string;
          created_at?: string | null;
          customer_id: string;
          id?: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          transaction_date?: string | null;
          transaction_status: Database["public"]["Enums"]["transaction_status"];
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          appointment_id?: string;
          created_at?: string | null;
          customer_id?: string;
          id?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          transaction_date?: string | null;
          transaction_status?: Database["public"]["Enums"]["transaction_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey";
            columns: ["appointment_id"];
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          barber_id: string;
          comment: string | null;
          created_at: string | null;
          customer_id: string;
          id: string;
          rating: number;
          updated_at: string | null;
        };
        Insert: {
          barber_id: string;
          comment?: string | null;
          created_at?: string | null;
          customer_id: string;
          id?: string;
          rating: number;
          updated_at?: string | null;
        };
        Update: {
          barber_id?: string;
          comment?: string | null;
          created_at?: string | null;
          customer_id?: string;
          id?: string;
          rating?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_barber_id_fkey";
            columns: ["barber_id"];
            referencedRelation: "barbers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          password_hash: string | null;
          phone: string | null;
          profile_image: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          name: string;
          password_hash?: string | null;
          phone?: string | null;
          profile_image?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          password_hash?: string | null;
          phone?: string | null;
          profile_image?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
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
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled";
      notification_type: "appointment" | "promo" | "reminder";
      payment_method: "card" | "wallet" | "UPI";
      payment_status: "pending" | "paid" | "failed";
      transaction_status: "success" | "failed";
      user_role: "customer" | "barber" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
