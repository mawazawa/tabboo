-- Fix RLS policies for upload_sessions and user_credits tables

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "upload_sessions_select_public" ON upload_sessions;
DROP POLICY IF EXISTS "user_credits_select_public" ON user_credits;
DROP POLICY IF EXISTS "user_credits_insert_public" ON user_credits;

-- Create proper RLS policy for upload_sessions
-- Users can only view their own sessions based on fingerprint
CREATE POLICY "Users can view own upload sessions"
ON upload_sessions
FOR SELECT
USING (user_fingerprint = current_setting('request.headers', true)::json->>'x-user-fingerprint' OR auth.uid()::text = user_fingerprint);

-- Create proper RLS policies for user_credits
-- Users can only view their own credit records
CREATE POLICY "Users can view own credits"
ON user_credits
FOR SELECT
USING (auth.uid()::text = user_id OR auth.uid()::text = fingerprint);

-- Allow service role to manage all records
CREATE POLICY "Service role can manage upload sessions"
ON upload_sessions
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user credits"
ON user_credits
FOR ALL
USING (auth.role() = 'service_role');