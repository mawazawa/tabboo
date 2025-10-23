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
      analytics_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          session_id: string | null
          ttm_seconds: number | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          session_id?: string | null
          ttm_seconds?: number | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          session_id?: string | null
          ttm_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "upload_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          document_id: string | null
          id: string
          prompt_cache_key: string | null
          role: string
          tool_call_id: string | null
          tool_calls: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id?: string | null
          id?: string
          prompt_cache_key?: string | null
          role: string
          tool_call_id?: string | null
          tool_calls?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string | null
          id?: string
          prompt_cache_key?: string | null
          role?: string
          tool_call_id?: string | null
          tool_calls?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_batches: {
        Row: {
          created_at: string | null
          credits_purchased: number
          credits_remaining: number
          expiration_date: string
          id: string
          purchase_date: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_purchased: number
          credits_remaining: number
          expiration_date: string
          id?: string
          purchase_date?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_purchased?: number
          credits_remaining?: number
          expiration_date?: string
          id?: string
          purchase_date?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_credit_batches_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_vault_items: {
        Row: {
          created_at: string
          embedding: string | null
          extracted_metadata: Json | null
          extracted_text: string | null
          file_size_bytes: number | null
          file_type: string
          id: string
          ocr_provider: string | null
          ocr_status: string
          original_filename: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          extracted_metadata?: Json | null
          extracted_text?: string | null
          file_size_bytes?: number | null
          file_type: string
          id?: string
          ocr_provider?: string | null
          ocr_status?: string
          original_filename: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          embedding?: string | null
          extracted_metadata?: Json | null
          extracted_text?: string | null
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          ocr_provider?: string | null
          ocr_status?: string
          original_filename?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          change_summary: string | null
          content_snapshot: Json
          created_at: string
          document_id: string
          id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content_snapshot: Json
          created_at?: string
          document_id: string
          id?: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content_snapshot?: Json
          created_at?: string
          document_id?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_information: {
        Row: {
          confidence_score: number | null
          context: string | null
          created_at: string
          extracted_value: string
          id: string
          info_type: string
          vault_item_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          context?: string | null
          created_at?: string
          extracted_value: string
          id?: string
          info_type: string
          vault_item_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          context?: string | null
          created_at?: string
          extracted_value?: string
          id?: string
          info_type?: string
          vault_item_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_information_vault_item_fkey"
            columns: ["vault_item_id"]
            isOneToOne: false
            referencedRelation: "document_vault_items"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: Json
          created_at: string
          density_preference: string
          formatting_mode: string
          id: string
          metadata: Json | null
          thumbnail_urls: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          density_preference?: string
          formatting_mode?: string
          id?: string
          metadata?: Json | null
          thumbnail_urls?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          density_preference?: string
          formatting_mode?: string
          id?: string
          metadata?: Json | null
          thumbnail_urls?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          amount_refunded: number
          clerk_user_id: string
          created_at: string
          currency: string
          failure_code: string | null
          failure_message: string | null
          id: string
          metadata: Json | null
          payment_method_type: string | null
          receipt_url: string | null
          refund_reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          amount_refunded?: number
          clerk_user_id: string
          created_at?: string
          currency?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          metadata?: Json | null
          payment_method_type?: string | null
          receipt_url?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_refunded?: number
          clerk_user_id?: string
          created_at?: string
          currency?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          metadata?: Json | null
          payment_method_type?: string | null
          receipt_url?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_refunds: {
        Row: {
          amount_refunded: number
          created_at: string | null
          credits_deducted: number
          currency: string
          id: string
          metadata: Json | null
          reason: string | null
          refund_date: string | null
          stripe_refund_id: string
          transaction_id: string
        }
        Insert: {
          amount_refunded: number
          created_at?: string | null
          credits_deducted: number
          currency: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          refund_date?: string | null
          stripe_refund_id: string
          transaction_id: string
        }
        Update: {
          amount_refunded?: number
          created_at?: string | null
          credits_deducted?: number
          currency?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          refund_date?: string | null
          stripe_refund_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_refunds_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          credits_purchased: number
          currency: string
          id: string
          metadata: Json | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_purchased: number
          currency?: string
          id?: string
          metadata?: Json | null
          status: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_purchased?: number
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_data_vault_entries: {
        Row: {
          created_at: string
          encrypted_value: string
          encryption_key_id: string
          field_key: string
          id: string
          last_used_at: string | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_value: string
          encryption_key_id: string
          field_key: string
          id?: string
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_value?: string
          encryption_key_id?: string
          field_key?: string
          id?: string
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      personal_info: {
        Row: {
          attorney_name: string | null
          bar_number: string | null
          city: string | null
          created_at: string
          email_address: string | null
          fax_no: string | null
          firm_name: string | null
          full_name: string | null
          id: string
          state: string | null
          street_address: string | null
          telephone_no: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          attorney_name?: string | null
          bar_number?: string | null
          city?: string | null
          created_at?: string
          email_address?: string | null
          fax_no?: string | null
          firm_name?: string | null
          full_name?: string | null
          id?: string
          state?: string | null
          street_address?: string | null
          telephone_no?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          attorney_name?: string | null
          bar_number?: string | null
          city?: string | null
          created_at?: string
          email_address?: string | null
          fax_no?: string | null
          firm_name?: string | null
          full_name?: string | null
          id?: string
          state?: string | null
          street_address?: string | null
          telephone_no?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          clerk_user_id: string
          created_at: string
          id: string
          ineligibility_reason: string | null
          is_eligible: boolean
          metadata: Json | null
          processed_at: string | null
          processed_by: string | null
          reason: Database["public"]["Enums"]["refund_reason"]
          refund_amount: number | null
          refund_currency: string | null
          requested_at: string
          status: Database["public"]["Enums"]["refund_request_status"]
          stripe_refund_id: string | null
          subscription_id: string
          updated_at: string
          user_feedback: string | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          id?: string
          ineligibility_reason?: string | null
          is_eligible: boolean
          metadata?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          reason: Database["public"]["Enums"]["refund_reason"]
          refund_amount?: number | null
          refund_currency?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["refund_request_status"]
          stripe_refund_id?: string | null
          subscription_id: string
          updated_at?: string
          user_feedback?: string | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          id?: string
          ineligibility_reason?: string | null
          is_eligible?: boolean
          metadata?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: Database["public"]["Enums"]["refund_reason"]
          refund_amount?: number | null
          refund_currency?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["refund_request_status"]
          stripe_refund_id?: string | null
          subscription_id?: string
          updated_at?: string
          user_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      restoration_results: {
        Row: {
          cdn_cached: boolean
          created_at: string
          deep_link: string
          gif_url: string
          id: string
          og_card_url: string
          restored_url: string
          session_id: string
          watermark_applied: boolean
        }
        Insert: {
          cdn_cached?: boolean
          created_at?: string
          deep_link: string
          gif_url: string
          id?: string
          og_card_url: string
          restored_url: string
          session_id: string
          watermark_applied?: boolean
        }
        Update: {
          cdn_cached?: boolean
          created_at?: string
          deep_link?: string
          gif_url?: string
          id?: string
          og_card_url?: string
          restored_url?: string
          session_id?: string
          watermark_applied?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "restoration_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "upload_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          processing_status: string
          retry_count: number
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          processing_status: string
          retry_count?: number
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_status?: string
          retry_count?: number
        }
        Relationships: []
      }
      subscription_changes: {
        Row: {
          change_type: Database["public"]["Enums"]["change_type"]
          changed_at: string
          clerk_user_id: string
          id: string
          metadata: Json | null
          new_price_id: string | null
          new_status: Database["public"]["Enums"]["subscription_status"] | null
          new_tier: Database["public"]["Enums"]["subscription_tier"] | null
          previous_price_id: string | null
          previous_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          previous_tier: Database["public"]["Enums"]["subscription_tier"] | null
          proration_amount: number | null
          reason: string | null
          subscription_id: string
          triggered_by: string
        }
        Insert: {
          change_type: Database["public"]["Enums"]["change_type"]
          changed_at?: string
          clerk_user_id: string
          id?: string
          metadata?: Json | null
          new_price_id?: string | null
          new_status?: Database["public"]["Enums"]["subscription_status"] | null
          new_tier?: Database["public"]["Enums"]["subscription_tier"] | null
          previous_price_id?: string | null
          previous_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          previous_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          proration_amount?: number | null
          reason?: string | null
          subscription_id: string
          triggered_by: string
        }
        Update: {
          change_type?: Database["public"]["Enums"]["change_type"]
          changed_at?: string
          clerk_user_id?: string
          id?: string
          metadata?: Json | null
          new_price_id?: string | null
          new_status?: Database["public"]["Enums"]["subscription_status"] | null
          new_tier?: Database["public"]["Enums"]["subscription_tier"] | null
          previous_price_id?: string | null
          previous_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          previous_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          proration_amount?: number | null
          reason?: string | null
          subscription_id?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_changes_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_sessions: {
        Row: {
          created_at: string
          id: string
          original_url: string
          retry_count: number
          status: Database["public"]["Enums"]["session_status"]
          ttl_expires_at: string
          user_fingerprint: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_url: string
          retry_count?: number
          status?: Database["public"]["Enums"]["session_status"]
          ttl_expires_at?: string
          user_fingerprint: string
        }
        Update: {
          created_at?: string
          id?: string
          original_url?: string
          retry_count?: number
          status?: Database["public"]["Enums"]["session_status"]
          ttl_expires_at?: string
          user_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_sessions_user_fingerprint_fkey"
            columns: ["user_fingerprint"]
            isOneToOne: false
            referencedRelation: "user_quota"
            referencedColumns: ["fingerprint"]
          },
        ]
      }
      user_credits: {
        Row: {
          created_at: string
          credits_balance: number
          credits_expired: number
          credits_purchased: number
          credits_used: number
          fingerprint: string
          id: string
          last_purchase_at: string | null
          stripe_customer_id: string | null
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          credits_expired?: number
          credits_purchased?: number
          credits_used?: number
          fingerprint: string
          id?: string
          last_purchase_at?: string | null
          stripe_customer_id?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          credits_expired?: number
          credits_purchased?: number
          credits_used?: number
          fingerprint?: string
          id?: string
          last_purchase_at?: string | null
          stripe_customer_id?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          ai_assistant_enabled: boolean | null
          ai_auto_format_enabled: boolean | null
          created_at: string
          default_density_mode: string
          default_formatting_mode: string
          sidebar_collapsed: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_assistant_enabled?: boolean | null
          ai_auto_format_enabled?: boolean | null
          created_at?: string
          default_density_mode?: string
          default_formatting_mode?: string
          sidebar_collapsed?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_assistant_enabled?: boolean | null
          ai_auto_format_enabled?: boolean | null
          created_at?: string
          default_density_mode?: string
          default_formatting_mode?: string
          sidebar_collapsed?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quota: {
        Row: {
          created_at: string
          fingerprint: string
          last_restore_at: string | null
          restore_count: number
        }
        Insert: {
          created_at?: string
          fingerprint: string
          last_restore_at?: string | null
          restore_count?: number
        }
        Update: {
          created_at?: string
          fingerprint?: string
          last_restore_at?: string | null
          restore_count?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          clerk_user_id: string
          created_at: string
          currency: string
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          price_id: string
          refund_eligible_until: string
          refund_requested_at: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_started_at: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          unit_amount: number
          updated_at: string
        }
        Insert: {
          billing_interval: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          clerk_user_id: string
          created_at?: string
          currency?: string
          current_period_end: string
          current_period_start: string
          id?: string
          metadata?: Json | null
          price_id: string
          refund_eligible_until: string
          refund_requested_at?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_started_at?: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          unit_amount: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          clerk_user_id?: string
          created_at?: string
          currency?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          price_id?: string
          refund_eligible_until?: string
          refund_requested_at?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string
          stripe_subscription_id?: string
          subscription_started_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          unit_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits:
        | {
            Args: {
              p_credits_to_add: number
              p_fingerprint: string
              p_stripe_customer_id?: string
              p_user_id: string
            }
            Returns: {
              new_balance: number
              success: boolean
            }[]
          }
        | {
            Args: {
              p_credits_to_add: number
              p_transaction_id: string
              p_user_id: string
            }
            Returns: Json
          }
      check_quota: {
        Args: { user_fingerprint: string }
        Returns: {
          last_restore_at: string
          limit_value: number
          remaining: number
          requires_upgrade: boolean
          upgrade_url: string
        }[]
      }
      cleanup_expired_sessions: {
        Args: never
        Returns: {
          cleanup_timestamp: string
          deleted_count: number
        }[]
      }
      consume_credit: {
        Args: { p_fingerprint: string; p_user_id: string }
        Returns: {
          remaining_balance: number
          success: boolean
        }[]
      }
      deduct_credit: { Args: { p_user_id: string }; Returns: Json }
      expire_credits: { Args: never; Returns: Json }
      get_credit_balance: {
        Args: { p_fingerprint: string; p_user_id: string }
        Returns: number
      }
      process_refund: {
        Args: {
          p_amount_refunded: number
          p_currency: string
          p_stripe_refund_id: string
          p_transaction_id: string
        }
        Returns: Json
      }
      search_document_vault: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          user_id_param: string
        }
        Returns: {
          extracted_text: string
          id: string
          original_filename: string
          similarity: number
        }[]
      }
    }
    Enums: {
      change_type:
        | "created"
        | "upgraded"
        | "downgraded"
        | "canceled"
        | "reactivated"
        | "refunded"
        | "payment_failed"
        | "payment_succeeded"
        | "renewed"
      event_type:
        | "upload_start"
        | "restore_complete"
        | "share_click"
        | "upgrade_view"
      payment_status:
        | "succeeded"
        | "processing"
        | "requires_action"
        | "requires_capture"
        | "requires_confirmation"
        | "requires_payment_method"
        | "failed"
        | "canceled"
        | "refunded"
        | "partially_refunded"
      refund_reason:
        | "not_as_expected"
        | "found_alternative"
        | "too_expensive"
        | "technical_issues"
        | "missing_features"
        | "too_complex"
        | "no_longer_needed"
        | "other"
      refund_request_status:
        | "pending"
        | "approved"
        | "completed"
        | "rejected"
        | "failed"
      session_status: "pending" | "processing" | "complete" | "failed"
      subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "trialing"
        | "unpaid"
        | "refunded"
      subscription_tier: "basic" | "professional" | "enterprise"
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
      change_type: [
        "created",
        "upgraded",
        "downgraded",
        "canceled",
        "reactivated",
        "refunded",
        "payment_failed",
        "payment_succeeded",
        "renewed",
      ],
      event_type: [
        "upload_start",
        "restore_complete",
        "share_click",
        "upgrade_view",
      ],
      payment_status: [
        "succeeded",
        "processing",
        "requires_action",
        "requires_capture",
        "requires_confirmation",
        "requires_payment_method",
        "failed",
        "canceled",
        "refunded",
        "partially_refunded",
      ],
      refund_reason: [
        "not_as_expected",
        "found_alternative",
        "too_expensive",
        "technical_issues",
        "missing_features",
        "too_complex",
        "no_longer_needed",
        "other",
      ],
      refund_request_status: [
        "pending",
        "approved",
        "completed",
        "rejected",
        "failed",
      ],
      session_status: ["pending", "processing", "complete", "failed"],
      subscription_status: [
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "unpaid",
        "refunded",
      ],
      subscription_tier: ["basic", "professional", "enterprise"],
    },
  },
} as const
