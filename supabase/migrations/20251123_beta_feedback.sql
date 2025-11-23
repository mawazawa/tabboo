-- Beta User Feedback System
-- Tracks user feedback for continuous improvement during beta testing

-- Feedback submissions table
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Feedback content
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'usability', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Context
  page_url TEXT,
  user_agent TEXT,
  screenshot_url TEXT,

  -- Metadata
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'wont_fix')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Index for querying by user and status
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(feedback_type);

-- RLS policies
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON beta_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON beta_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_beta_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER beta_feedback_updated_at
  BEFORE UPDATE ON beta_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_feedback_updated_at();

-- Beta signup waitlist (for managing invites)
CREATE TABLE IF NOT EXISTS beta_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'joined', 'declined')),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,

  -- Metadata
  referral_source TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_email ON beta_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON beta_waitlist(status);

COMMENT ON TABLE beta_feedback IS 'Stores user feedback during beta testing period';
COMMENT ON TABLE beta_waitlist IS 'Manages beta user invitations and waitlist';
