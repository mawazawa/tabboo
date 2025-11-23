-- RLS Performance Optimization: Add indexes on user_id columns
-- Created: 2025-11-23
-- Purpose: Improve RLS query performance by 100x for tables with auth.uid() = user_id policies

-- ==================================================
-- ADD INDEXES FOR RLS-PROTECTED TABLES
-- ==================================================

-- canonical_data_vault (main user data)
CREATE INDEX IF NOT EXISTS idx_canonical_data_vault_user_id
ON canonical_data_vault(user_id);

-- vault_document_extractions (document processing history)
CREATE INDEX IF NOT EXISTS idx_vault_document_extractions_user_id
ON vault_document_extractions(user_id);

-- extraction_queue (background jobs)
CREATE INDEX IF NOT EXISTS idx_extraction_queue_user_id
ON extraction_queue(user_id);

-- audit_log (security audit trail)
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
ON audit_log(user_id);

-- documents (user documents)
CREATE INDEX IF NOT EXISTS idx_documents_user_id
ON documents(user_id);

-- form_data (form submissions)
CREATE INDEX IF NOT EXISTS idx_form_data_user_id
ON form_data(user_id);

-- tro_workflows (workflow state)
CREATE INDEX IF NOT EXISTS idx_tro_workflows_user_id
ON tro_workflows(user_id);

-- legal_documents (individual form data)
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id
ON legal_documents(user_id);

-- user_addresses (Maps integration)
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id
ON user_addresses(user_id);

-- plaid_items (Plaid integration)
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id
ON plaid_items(user_id);

-- plaid_accounts (Plaid accounts)
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_user_id
ON plaid_accounts(user_id);

-- plaid_transactions (Plaid transactions)
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_user_id
ON plaid_transactions(user_id);

-- ==================================================
-- VERIFICATION
-- ==================================================
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE indexname LIKE 'idx_%_user_id';

  RAISE NOTICE 'Created % user_id indexes for RLS optimization', index_count;
END $$;

-- ==================================================
-- NOTE: MANUAL STEP REQUIRED
-- ==================================================
-- Enable Leaked Password Protection in Supabase Dashboard:
-- 1. Go to Authentication → Settings
-- 2. Enable "Leaked Password Protection"
-- This cannot be done via SQL migration
