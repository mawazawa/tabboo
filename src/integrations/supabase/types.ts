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
      _CategoryToRule: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_CategoryToRule_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_CategoryToRule_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "Rule"
            referencedColumns: ["id"]
          },
        ]
      }
      Account: {
        Row: {
          access_token: string | null
          createdAt: string
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          updatedAt: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          createdAt?: string
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          updatedAt: string
          userId: string
        }
        Update: {
          access_token?: string | null
          createdAt?: string
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ApiKey: {
        Row: {
          createdAt: string
          id: string
          key: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          key: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          key?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ApiKey_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Bill: {
        Row: {
          caseId: string
          createdAt: string
          endDate: string
          id: string
          startDate: string
          status: string
          total: number
          updatedAt: string
        }
        Insert: {
          caseId: string
          createdAt?: string
          endDate: string
          id: string
          startDate: string
          status?: string
          total?: number
          updatedAt: string
        }
        Update: {
          caseId?: string
          createdAt?: string
          endDate?: string
          id?: string
          startDate?: string
          status?: string
          total?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Bill_caseId_fkey"
            columns: ["caseId"]
            isOneToOne: false
            referencedRelation: "Case"
            referencedColumns: ["id"]
          },
        ]
      }
      BillLineItem: {
        Row: {
          billId: string
          createdAt: string
          date: string
          description: string
          hours: number
          id: string
          rate: number
          sourceEventId: string | null
          total: number
        }
        Insert: {
          billId: string
          createdAt?: string
          date: string
          description: string
          hours: number
          id: string
          rate: number
          sourceEventId?: string | null
          total: number
        }
        Update: {
          billId?: string
          createdAt?: string
          date?: string
          description?: string
          hours?: number
          id?: string
          rate?: number
          sourceEventId?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "BillLineItem_billId_fkey"
            columns: ["billId"]
            isOneToOne: false
            referencedRelation: "Bill"
            referencedColumns: ["id"]
          },
        ]
      }
      Calendar: {
        Row: {
          connectionId: string
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          connectionId: string
          createdAt?: string
          id: string
          name: string
          updatedAt: string
        }
        Update: {
          connectionId?: string
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Calendar_connectionId_fkey"
            columns: ["connectionId"]
            isOneToOne: false
            referencedRelation: "CalendarConnection"
            referencedColumns: ["id"]
          },
        ]
      }
      CalendarConnection: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          createdAt: string
          emailAccountId: string
          id: string
          provider: Database["public"]["Enums"]["CalendarProvider"]
          refreshToken: string | null
          updatedAt: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          createdAt?: string
          emailAccountId: string
          id: string
          provider: Database["public"]["Enums"]["CalendarProvider"]
          refreshToken?: string | null
          updatedAt: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          createdAt?: string
          emailAccountId?: string
          id?: string
          provider?: Database["public"]["Enums"]["CalendarProvider"]
          refreshToken?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "CalendarConnection_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      Case: {
        Row: {
          attorneyId: string
          caseName: string
          caseNumber: string
          createdAt: string
          description: string | null
          id: string
          status: string
          updatedAt: string
        }
        Insert: {
          attorneyId: string
          caseName: string
          caseNumber: string
          createdAt?: string
          description?: string | null
          id: string
          status?: string
          updatedAt: string
        }
        Update: {
          attorneyId?: string
          caseName?: string
          caseNumber?: string
          createdAt?: string
          description?: string | null
          id?: string
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Case_attorneyId_fkey"
            columns: ["attorneyId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Category: {
        Row: {
          createdAt: string
          description: string | null
          emailAccountId: string
          filterJson: string | null
          filterType: Database["public"]["Enums"]["CategoryFilterType"]
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          emailAccountId: string
          filterJson?: string | null
          filterType?: Database["public"]["Enums"]["CategoryFilterType"]
          id: string
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          emailAccountId?: string
          filterJson?: string | null
          filterType?: Database["public"]["Enums"]["CategoryFilterType"]
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Category_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      Chat: {
        Row: {
          createdAt: string
          emailAccountId: string
          id: string
          status: Database["public"]["Enums"]["ChatStatus"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          emailAccountId: string
          id: string
          status?: Database["public"]["Enums"]["ChatStatus"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          emailAccountId?: string
          id?: string
          status?: Database["public"]["Enums"]["ChatStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Chat_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      ChatMessage: {
        Row: {
          chatId: string
          content: string
          createdAt: string
          id: string
          role: string
          updatedAt: string
        }
        Insert: {
          chatId: string
          content: string
          createdAt?: string
          id: string
          role: string
          updatedAt: string
        }
        Update: {
          chatId?: string
          content?: string
          createdAt?: string
          id?: string
          role?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChatMessage_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
        ]
      }
      CleanupJob: {
        Row: {
          action: Database["public"]["Enums"]["CleanAction"]
          createdAt: string
          emailAccountId: string
          filterJson: string | null
          id: string
          rule: string | null
          scheduledAt: string
          status: Database["public"]["Enums"]["ScheduledActionStatus"]
          updatedAt: string
        }
        Insert: {
          action: Database["public"]["Enums"]["CleanAction"]
          createdAt?: string
          emailAccountId: string
          filterJson?: string | null
          id: string
          rule?: string | null
          scheduledAt: string
          status?: Database["public"]["Enums"]["ScheduledActionStatus"]
          updatedAt: string
        }
        Update: {
          action?: Database["public"]["Enums"]["CleanAction"]
          createdAt?: string
          emailAccountId?: string
          filterJson?: string | null
          id?: string
          rule?: string | null
          scheduledAt?: string
          status?: Database["public"]["Enums"]["ScheduledActionStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "CleanupJob_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      CleanupThread: {
        Row: {
          createdAt: string
          emailAccountId: string
          id: string
          jobId: string
          threadId: string
        }
        Insert: {
          createdAt?: string
          emailAccountId: string
          id: string
          jobId: string
          threadId: string
        }
        Update: {
          createdAt?: string
          emailAccountId?: string
          id?: string
          jobId?: string
          threadId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CleanupThread_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CleanupThread_jobId_fkey"
            columns: ["jobId"]
            isOneToOne: false
            referencedRelation: "CleanupJob"
            referencedColumns: ["id"]
          },
        ]
      }
      ColdEmail: {
        Row: {
          createdAt: string
          email: string
          emailAccountId: string
          id: string
          status: Database["public"]["Enums"]["ColdEmailStatus"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          emailAccountId: string
          id: string
          status?: Database["public"]["Enums"]["ColdEmailStatus"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailAccountId?: string
          id?: string
          status?: Database["public"]["Enums"]["ColdEmailStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ColdEmail_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      DraftSendLog: {
        Row: {
          createdAt: string
          executedActionId: string
          id: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          executedActionId: string
          id: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          executedActionId?: string
          id?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "DraftSendLog_executedActionId_fkey"
            columns: ["executedActionId"]
            isOneToOne: false
            referencedRelation: "ExecutedAction"
            referencedColumns: ["id"]
          },
        ]
      }
      EmailAccount: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          active: boolean
          createdAt: string
          email: string
          forwardingAddress: string | null
          gmailHistoryId: string | null
          id: string
          lastCalendarSyncAt: string | null
          lastEmailSyncAt: string | null
          lastSyncAt: string | null
          name: string | null
          refreshToken: string | null
          type: Database["public"]["Enums"]["EmailAccountType"]
          updatedAt: string
          userId: string
          xOAuth: string | null
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          active?: boolean
          createdAt?: string
          email: string
          forwardingAddress?: string | null
          gmailHistoryId?: string | null
          id: string
          lastCalendarSyncAt?: string | null
          lastEmailSyncAt?: string | null
          lastSyncAt?: string | null
          name?: string | null
          refreshToken?: string | null
          type: Database["public"]["Enums"]["EmailAccountType"]
          updatedAt: string
          userId: string
          xOAuth?: string | null
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          active?: boolean
          createdAt?: string
          email?: string
          forwardingAddress?: string | null
          gmailHistoryId?: string | null
          id?: string
          lastCalendarSyncAt?: string | null
          lastEmailSyncAt?: string | null
          lastSyncAt?: string | null
          name?: string | null
          refreshToken?: string | null
          type?: Database["public"]["Enums"]["EmailAccountType"]
          updatedAt?: string
          userId?: string
          xOAuth?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "EmailAccount_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      EmailMessage: {
        Row: {
          attachmentsJson: string | null
          bcc: string | null
          bodyHtml: string | null
          bodySnippet: string | null
          bodyText: string | null
          cc: string | null
          createdAt: string
          date: string
          emailAccountId: string
          folderId: string | null
          from: string | null
          headersJson: string | null
          id: string
          labelIds: string | null
          messageId: string
          seen: boolean
          size: number | null
          subject: string | null
          threadId: string
          to: string | null
          updatedAt: string
        }
        Insert: {
          attachmentsJson?: string | null
          bcc?: string | null
          bodyHtml?: string | null
          bodySnippet?: string | null
          bodyText?: string | null
          cc?: string | null
          createdAt?: string
          date: string
          emailAccountId: string
          folderId?: string | null
          from?: string | null
          headersJson?: string | null
          id: string
          labelIds?: string | null
          messageId: string
          seen?: boolean
          size?: number | null
          subject?: string | null
          threadId: string
          to?: string | null
          updatedAt: string
        }
        Update: {
          attachmentsJson?: string | null
          bcc?: string | null
          bodyHtml?: string | null
          bodySnippet?: string | null
          bodyText?: string | null
          cc?: string | null
          createdAt?: string
          date?: string
          emailAccountId?: string
          folderId?: string | null
          from?: string | null
          headersJson?: string | null
          id?: string
          labelIds?: string | null
          messageId?: string
          seen?: boolean
          size?: number | null
          subject?: string | null
          threadId?: string
          to?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "EmailMessage_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      EmailToken: {
        Row: {
          createdAt: string
          email: string
          emailAccountId: string
          expires: string
          id: string
          token: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          emailAccountId: string
          expires: string
          id: string
          token: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailAccountId?: string
          expires?: string
          id?: string
          token?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "EmailToken_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      ExecutedAction: {
        Row: {
          attachments: string | null
          bcc: string | null
          body: string | null
          bodyHtml: string | null
          bodyText: string | null
          cc: string | null
          createdAt: string
          executedRuleId: string
          id: string
          label: string | null
          messageId: string
          subject: string | null
          threadId: string | null
          to: string | null
          type: Database["public"]["Enums"]["ActionType"]
          updatedAt: string
          webhookBody: string | null
          webhookUrl: string | null
        }
        Insert: {
          attachments?: string | null
          bcc?: string | null
          body?: string | null
          bodyHtml?: string | null
          bodyText?: string | null
          cc?: string | null
          createdAt?: string
          executedRuleId: string
          id: string
          label?: string | null
          messageId: string
          subject?: string | null
          threadId?: string | null
          to?: string | null
          type: Database["public"]["Enums"]["ActionType"]
          updatedAt: string
          webhookBody?: string | null
          webhookUrl?: string | null
        }
        Update: {
          attachments?: string | null
          bcc?: string | null
          body?: string | null
          bodyHtml?: string | null
          bodyText?: string | null
          cc?: string | null
          createdAt?: string
          executedRuleId?: string
          id?: string
          label?: string | null
          messageId?: string
          subject?: string | null
          threadId?: string | null
          to?: string | null
          type?: Database["public"]["Enums"]["ActionType"]
          updatedAt?: string
          webhookBody?: string | null
          webhookUrl?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ExecutedAction_executedRuleId_fkey"
            columns: ["executedRuleId"]
            isOneToOne: false
            referencedRelation: "ExecutedRule"
            referencedColumns: ["id"]
          },
        ]
      }
      ExecutedRule: {
        Row: {
          createdAt: string
          emailAccountId: string
          id: string
          messageId: string
          ruleId: string | null
          status: Database["public"]["Enums"]["ExecutedRuleStatus"]
          threadId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          emailAccountId: string
          id: string
          messageId: string
          ruleId?: string | null
          status?: Database["public"]["Enums"]["ExecutedRuleStatus"]
          threadId?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          emailAccountId?: string
          id?: string
          messageId?: string
          ruleId?: string | null
          status?: Database["public"]["Enums"]["ExecutedRuleStatus"]
          threadId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ExecutedRule_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ExecutedRule_ruleId_fkey"
            columns: ["ruleId"]
            isOneToOne: false
            referencedRelation: "Rule"
            referencedColumns: ["id"]
          },
        ]
      }
      Group: {
        Row: {
          createdAt: string
          emailAccountId: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          emailAccountId: string
          id: string
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          emailAccountId?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Group_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      GroupItem: {
        Row: {
          createdAt: string
          groupId: string
          id: string
          type: Database["public"]["Enums"]["GroupItemType"]
          value: string
        }
        Insert: {
          createdAt?: string
          groupId: string
          id: string
          type: Database["public"]["Enums"]["GroupItemType"]
          value: string
        }
        Update: {
          createdAt?: string
          groupId?: string
          id?: string
          type?: Database["public"]["Enums"]["GroupItemType"]
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "GroupItem_groupId_fkey"
            columns: ["groupId"]
            isOneToOne: false
            referencedRelation: "Group"
            referencedColumns: ["id"]
          },
        ]
      }
      Knowledge: {
        Row: {
          content: string
          createdAt: string
          emailAccountId: string
          id: string
          updatedAt: string
        }
        Insert: {
          content: string
          createdAt?: string
          emailAccountId: string
          id: string
          updatedAt: string
        }
        Update: {
          content?: string
          createdAt?: string
          emailAccountId?: string
          id?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Knowledge_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
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
      McpConnection: {
        Row: {
          createdAt: string
          description: string | null
          emailAccountId: string
          id: string
          integrationId: string
          isEnabled: boolean
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          emailAccountId: string
          id: string
          integrationId: string
          isEnabled?: boolean
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          emailAccountId?: string
          id?: string
          integrationId?: string
          isEnabled?: boolean
          name?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "McpConnection_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "McpConnection_integrationId_fkey"
            columns: ["integrationId"]
            isOneToOne: false
            referencedRelation: "McpIntegration"
            referencedColumns: ["id"]
          },
        ]
      }
      McpIntegration: {
        Row: {
          authHeader: string | null
          createdAt: string
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["McpIntegrationType"]
          updatedAt: string
          url: string | null
        }
        Insert: {
          authHeader?: string | null
          createdAt?: string
          description?: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["McpIntegrationType"]
          updatedAt: string
          url?: string | null
        }
        Update: {
          authHeader?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["McpIntegrationType"]
          updatedAt?: string
          url?: string | null
        }
        Relationships: []
      }
      McpTool: {
        Row: {
          connectionId: string
          createdAt: string
          description: string | null
          id: string
          isEnabled: boolean
          name: string
          schema: string | null
          updatedAt: string
        }
        Insert: {
          connectionId: string
          createdAt?: string
          description?: string | null
          id: string
          isEnabled?: boolean
          name: string
          schema?: string | null
          updatedAt: string
        }
        Update: {
          connectionId?: string
          createdAt?: string
          description?: string | null
          id?: string
          isEnabled?: boolean
          name?: string
          schema?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "McpTool_connectionId_fkey"
            columns: ["connectionId"]
            isOneToOne: false
            referencedRelation: "McpConnection"
            referencedColumns: ["id"]
          },
        ]
      }
      Newsletter: {
        Row: {
          categoryId: string | null
          createdAt: string
          email: string
          emailAccountId: string
          id: string
          status: Database["public"]["Enums"]["NewsletterStatus"]
          updatedAt: string
        }
        Insert: {
          categoryId?: string | null
          createdAt?: string
          email: string
          emailAccountId: string
          id: string
          status?: Database["public"]["Enums"]["NewsletterStatus"]
          updatedAt: string
        }
        Update: {
          categoryId?: string | null
          createdAt?: string
          email?: string
          emailAccountId?: string
          id?: string
          status?: Database["public"]["Enums"]["NewsletterStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Newsletter_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Newsletter_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      Payment: {
        Row: {
          amount: number
          createdAt: string
          currency: string
          id: string
          premiumId: string | null
          provider: Database["public"]["Enums"]["PaymentProvider"]
          providerPaymentId: string | null
          status: Database["public"]["Enums"]["PaymentStatus"]
          type: Database["public"]["Enums"]["PaymentType"]
          updatedAt: string
          userId: string
        }
        Insert: {
          amount: number
          createdAt?: string
          currency: string
          id: string
          premiumId?: string | null
          provider: Database["public"]["Enums"]["PaymentProvider"]
          providerPaymentId?: string | null
          status: Database["public"]["Enums"]["PaymentStatus"]
          type: Database["public"]["Enums"]["PaymentType"]
          updatedAt: string
          userId: string
        }
        Update: {
          amount?: number
          createdAt?: string
          currency?: string
          id?: string
          premiumId?: string | null
          provider?: Database["public"]["Enums"]["PaymentProvider"]
          providerPaymentId?: string | null
          status?: Database["public"]["Enums"]["PaymentStatus"]
          type?: Database["public"]["Enums"]["PaymentType"]
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_premiumId_fkey"
            columns: ["premiumId"]
            isOneToOne: false
            referencedRelation: "Premium"
            referencedColumns: ["id"]
          },
        ]
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
      Premium: {
        Row: {
          aiMessages: number
          createdAt: string
          credits: number
          currency: string
          features: string | null
          id: string
          interval: string
          name: string
          price: number
          tier: Database["public"]["Enums"]["PremiumTier"]
          updatedAt: string
        }
        Insert: {
          aiMessages?: number
          createdAt?: string
          credits?: number
          currency: string
          features?: string | null
          id: string
          interval: string
          name: string
          price: number
          tier: Database["public"]["Enums"]["PremiumTier"]
          updatedAt: string
        }
        Update: {
          aiMessages?: number
          createdAt?: string
          credits?: number
          currency?: string
          features?: string | null
          id?: string
          interval?: string
          name?: string
          price?: number
          tier?: Database["public"]["Enums"]["PremiumTier"]
          updatedAt?: string
        }
        Relationships: []
      }
      Referral: {
        Row: {
          createdAt: string
          id: string
          referredUserId: string | null
          referrerUserId: string | null
          status: Database["public"]["Enums"]["ReferralStatus"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          referredUserId?: string | null
          referrerUserId?: string | null
          status?: Database["public"]["Enums"]["ReferralStatus"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          referredUserId?: string | null
          referrerUserId?: string | null
          status?: Database["public"]["Enums"]["ReferralStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Referral_referredUserId_fkey"
            columns: ["referredUserId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Referral_referrerUserId_fkey"
            columns: ["referrerUserId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Rule: {
        Row: {
          actionType: Database["public"]["Enums"]["RuleActionType"]
          aiInstructions: string | null
          automated: boolean
          categoryId: string | null
          createdAt: string
          filterJson: string | null
          id: string
          includeNewsletters: boolean
          instructions: string | null
          name: string
          runOnThreads: boolean
          status: Database["public"]["Enums"]["RuleStatus"]
          triggerType: Database["public"]["Enums"]["RuleTriggerType"]
          type: Database["public"]["Enums"]["RuleType"]
          updatedAt: string
          userId: string
        }
        Insert: {
          actionType?: Database["public"]["Enums"]["RuleActionType"]
          aiInstructions?: string | null
          automated?: boolean
          categoryId?: string | null
          createdAt?: string
          filterJson?: string | null
          id: string
          includeNewsletters?: boolean
          instructions?: string | null
          name: string
          runOnThreads?: boolean
          status?: Database["public"]["Enums"]["RuleStatus"]
          triggerType?: Database["public"]["Enums"]["RuleTriggerType"]
          type?: Database["public"]["Enums"]["RuleType"]
          updatedAt: string
          userId: string
        }
        Update: {
          actionType?: Database["public"]["Enums"]["RuleActionType"]
          aiInstructions?: string | null
          automated?: boolean
          categoryId?: string | null
          createdAt?: string
          filterJson?: string | null
          id?: string
          includeNewsletters?: boolean
          instructions?: string | null
          name?: string
          runOnThreads?: boolean
          status?: Database["public"]["Enums"]["RuleStatus"]
          triggerType?: Database["public"]["Enums"]["RuleTriggerType"]
          type?: Database["public"]["Enums"]["RuleType"]
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Rule_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Rule_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ScheduledAction: {
        Row: {
          createdAt: string
          emailAccountId: string
          executedActionId: string | null
          executedRuleId: string | null
          id: string
          messageId: string
          scheduledAt: string
          status: Database["public"]["Enums"]["ScheduledActionStatus"]
          threadId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          emailAccountId: string
          executedActionId?: string | null
          executedRuleId?: string | null
          id: string
          messageId: string
          scheduledAt: string
          status?: Database["public"]["Enums"]["ScheduledActionStatus"]
          threadId?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          emailAccountId?: string
          executedActionId?: string | null
          executedRuleId?: string | null
          id?: string
          messageId?: string
          scheduledAt?: string
          status?: Database["public"]["Enums"]["ScheduledActionStatus"]
          threadId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ScheduledAction_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ScheduledAction_executedActionId_fkey"
            columns: ["executedActionId"]
            isOneToOne: false
            referencedRelation: "ExecutedAction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ScheduledAction_executedRuleId_fkey"
            columns: ["executedRuleId"]
            isOneToOne: false
            referencedRelation: "ExecutedRule"
            referencedColumns: ["id"]
          },
        ]
      }
      Session: {
        Row: {
          createdAt: string
          expires: string
          id: string
          sessionToken: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expires: string
          id: string
          sessionToken: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          expires?: string
          id?: string
          sessionToken?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ThreadTracker: {
        Row: {
          createdAt: string
          emailAccountId: string
          id: string
          threadId: string
          type: Database["public"]["Enums"]["ThreadTrackerType"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          emailAccountId: string
          id: string
          threadId: string
          type: Database["public"]["Enums"]["ThreadTrackerType"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          emailAccountId?: string
          id?: string
          threadId?: string
          type?: Database["public"]["Enums"]["ThreadTrackerType"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ThreadTracker_emailAccountId_fkey"
            columns: ["emailAccountId"]
            isOneToOne: false
            referencedRelation: "EmailAccount"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          about: string | null
          aiInstructions: string | null
          aiModel: Database["public"]["Enums"]["AiModel"]
          aiProvider: Database["public"]["Enums"]["AiProvider"]
          anthropicApiKey: string | null
          classificationModel: Database["public"]["Enums"]["AiModel"]
          completionModel: Database["public"]["Enums"]["AiModel"]
          createdAt: string
          defaultEmailAccountId: string | null
          email: string
          emailVerified: string | null
          embeddingModel: Database["public"]["Enums"]["AiModel"]
          googleApiKey: string | null
          id: string
          image: string | null
          name: string | null
          openaiApiKey: string | null
          prompt: string | null
          timezone: string | null
          updatedAt: string
        }
        Insert: {
          about?: string | null
          aiInstructions?: string | null
          aiModel?: Database["public"]["Enums"]["AiModel"]
          aiProvider?: Database["public"]["Enums"]["AiProvider"]
          anthropicApiKey?: string | null
          classificationModel?: Database["public"]["Enums"]["AiModel"]
          completionModel?: Database["public"]["Enums"]["AiModel"]
          createdAt?: string
          defaultEmailAccountId?: string | null
          email: string
          emailVerified?: string | null
          embeddingModel?: Database["public"]["Enums"]["AiModel"]
          googleApiKey?: string | null
          id: string
          image?: string | null
          name?: string | null
          openaiApiKey?: string | null
          prompt?: string | null
          timezone?: string | null
          updatedAt: string
        }
        Update: {
          about?: string | null
          aiInstructions?: string | null
          aiModel?: Database["public"]["Enums"]["AiModel"]
          aiProvider?: Database["public"]["Enums"]["AiProvider"]
          anthropicApiKey?: string | null
          classificationModel?: Database["public"]["Enums"]["AiModel"]
          completionModel?: Database["public"]["Enums"]["AiModel"]
          createdAt?: string
          defaultEmailAccountId?: string | null
          email?: string
          emailVerified?: string | null
          embeddingModel?: Database["public"]["Enums"]["AiModel"]
          googleApiKey?: string | null
          id?: string
          image?: string | null
          name?: string | null
          openaiApiKey?: string | null
          prompt?: string | null
          timezone?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      VerificationToken: {
        Row: {
          createdAt: string
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          createdAt?: string
          expires: string
          identifier: string
          token: string
        }
        Update: {
          createdAt?: string
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ActionType:
        | "ARCHIVE"
        | "LABEL"
        | "REPLY"
        | "SEND_EMAIL"
        | "FORWARD"
        | "DRAFT_EMAIL"
        | "MARK_SPAM"
        | "CALL_WEBHOOK"
        | "MARK_READ"
        | "DIGEST"
        | "MOVE_FOLDER"
      AiModel: "GPT_4O" | "GPT_4O_MINI" | "GPT_4_TURBO" | "GPT_3_5_TURBO"
      AiProvider: "OPENAI" | "ANTHROPIC" | "GOOGLE"
      CalendarProvider: "GOOGLE" | "OUTLOOK"
      CategoryFilterType: "INCLUDE" | "EXCLUDE"
      ChatStatus: "ACTIVE" | "PAUSED" | "COMPLETED"
      CleanAction: "ARCHIVE" | "MARK_READ"
      ColdEmailSetting:
        | "DISABLED"
        | "LIST"
        | "LABEL"
        | "ARCHIVE_AND_LABEL"
        | "ARCHIVE_AND_READ_AND_LABEL"
      ColdEmailStatus: "AI_LABELED_COLD" | "USER_REJECTED_COLD"
      DigestStatus: "PENDING" | "PROCESSING" | "SENT" | "FAILED"
      EmailAccountType: "GMAIL" | "OUTLOOK"
      ExecutedRuleStatus:
        | "APPLIED"
        | "APPLYING"
        | "REJECTED"
        | "PENDING"
        | "SKIPPED"
        | "ERROR"
      Frequency: "NEVER" | "DAILY" | "WEEKLY"
      GroupItemType: "FROM" | "SUBJECT" | "BODY"
      LogicalOperator: "AND" | "OR"
      McpIntegrationType: "HTTP" | "WEBSOCKET" | "STANDARD"
      NewsletterStatus: "APPROVED" | "UNSUBSCRIBED" | "AUTO_ARCHIVED"
      PaymentProvider: "STRIPE" | "LEMONSQUEEZY"
      PaymentStatus: "PENDING" | "COMPLETED" | "FAILED"
      PaymentType: "SUBSCRIPTION" | "CREDITS" | "ONE_TIME"
      PlanType: "FREE" | "PREMIUM"
      PremiumTier:
        | "BASIC_MONTHLY"
        | "BASIC_ANNUALLY"
        | "PRO_MONTHLY"
        | "PRO_ANNUALLY"
        | "BUSINESS_MONTHLY"
        | "BUSINESS_ANNUALLY"
        | "BUSINESS_PLUS_MONTHLY"
        | "BUSINESS_PLUS_ANNUALLY"
        | "COPILOT_MONTHLY"
        | "LIFETIME"
      ProcessorType: "LEMON_SQUEEZY" | "STRIPE"
      ReferralStatus: "PENDING" | "COMPLETED"
      RuleActionType: "AI" | "SIMPLE"
      RuleStatus: "ENABLED" | "DISABLED"
      RuleTriggerType: "AI" | "SIMPLE"
      RuleType: "AI" | "SIMPLE"
      ScheduledActionStatus:
        | "PENDING"
        | "EXECUTING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
      SchedulingStatus: "PENDING" | "SCHEDULED" | "FAILED"
      SubscriptionStatus: "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID"
      SubscriptionType: "STANDARD" | "TEAM"
      SystemType:
        | "TO_REPLY"
        | "FYI"
        | "AWAITING_REPLY"
        | "ACTIONED"
        | "COLD_EMAIL"
        | "NEWSLETTER"
        | "MARKETING"
        | "CALENDAR"
        | "RECEIPT"
        | "NOTIFICATION"
      ThreadTrackerType: "AWAITING" | "NEEDS_REPLY" | "NEEDS_ACTION"
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
      ActionType: [
        "ARCHIVE",
        "LABEL",
        "REPLY",
        "SEND_EMAIL",
        "FORWARD",
        "DRAFT_EMAIL",
        "MARK_SPAM",
        "CALL_WEBHOOK",
        "MARK_READ",
        "DIGEST",
        "MOVE_FOLDER",
      ],
      AiModel: ["GPT_4O", "GPT_4O_MINI", "GPT_4_TURBO", "GPT_3_5_TURBO"],
      AiProvider: ["OPENAI", "ANTHROPIC", "GOOGLE"],
      CalendarProvider: ["GOOGLE", "OUTLOOK"],
      CategoryFilterType: ["INCLUDE", "EXCLUDE"],
      ChatStatus: ["ACTIVE", "PAUSED", "COMPLETED"],
      CleanAction: ["ARCHIVE", "MARK_READ"],
      ColdEmailSetting: [
        "DISABLED",
        "LIST",
        "LABEL",
        "ARCHIVE_AND_LABEL",
        "ARCHIVE_AND_READ_AND_LABEL",
      ],
      ColdEmailStatus: ["AI_LABELED_COLD", "USER_REJECTED_COLD"],
      DigestStatus: ["PENDING", "PROCESSING", "SENT", "FAILED"],
      EmailAccountType: ["GMAIL", "OUTLOOK"],
      ExecutedRuleStatus: [
        "APPLIED",
        "APPLYING",
        "REJECTED",
        "PENDING",
        "SKIPPED",
        "ERROR",
      ],
      Frequency: ["NEVER", "DAILY", "WEEKLY"],
      GroupItemType: ["FROM", "SUBJECT", "BODY"],
      LogicalOperator: ["AND", "OR"],
      McpIntegrationType: ["HTTP", "WEBSOCKET", "STANDARD"],
      NewsletterStatus: ["APPROVED", "UNSUBSCRIBED", "AUTO_ARCHIVED"],
      PaymentProvider: ["STRIPE", "LEMONSQUEEZY"],
      PaymentStatus: ["PENDING", "COMPLETED", "FAILED"],
      PaymentType: ["SUBSCRIPTION", "CREDITS", "ONE_TIME"],
      PlanType: ["FREE", "PREMIUM"],
      PremiumTier: [
        "BASIC_MONTHLY",
        "BASIC_ANNUALLY",
        "PRO_MONTHLY",
        "PRO_ANNUALLY",
        "BUSINESS_MONTHLY",
        "BUSINESS_ANNUALLY",
        "BUSINESS_PLUS_MONTHLY",
        "BUSINESS_PLUS_ANNUALLY",
        "COPILOT_MONTHLY",
        "LIFETIME",
      ],
      ProcessorType: ["LEMON_SQUEEZY", "STRIPE"],
      ReferralStatus: ["PENDING", "COMPLETED"],
      RuleActionType: ["AI", "SIMPLE"],
      RuleStatus: ["ENABLED", "DISABLED"],
      RuleTriggerType: ["AI", "SIMPLE"],
      RuleType: ["AI", "SIMPLE"],
      ScheduledActionStatus: [
        "PENDING",
        "EXECUTING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      SchedulingStatus: ["PENDING", "SCHEDULED", "FAILED"],
      SubscriptionStatus: ["ACTIVE", "CANCELED", "PAST_DUE", "UNPAID"],
      SubscriptionType: ["STANDARD", "TEAM"],
      SystemType: [
        "TO_REPLY",
        "FYI",
        "AWAITING_REPLY",
        "ACTIONED",
        "COLD_EMAIL",
        "NEWSLETTER",
        "MARKETING",
        "CALENDAR",
        "RECEIPT",
        "NOTIFICATION",
      ],
      ThreadTrackerType: ["AWAITING", "NEEDS_REPLY", "NEEDS_ACTION"],
    },
  },
} as const
