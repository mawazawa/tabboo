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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      canonical_fields: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          field_key: string
          field_label: string
          field_type: string
          id: string
          is_pii: boolean | null
          search_vector: unknown
          semantic_type: string | null
          subcategory: string | null
          updated_at: string | null
          validation_pattern: string | null
          validation_rules: Json | null
          vault_field_name: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          field_key: string
          field_label: string
          field_type: string
          id?: string
          is_pii?: boolean | null
          search_vector?: unknown
          semantic_type?: string | null
          subcategory?: string | null
          updated_at?: string | null
          validation_pattern?: string | null
          validation_rules?: Json | null
          vault_field_name?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          field_key?: string
          field_label?: string
          field_type?: string
          id?: string
          is_pii?: boolean | null
          search_vector?: unknown
          semantic_type?: string | null
          subcategory?: string | null
          updated_at?: string | null
          validation_pattern?: string | null
          validation_rules?: Json | null
          vault_field_name?: string | null
        }
        Relationships: []
      }
      form_field_mappings: {
        Row: {
          conditional_rule: Json | null
          created_at: string | null
          default_value: string | null
          depends_on_field_id: string | null
          field_height: number | null
          field_id: string
          field_width: number | null
          form_field_name: string
          form_id: string
          help_text: string | null
          id: string
          is_readonly: boolean | null
          is_required: boolean | null
          item_number: string | null
          last_used_at: string | null
          page_number: number
          placeholder_text: string | null
          position_left: number | null
          position_top: number | null
          section_name: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          conditional_rule?: Json | null
          created_at?: string | null
          default_value?: string | null
          depends_on_field_id?: string | null
          field_height?: number | null
          field_id: string
          field_width?: number | null
          form_field_name: string
          form_id: string
          help_text?: string | null
          id?: string
          is_readonly?: boolean | null
          is_required?: boolean | null
          item_number?: string | null
          last_used_at?: string | null
          page_number: number
          placeholder_text?: string | null
          position_left?: number | null
          position_top?: number | null
          section_name?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          conditional_rule?: Json | null
          created_at?: string | null
          default_value?: string | null
          depends_on_field_id?: string | null
          field_height?: number | null
          field_id?: string
          field_width?: number | null
          form_field_name?: string
          form_id?: string
          help_text?: string | null
          id?: string
          is_readonly?: boolean | null
          is_required?: boolean | null
          item_number?: string | null
          last_used_at?: string | null
          page_number?: number
          placeholder_text?: string | null
          position_left?: number | null
          position_top?: number | null
          section_name?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_field_mappings_depends_on_field_id_fkey"
            columns: ["depends_on_field_id"]
            isOneToOne: false
            referencedRelation: "canonical_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_field_mappings_depends_on_field_id_fkey"
            columns: ["depends_on_field_id"]
            isOneToOne: false
            referencedRelation: "field_reuse_analytics"
            referencedColumns: ["field_id"]
          },
          {
            foreignKeyName: "form_field_mappings_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "canonical_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_field_mappings_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "field_reuse_analytics"
            referencedColumns: ["field_id"]
          },
          {
            foreignKeyName: "form_field_mappings_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "form_completion_analytics"
            referencedColumns: ["form_id"]
          },
          {
            foreignKeyName: "form_field_mappings_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "judicial_council_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      judicial_council_forms: {
        Row: {
          complexity_level: string | null
          created_at: string | null
          description: string | null
          estimated_time_minutes: number | null
          filing_deadline_days: number | null
          filing_requirements: string | null
          form_name: string
          form_number: string
          form_pattern: string | null
          form_series: string
          id: string
          info_sheet_url: string | null
          is_current: boolean | null
          pdf_url: string | null
          related_code_sections: string[] | null
          reused_field_count: number | null
          revision_date: string | null
          supersedes_form_id: string | null
          total_field_count: number | null
          unique_field_count: number | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          complexity_level?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          filing_deadline_days?: number | null
          filing_requirements?: string | null
          form_name: string
          form_number: string
          form_pattern?: string | null
          form_series: string
          id?: string
          info_sheet_url?: string | null
          is_current?: boolean | null
          pdf_url?: string | null
          related_code_sections?: string[] | null
          reused_field_count?: number | null
          revision_date?: string | null
          supersedes_form_id?: string | null
          total_field_count?: number | null
          unique_field_count?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          complexity_level?: string | null
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          filing_deadline_days?: number | null
          filing_requirements?: string | null
          form_name?: string
          form_number?: string
          form_pattern?: string | null
          form_series?: string
          id?: string
          info_sheet_url?: string | null
          is_current?: boolean | null
          pdf_url?: string | null
          related_code_sections?: string[] | null
          reused_field_count?: number | null
          revision_date?: string | null
          supersedes_form_id?: string | null
          total_field_count?: number | null
          unique_field_count?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "judicial_council_forms_supersedes_form_id_fkey"
            columns: ["supersedes_form_id"]
            isOneToOne: false
            referencedRelation: "form_completion_analytics"
            referencedColumns: ["form_id"]
          },
          {
            foreignKeyName: "judicial_council_forms_supersedes_form_id_fkey"
            columns: ["supersedes_form_id"]
            isOneToOne: false
            referencedRelation: "judicial_council_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_info: {
        Row: {
          attorney_name: string | null
          bar_number: string | null
          city: string | null
          created_at: string | null
          email_address: string | null
          fax_no: string | null
          firm_name: string | null
          full_name: string | null
          id: string
          state: string | null
          street_address: string | null
          telephone_no: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          attorney_name?: string | null
          bar_number?: string | null
          city?: string | null
          created_at?: string | null
          email_address?: string | null
          fax_no?: string | null
          firm_name?: string | null
          full_name?: string | null
          id?: string
          state?: string | null
          street_address?: string | null
          telephone_no?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          attorney_name?: string | null
          bar_number?: string | null
          city?: string | null
          created_at?: string | null
          email_address?: string | null
          fax_no?: string | null
          firm_name?: string | null
          full_name?: string | null
          id?: string
          state?: string | null
          street_address?: string | null
          telephone_no?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      field_reuse_analytics: {
        Row: {
          analytics_generated_at: string | null
          category: string | null
          estimated_seconds_saved: number | null
          field_id: string | null
          field_key: string | null
          field_label: string | null
          field_type: string | null
          form_numbers: string | null
          form_series_list: string | null
          last_used_at: string | null
          reuse_category: string | null
          semantic_type: string | null
          total_occurrences: number | null
          used_in_form_count: number | null
        }
        Relationships: []
      }
      form_completion_analytics: {
        Row: {
          analytics_generated_at: string | null
          autofill_coverage_percentage: number | null
          autofillable_fields: number | null
          common_fields: number | null
          form_id: string | null
          form_name: string | null
          form_number: string | null
          form_pattern: string | null
          form_series: string | null
          reuse_percentage: number | null
          shared_fields: number | null
          total_fields: number | null
          total_seconds_saved: number | null
          unique_canonical_fields: number | null
          unique_fields: number | null
          universal_fields: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_field_reuse_summary: {
        Args: never
        Returns: {
          field_count: number
          percentage: number
          reuse_category: string
        }[]
      }
      get_top_reused_fields: {
        Args: { limit_count?: number }
        Returns: {
          field_key: string
          field_label: string
          field_type: string
          reuse_category: string
          used_in_forms: number
        }[]
      }
      refresh_field_analytics: { Args: never; Returns: undefined }
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
