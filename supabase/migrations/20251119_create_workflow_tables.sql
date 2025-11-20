-- Workflow Tables for TRO and Ex Parte Packet Management
-- Created: 2025-11-19
-- Purpose: Track multi-form workflow state and progression

-- ========================================
-- TABLE: tro_workflows
-- ========================================
-- Manages state for multi-form packets (TRO, Ex Parte RFO, etc.)
CREATE TABLE IF NOT EXISTS tro_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workflow identification
  packet_type TEXT NOT NULL CHECK (packet_type IN (
    'initiating_with_children',
    'initiating_no_children',
    'response',
    'ex_parte_rfo'
  )),

  -- State machine
  current_state TEXT NOT NULL CHECK (current_state IN (
    'NOT_STARTED',
    'PACKET_TYPE_SELECTION',
    'DV100_IN_PROGRESS',
    'DV100_COMPLETE',
    'CLETS_IN_PROGRESS',
    'CLETS_COMPLETE',
    'DV105_IN_PROGRESS',
    'DV105_COMPLETE',
    'FL150_IN_PROGRESS',
    'FL150_COMPLETE',
    'FL300_IN_PROGRESS',
    'FL300_COMPLETE',
    'FL303_IN_PROGRESS',
    'FL303_COMPLETE',
    'FL305_IN_PROGRESS',
    'FL305_COMPLETE',
    'REVIEW_IN_PROGRESS',
    'READY_TO_FILE',
    'FILED',
    'DENIED',
    'GRANTED'
  )),

  -- Form statuses (JSONB for flexibility)
  -- Example: { "DV-100": "complete", "CLETS-001": "in_progress", "DV-105": "not_started" }
  form_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Packet configuration (JSONB for flexibility)
  -- Example: { "hasChildren": true, "requestingSupport": false, "needMoreSpace": false }
  packet_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Form data references (maps form type to legal_documents.id)
  -- Example: { "DV-100": "uuid-123", "CLETS-001": "uuid-456" }
  form_data_refs JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Progress %, validation errors, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  filed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_user_active_workflow UNIQUE (user_id, packet_type)
);

-- Indexes
CREATE INDEX idx_tro_workflows_user_id ON tro_workflows(user_id);
CREATE INDEX idx_tro_workflows_packet_type ON tro_workflows(packet_type);
CREATE INDEX idx_tro_workflows_current_state ON tro_workflows(current_state);
CREATE INDEX idx_tro_workflows_created_at ON tro_workflows(created_at);

-- Enable RLS
ALTER TABLE tro_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own workflows" ON tro_workflows
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflows" ON tro_workflows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" ON tro_workflows
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" ON tro_workflows
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- TRIGGER: Update updated_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION update_tro_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tro_workflows_updated_at
  BEFORE UPDATE ON tro_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_tro_workflows_updated_at();

-- ========================================
-- Comments for documentation
-- ========================================
COMMENT ON TABLE tro_workflows IS 'Manages multi-form packet workflows (TRO, Ex Parte RFO) with state machine';
COMMENT ON COLUMN tro_workflows.packet_type IS 'Type of legal packet: initiating_with_children, initiating_no_children, response, ex_parte_rfo';
COMMENT ON COLUMN tro_workflows.current_state IS 'Current state in workflow state machine';
COMMENT ON COLUMN tro_workflows.form_statuses IS 'JSONB map of form types to completion status';
COMMENT ON COLUMN tro_workflows.packet_config IS 'JSONB configuration for conditional form requirements';
COMMENT ON COLUMN tro_workflows.form_data_refs IS 'JSONB map of form types to legal_documents.id';
COMMENT ON COLUMN tro_workflows.metadata IS 'Additional workflow metadata: progress %, errors, etc.';
