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
      blog_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          external_link: string | null
          id: string
          image: string | null
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          publish_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["post_status"]
          subtitle: string | null
          tags: string[]
          title: string
          updated_at: string
          video_url: string | null
          views_count: number
          author: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          external_link?: string | null
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          publish_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["post_status"]
          subtitle?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
          author?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          external_link?: string | null
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          publish_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["post_status"]
          subtitle?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
          author?: string | null
        }
        Relationships: []
      }
      cms_sections: {
        Row: {
          content_json: Json
          created_at: string
          id: string
          key: string
          title: string
          updated_at: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          id?: string
          key: string
          title: string
          updated_at?: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          id?: string
          key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
        }
        Relationships: []
      }
      job_offers: {
        Row: {
          application_email: string | null
          application_whatsapp: string | null
          auto_share: boolean
          company: string
          company_logo: string | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          cover_image: string | null
          created_at: string
          deadline: string | null
          description: string
          expires_at: string | null
          external_link: string | null
          featured_until: string | null
          id: string
          location_city: string | null
          location_country: string | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          publish_at: string | null
          published_at: string | null
          requirements: string | null
          salary: string | null
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          tags: string[]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          application_email?: string | null
          application_whatsapp?: string | null
          auto_share?: boolean
          company: string
          company_logo?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          cover_image?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          expires_at?: string | null
          external_link?: string | null
          featured_until?: string | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          publish_at?: string | null
          published_at?: string | null
          requirements?: string | null
          salary?: string | null
          slug: string
          status?: Database["public"]["Enums"]["job_status"]
          tags?: string[]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          application_email?: string | null
          application_whatsapp?: string | null
          auto_share?: boolean
          company?: string
          company_logo?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          cover_image?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          expires_at?: string | null
          external_link?: string | null
          featured_until?: string | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          publish_at?: string | null
          published_at?: string | null
          requirements?: string | null
          salary?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: number
          path: string
          referrer: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: number
          path: string
          referrer?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: number
          path?: string
          referrer?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string | null
          id: string
          image: string | null
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          specialty: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_jobs: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      publish_scheduled_jobs: { Args: never; Returns: number }
      publish_scheduled_posts: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      contract_type:
        | "cdi"
        | "cdd"
        | "stage"
        | "freelance"
        | "consultance"
        | "temps_partiel"
        | "interim"
      job_status: "draft" | "scheduled" | "published" | "archived" | "expired"
      message_status: "new" | "read" | "archived"
      post_status: "draft" | "published" | "archived"
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
      app_role: ["super_admin", "admin", "editor"],
      contract_type: [
        "cdi",
        "cdd",
        "stage",
        "freelance",
        "consultance",
        "temps_partiel",
        "interim",
      ],
      job_status: ["draft", "scheduled", "published", "archived", "expired"],
      message_status: ["new", "read", "archived"],
      post_status: ["draft", "published", "archived"],
    },
  },
} as const
