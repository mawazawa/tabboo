-- Set search_path for database functions to prevent search_path injection attacks
-- Created: 2025-01-27
-- Purpose: Security hardening - explicitly set search_path for all functions

-- ==================================================
-- FUNCTION: refresh_field_analytics()
-- ==================================================
-- Refreshes materialized views for field analytics
ALTER FUNCTION refresh_field_analytics() SET search_path = public, pg_temp;

-- ==================================================
-- FUNCTION: get_field_reuse_summary()
-- ==================================================
-- Returns summary of field reuse by category
ALTER FUNCTION get_field_reuse_summary() SET search_path = public, pg_temp;

-- ==================================================
-- FUNCTION: get_top_reused_fields()
-- ==================================================
-- Returns top reused fields by usage count
ALTER FUNCTION get_top_reused_fields(limit_count INTEGER) SET search_path = public, pg_temp;

-- ==================================================
-- FUNCTION: update_updated_at_column()
-- ==================================================
-- Trigger function to update updated_at timestamp
ALTER FUNCTION update_updated_at_column() SET search_path = public, pg_temp;

-- ==================================================
-- VERIFICATION
-- ==================================================
-- Verify search_path is set correctly
DO $$
DECLARE
  func_record RECORD;
  expected_path TEXT := 'public, pg_temp';
BEGIN
  FOR func_record IN
    SELECT 
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as arguments,
      p.proconfig as search_path_config
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'refresh_field_analytics',
        'get_field_reuse_summary',
        'get_top_reused_fields',
        'update_updated_at_column'
      )
  LOOP
    IF func_record.search_path_config IS NULL OR 
       array_to_string(func_record.search_path_config, ', ') != expected_path THEN
      RAISE WARNING 'Function %(%) may not have correct search_path set', 
        func_record.function_name, 
        func_record.arguments;
    END IF;
  END LOOP;
END $$;

