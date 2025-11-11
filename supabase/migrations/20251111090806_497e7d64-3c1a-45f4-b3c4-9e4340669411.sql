-- Create personal_info table for Personal Data Vault
CREATE TABLE IF NOT EXISTS public.personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT DEFAULT 'CA',
  zip_code TEXT,
  telephone_no TEXT,
  fax_no TEXT,
  email_address TEXT,
  attorney_name TEXT,
  firm_name TEXT,
  bar_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own personal info"
  ON public.personal_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal info"
  ON public.personal_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal info"
  ON public.personal_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal info"
  ON public.personal_info FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_personal_info_user_id ON public.personal_info(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_personal_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personal_info_updated_at
  BEFORE UPDATE ON public.personal_info
  FOR EACH ROW
  EXECUTE FUNCTION update_personal_info_updated_at();