-- ============================================
-- Enable Row Level Security on all tables
-- ============================================

-- Authentication & User Data
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ApiKey" ENABLE ROW LEVEL SECURITY;

-- Financial Data
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Premium" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Referral" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Bill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BillLineItem" ENABLE ROW LEVEL SECURITY;

-- Email & Communication
ALTER TABLE public."EmailAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Calendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CalendarConnection" ENABLE ROW LEVEL SECURITY;

-- Legal & Case Management
ALTER TABLE public."Case" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Newsletter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Rule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExecutedRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExecutedAction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CleanupJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CleanupThread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ScheduledAction" ENABLE ROW LEVEL SECURITY;

-- Other Tables
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GroupItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Knowledge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."McpConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."McpIntegration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."McpTool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ThreadTracker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ColdEmail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DraftSendLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_CategoryToRule" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies for User-owned tables
-- ============================================

-- User table: users can only access their own record
CREATE POLICY "Users can view own profile" ON public."User"
  FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON public."User"
  FOR UPDATE USING (id::text = auth.uid()::text);

-- Account table
CREATE POLICY "Users can view own accounts" ON public."Account"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can insert own accounts" ON public."Account"
  FOR INSERT WITH CHECK ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can update own accounts" ON public."Account"
  FOR UPDATE USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can delete own accounts" ON public."Account"
  FOR DELETE USING ("userId"::text = auth.uid()::text);

-- Session table
CREATE POLICY "Users can view own sessions" ON public."Session"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can insert own sessions" ON public."Session"
  FOR INSERT WITH CHECK ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can update own sessions" ON public."Session"
  FOR UPDATE USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can delete own sessions" ON public."Session"
  FOR DELETE USING ("userId"::text = auth.uid()::text);

-- ApiKey table
CREATE POLICY "Users can view own API keys" ON public."ApiKey"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can insert own API keys" ON public."ApiKey"
  FOR INSERT WITH CHECK ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can update own API keys" ON public."ApiKey"
  FOR UPDATE USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can delete own API keys" ON public."ApiKey"
  FOR DELETE USING ("userId"::text = auth.uid()::text);

-- Payment table
CREATE POLICY "Users can view own payments" ON public."Payment"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can insert own payments" ON public."Payment"
  FOR INSERT WITH CHECK ("userId"::text = auth.uid()::text);

-- Premium table: publicly readable for pricing info
CREATE POLICY "Premium tiers are publicly readable" ON public."Premium"
  FOR SELECT USING (true);

-- Referral table
CREATE POLICY "Users can view referrals they're involved in" ON public."Referral"
  FOR SELECT USING (
    "referrerUserId"::text = auth.uid()::text OR 
    "referredUserId"::text = auth.uid()::text
  );

CREATE POLICY "Users can insert referrals as referrer" ON public."Referral"
  FOR INSERT WITH CHECK ("referrerUserId"::text = auth.uid()::text);

-- Case table (uses attorneyId)
CREATE POLICY "Attorneys can view own cases" ON public."Case"
  FOR SELECT USING ("attorneyId"::text = auth.uid()::text);

CREATE POLICY "Attorneys can insert own cases" ON public."Case"
  FOR INSERT WITH CHECK ("attorneyId"::text = auth.uid()::text);

CREATE POLICY "Attorneys can update own cases" ON public."Case"
  FOR UPDATE USING ("attorneyId"::text = auth.uid()::text);

CREATE POLICY "Attorneys can delete own cases" ON public."Case"
  FOR DELETE USING ("attorneyId"::text = auth.uid()::text);

-- Bill table (linked to Case)
CREATE POLICY "Users can view bills for own cases" ON public."Bill"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."Case"
      WHERE "Case".id = "Bill"."caseId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert bills for own cases" ON public."Bill"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Case"
      WHERE "Case".id = "Bill"."caseId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update bills for own cases" ON public."Bill"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."Case"
      WHERE "Case".id = "Bill"."caseId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete bills for own cases" ON public."Bill"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."Case"
      WHERE "Case".id = "Bill"."caseId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

-- BillLineItem table (linked to Bill)
CREATE POLICY "Users can view line items for own bills" ON public."BillLineItem"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."Bill"
      JOIN public."Case" ON "Case".id = "Bill"."caseId"
      WHERE "Bill".id = "BillLineItem"."billId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert line items for own bills" ON public."BillLineItem"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Bill"
      JOIN public."Case" ON "Case".id = "Bill"."caseId"
      WHERE "Bill".id = "BillLineItem"."billId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update line items for own bills" ON public."BillLineItem"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."Bill"
      JOIN public."Case" ON "Case".id = "Bill"."caseId"
      WHERE "Bill".id = "BillLineItem"."billId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete line items for own bills" ON public."BillLineItem"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."Bill"
      JOIN public."Case" ON "Case".id = "Bill"."caseId"
      WHERE "Bill".id = "BillLineItem"."billId"
      AND "Case"."attorneyId"::text = auth.uid()::text
    )
  );

-- EmailAccount table
CREATE POLICY "Users can view own email accounts" ON public."EmailAccount"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can insert own email accounts" ON public."EmailAccount"
  FOR INSERT WITH CHECK ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can update own email accounts" ON public."EmailAccount"
  FOR UPDATE USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can delete own email accounts" ON public."EmailAccount"
  FOR DELETE USING ("userId"::text = auth.uid()::text);

-- EmailMessage table (linked to EmailAccount)
CREATE POLICY "Users can view messages from own email accounts" ON public."EmailMessage"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailMessage"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages to own email accounts" ON public."EmailMessage"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailMessage"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update messages in own email accounts" ON public."EmailMessage"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailMessage"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete messages from own email accounts" ON public."EmailMessage"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailMessage"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- EmailToken table
CREATE POLICY "Users can view own email tokens" ON public."EmailToken"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailToken"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own email tokens" ON public."EmailToken"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailToken"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own email tokens" ON public."EmailToken"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailToken"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own email tokens" ON public."EmailToken"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "EmailToken"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Chat table
CREATE POLICY "Users can view own chats" ON public."Chat"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Chat"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own chats" ON public."Chat"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Chat"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own chats" ON public."Chat"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Chat"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own chats" ON public."Chat"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Chat"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- ChatMessage table
CREATE POLICY "Users can view messages from own chats" ON public."ChatMessage"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."Chat"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Chat"."emailAccountId"
      WHERE "Chat".id = "ChatMessage"."chatId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages to own chats" ON public."ChatMessage"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Chat"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Chat"."emailAccountId"
      WHERE "Chat".id = "ChatMessage"."chatId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update messages in own chats" ON public."ChatMessage"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."Chat"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Chat"."emailAccountId"
      WHERE "Chat".id = "ChatMessage"."chatId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete messages from own chats" ON public."ChatMessage"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."Chat"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Chat"."emailAccountId"
      WHERE "Chat".id = "ChatMessage"."chatId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Calendar table
CREATE POLICY "Users can view own calendars" ON public."Calendar"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."CalendarConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "CalendarConnection"."emailAccountId"
      WHERE "CalendarConnection".id = "Calendar"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own calendars" ON public."Calendar"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."CalendarConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "CalendarConnection"."emailAccountId"
      WHERE "CalendarConnection".id = "Calendar"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own calendars" ON public."Calendar"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."CalendarConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "CalendarConnection"."emailAccountId"
      WHERE "CalendarConnection".id = "Calendar"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own calendars" ON public."Calendar"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."CalendarConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "CalendarConnection"."emailAccountId"
      WHERE "CalendarConnection".id = "Calendar"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- CalendarConnection table
CREATE POLICY "Users can view own calendar connections" ON public."CalendarConnection"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CalendarConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own calendar connections" ON public."CalendarConnection"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CalendarConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own calendar connections" ON public."CalendarConnection"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CalendarConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own calendar connections" ON public."CalendarConnection"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CalendarConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Category table
CREATE POLICY "Users can view own categories" ON public."Category"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Category"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own categories" ON public."Category"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Category"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own categories" ON public."Category"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Category"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own categories" ON public."Category"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Category"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Newsletter table
CREATE POLICY "Users can view own newsletters" ON public."Newsletter"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Newsletter"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own newsletters" ON public."Newsletter"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Newsletter"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own newsletters" ON public."Newsletter"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Newsletter"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own newsletters" ON public."Newsletter"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Newsletter"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Rule table
CREATE POLICY "Users can view own rules" ON public."Rule"
  FOR SELECT USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can insert own rules" ON public."Rule"
  FOR INSERT WITH CHECK ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can update own rules" ON public."Rule"
  FOR UPDATE USING ("userId"::text = auth.uid()::text);

CREATE POLICY "Users can delete own rules" ON public."Rule"
  FOR DELETE USING ("userId"::text = auth.uid()::text);

-- ExecutedRule table
CREATE POLICY "Users can view own executed rules" ON public."ExecutedRule"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ExecutedRule"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own executed rules" ON public."ExecutedRule"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ExecutedRule"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own executed rules" ON public."ExecutedRule"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ExecutedRule"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own executed rules" ON public."ExecutedRule"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ExecutedRule"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- ExecutedAction table
CREATE POLICY "Users can view own executed actions" ON public."ExecutedAction"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."ExecutedRule"
      JOIN public."EmailAccount" ON "EmailAccount".id = "ExecutedRule"."emailAccountId"
      WHERE "ExecutedRule".id = "ExecutedAction"."executedRuleId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own executed actions" ON public."ExecutedAction"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."ExecutedRule"
      JOIN public."EmailAccount" ON "EmailAccount".id = "ExecutedRule"."emailAccountId"
      WHERE "ExecutedRule".id = "ExecutedAction"."executedRuleId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own executed actions" ON public."ExecutedAction"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."ExecutedRule"
      JOIN public."EmailAccount" ON "EmailAccount".id = "ExecutedRule"."emailAccountId"
      WHERE "ExecutedRule".id = "ExecutedAction"."executedRuleId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own executed actions" ON public."ExecutedAction"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."ExecutedRule"
      JOIN public."EmailAccount" ON "EmailAccount".id = "ExecutedRule"."emailAccountId"
      WHERE "ExecutedRule".id = "ExecutedAction"."executedRuleId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- CleanupJob table
CREATE POLICY "Users can view own cleanup jobs" ON public."CleanupJob"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupJob"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own cleanup jobs" ON public."CleanupJob"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupJob"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own cleanup jobs" ON public."CleanupJob"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupJob"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own cleanup jobs" ON public."CleanupJob"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupJob"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- CleanupThread table
CREATE POLICY "Users can view own cleanup threads" ON public."CleanupThread"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupThread"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own cleanup threads" ON public."CleanupThread"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupThread"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own cleanup threads" ON public."CleanupThread"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "CleanupThread"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- ScheduledAction table
CREATE POLICY "Users can view own scheduled actions" ON public."ScheduledAction"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ScheduledAction"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own scheduled actions" ON public."ScheduledAction"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ScheduledAction"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own scheduled actions" ON public."ScheduledAction"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ScheduledAction"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own scheduled actions" ON public."ScheduledAction"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ScheduledAction"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Group table
CREATE POLICY "Users can view own groups" ON public."Group"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Group"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own groups" ON public."Group"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Group"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own groups" ON public."Group"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Group"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own groups" ON public."Group"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Group"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- GroupItem table
CREATE POLICY "Users can view own group items" ON public."GroupItem"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."Group"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Group"."emailAccountId"
      WHERE "Group".id = "GroupItem"."groupId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own group items" ON public."GroupItem"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Group"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Group"."emailAccountId"
      WHERE "Group".id = "GroupItem"."groupId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own group items" ON public."GroupItem"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."Group"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Group"."emailAccountId"
      WHERE "Group".id = "GroupItem"."groupId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own group items" ON public."GroupItem"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."Group"
      JOIN public."EmailAccount" ON "EmailAccount".id = "Group"."emailAccountId"
      WHERE "Group".id = "GroupItem"."groupId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- Knowledge table
CREATE POLICY "Users can view own knowledge" ON public."Knowledge"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Knowledge"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own knowledge" ON public."Knowledge"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Knowledge"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own knowledge" ON public."Knowledge"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Knowledge"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own knowledge" ON public."Knowledge"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "Knowledge"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- McpConnection table
CREATE POLICY "Users can view own MCP connections" ON public."McpConnection"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "McpConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own MCP connections" ON public."McpConnection"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "McpConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own MCP connections" ON public."McpConnection"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "McpConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own MCP connections" ON public."McpConnection"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "McpConnection"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- McpIntegration table: publicly readable
CREATE POLICY "MCP integrations are publicly readable" ON public."McpIntegration"
  FOR SELECT USING (true);

-- McpTool table
CREATE POLICY "Users can view tools for own MCP connections" ON public."McpTool"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."McpConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "McpConnection"."emailAccountId"
      WHERE "McpConnection".id = "McpTool"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert tools for own MCP connections" ON public."McpTool"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."McpConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "McpConnection"."emailAccountId"
      WHERE "McpConnection".id = "McpTool"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update tools for own MCP connections" ON public."McpTool"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."McpConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "McpConnection"."emailAccountId"
      WHERE "McpConnection".id = "McpTool"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete tools for own MCP connections" ON public."McpTool"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."McpConnection"
      JOIN public."EmailAccount" ON "EmailAccount".id = "McpConnection"."emailAccountId"
      WHERE "McpConnection".id = "McpTool"."connectionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- ThreadTracker table
CREATE POLICY "Users can view own thread trackers" ON public."ThreadTracker"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ThreadTracker"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own thread trackers" ON public."ThreadTracker"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ThreadTracker"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own thread trackers" ON public."ThreadTracker"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ThreadTracker"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own thread trackers" ON public."ThreadTracker"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ThreadTracker"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- ColdEmail table
CREATE POLICY "Users can view own cold emails" ON public."ColdEmail"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ColdEmail"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own cold emails" ON public."ColdEmail"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ColdEmail"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own cold emails" ON public."ColdEmail"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ColdEmail"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own cold emails" ON public."ColdEmail"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."EmailAccount"
      WHERE "EmailAccount".id = "ColdEmail"."emailAccountId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- DraftSendLog table
CREATE POLICY "Users can view own draft send logs" ON public."DraftSendLog"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."ExecutedAction"
      JOIN public."ExecutedRule" ON "ExecutedRule".id = "ExecutedAction"."executedRuleId"
      JOIN public."EmailAccount" ON "EmailAccount".id = "ExecutedRule"."emailAccountId"
      WHERE "ExecutedAction".id = "DraftSendLog"."executedActionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own draft send logs" ON public."DraftSendLog"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."ExecutedAction"
      JOIN public."ExecutedRule" ON "ExecutedRule".id = "ExecutedAction"."executedRuleId"
      JOIN public."EmailAccount" ON "EmailAccount".id = "ExecutedRule"."emailAccountId"
      WHERE "ExecutedAction".id = "DraftSendLog"."executedActionId"
      AND "EmailAccount"."userId"::text = auth.uid()::text
    )
  );

-- VerificationToken: Special case - no user ownership, validated by token
CREATE POLICY "Anyone can view verification tokens" ON public."VerificationToken"
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert verification tokens" ON public."VerificationToken"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete verification tokens" ON public."VerificationToken"
  FOR DELETE USING (true);

-- _CategoryToRule: Join table - access controlled through related tables
CREATE POLICY "Users can view own category-rule mappings" ON public."_CategoryToRule"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."Rule"
      WHERE "Rule".id = "B"
      AND "Rule"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own category-rule mappings" ON public."_CategoryToRule"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Rule"
      WHERE "Rule".id = "B"
      AND "Rule"."userId"::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own category-rule mappings" ON public."_CategoryToRule"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."Rule"
      WHERE "Rule".id = "B"
      AND "Rule"."userId"::text = auth.uid()::text
    )
  );