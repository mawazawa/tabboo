-- ============================================================================
-- Google Maps & Plaid API Integration: Database Schema
-- Created: 2025-11-21
-- Purpose: Support address validation caching, Plaid connections, and FL-150
--          financial data auto-fill
-- Security: Row Level Security enforced for complete user isolation
-- ============================================================================

-- ============================================================================
-- 1. Plaid Connections Table
-- Purpose: Store encrypted Plaid access tokens and connection metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Institution info
  institution_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,

  -- Encrypted access token (AES-256-GCM)
  access_token_encrypted TEXT NOT NULL,
  item_id TEXT NOT NULL,

  -- Products enabled for this connection
  products TEXT[] NOT NULL DEFAULT '{}',

  -- Connection status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'error', 'disconnected')),
  error_code TEXT,
  error_message TEXT,

  -- Consent and sync tracking
  consent_expiration TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  sync_cursor TEXT, -- For incremental transaction sync

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One connection per institution per user
  UNIQUE(user_id, institution_id)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_plaid_connections_user_id
  ON public.plaid_connections(user_id);

-- Index for status monitoring
CREATE INDEX IF NOT EXISTS idx_plaid_connections_status
  ON public.plaid_connections(status);

-- Enable RLS
ALTER TABLE public.plaid_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own connections
CREATE POLICY "Users can manage own Plaid connections"
  ON public.plaid_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. FL-150 Financial Data Cache
-- Purpose: Cache aggregated financial data for FL-150 auto-fill
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fl150_financial_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.tro_workflows(id) ON DELETE SET NULL,

  -- Income data (encrypted JSONB)
  monthly_gross_income JSONB, -- Encrypted: employer income, self-employment
  income_sources JSONB, -- Array of income sources with amounts

  -- Expense data (category → amount mapping)
  monthly_expenses JSONB NOT NULL DEFAULT '{}',
  expense_by_category JSONB NOT NULL DEFAULT '{}',

  -- Assets (encrypted JSONB)
  checking_accounts JSONB, -- Encrypted: account balances
  savings_accounts JSONB, -- Encrypted: account balances
  investment_accounts JSONB, -- Encrypted: holdings
  retirement_accounts JSONB, -- Encrypted: 401k, IRA, etc.
  real_property JSONB, -- User-entered, not from Plaid
  vehicles JSONB, -- User-entered, not from Plaid
  other_assets JSONB,
  total_assets DECIMAL(12, 2),

  -- Liabilities
  credit_cards JSONB NOT NULL DEFAULT '{}',
  mortgages JSONB NOT NULL DEFAULT '{}',
  student_loans JSONB NOT NULL DEFAULT '{}',
  auto_loans JSONB NOT NULL DEFAULT '{}',
  other_debts JSONB NOT NULL DEFAULT '{}',
  total_liabilities DECIMAL(12, 2),
  total_monthly_debt_payments DECIMAL(10, 2),

  -- Data freshness
  data_as_of_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transactions_start_date DATE,
  transactions_end_date DATE,

  -- Cache management
  cache_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  is_stale BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_fl150_cache_user_id
  ON public.fl150_financial_cache(user_id);

-- Index for workflow association
CREATE INDEX IF NOT EXISTS idx_fl150_cache_workflow_id
  ON public.fl150_financial_cache(workflow_id);

-- Index for cache expiration cleanup
CREATE INDEX IF NOT EXISTS idx_fl150_cache_expires
  ON public.fl150_financial_cache(cache_expires_at);

-- Enable RLS
ALTER TABLE public.fl150_financial_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own cache
CREATE POLICY "Users can manage own financial cache"
  ON public.fl150_financial_cache FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. Address Validations Cache
-- Purpose: Cache validated addresses to reduce API calls
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.address_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Input address (what user typed)
  input_address TEXT NOT NULL,
  input_hash TEXT NOT NULL, -- SHA-256 hash for deduplication

  -- Validated/standardized address
  validated_address JSONB NOT NULL,

  -- Validation result
  validation_verdict TEXT NOT NULL CHECK (validation_verdict IN (
    'CONFIRMED',
    'UNCONFIRMED_BUT_PLAUSIBLE',
    'SUSPICIOUS',
    'INVALID'
  )),

  -- Address components (for form auto-fill)
  street_number TEXT,
  route TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,

  -- Google Place ID (for future lookups)
  place_id TEXT,

  -- Geolocation (for court finder)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Cache management
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for hash lookups (cache hits)
CREATE INDEX IF NOT EXISTS idx_address_validations_hash
  ON public.address_validations(input_hash);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_address_validations_user_id
  ON public.address_validations(user_id);

-- Index for cache expiration cleanup
CREATE INDEX IF NOT EXISTS idx_address_validations_expires
  ON public.address_validations(expires_at);

-- Enable RLS
ALTER TABLE public.address_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can access own or anonymous validations
CREATE POLICY "Users can access address validations"
  ON public.address_validations FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- ============================================================================
-- 4. California Courts Reference Table
-- Purpose: Store all 58 California Superior Court locations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.california_courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Court identification
  county TEXT NOT NULL UNIQUE,
  court_name TEXT NOT NULL,
  court_code TEXT, -- California court code (e.g., "19" for Los Angeles)

  -- Address
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip_code TEXT NOT NULL,

  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact info
  phone TEXT,
  fax TEXT,

  -- Hours and services
  hours TEXT,
  filing_url TEXT,
  self_help_url TEXT,

  -- DV-specific information
  dv_unit_phone TEXT,
  dv_specific_info TEXT,
  emergency_orders_available BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for county lookups
CREATE INDEX IF NOT EXISTS idx_california_courts_county
  ON public.california_courts(county);

-- No RLS needed - public reference data
-- But enable for future admin controls
ALTER TABLE public.california_courts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read courts
CREATE POLICY "Anyone can read California courts"
  ON public.california_courts FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================================================
-- 5. Financial Access Audit Log
-- Purpose: Track all access to sensitive financial data (CCPA compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action tracking
  action TEXT NOT NULL CHECK (action IN (
    'plaid_connect',
    'plaid_sync',
    'plaid_view',
    'plaid_export',
    'plaid_disconnect',
    'fl150_autofill',
    'fl150_view',
    'fl150_export',
    'address_validate',
    'data_delete'
  )),

  -- Resource details
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'plaid_connection',
    'transactions',
    'assets',
    'income',
    'liabilities',
    'address',
    'fl150_cache'
  )),
  resource_id UUID, -- Optional reference to specific record

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Request info (for security audits)
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user audit lookups
CREATE INDEX IF NOT EXISTS idx_financial_access_log_user_id
  ON public.financial_access_log(user_id);

-- Index for action filtering
CREATE INDEX IF NOT EXISTS idx_financial_access_log_action
  ON public.financial_access_log(action);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_financial_access_log_created
  ON public.financial_access_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.financial_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own logs
CREATE POLICY "Users can view own financial access logs"
  ON public.financial_access_log FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert logs (via service role)
CREATE POLICY "Service role can insert logs"
  ON public.financial_access_log FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 6. Updated Timestamp Triggers
-- Purpose: Auto-update updated_at columns
-- ============================================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to plaid_connections
DROP TRIGGER IF EXISTS update_plaid_connections_updated_at ON public.plaid_connections;
CREATE TRIGGER update_plaid_connections_updated_at
  BEFORE UPDATE ON public.plaid_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to fl150_financial_cache
DROP TRIGGER IF EXISTS update_fl150_cache_updated_at ON public.fl150_financial_cache;
CREATE TRIGGER update_fl150_cache_updated_at
  BEFORE UPDATE ON public.fl150_financial_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to california_courts
DROP TRIGGER IF EXISTS update_california_courts_updated_at ON public.california_courts;
CREATE TRIGGER update_california_courts_updated_at
  BEFORE UPDATE ON public.california_courts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Cache Cleanup Function
-- Purpose: Scheduled cleanup of expired cache entries
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_caches()
RETURNS void AS $$
BEGIN
  -- Delete expired address validations
  DELETE FROM public.address_validations
  WHERE expires_at < NOW();

  -- Delete expired financial cache
  DELETE FROM public.fl150_financial_cache
  WHERE cache_expires_at < NOW();

  -- Mark stale financial cache (older than 7 days)
  UPDATE public.fl150_financial_cache
  SET is_stale = TRUE
  WHERE data_as_of_date < CURRENT_DATE - INTERVAL '7 days'
    AND is_stale = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. Seed Initial California Courts (Major Counties)
-- Note: Full 58 counties to be seeded separately
-- ============================================================================

INSERT INTO public.california_courts (
  county, court_name, street_address, city, zip_code,
  latitude, longitude, phone, hours, filing_url, dv_unit_phone
) VALUES
  ('Los Angeles', 'Los Angeles Superior Court - Stanley Mosk Courthouse',
   '111 N Hill St', 'Los Angeles', '90012',
   34.0544, -118.2439, '(213) 830-0800',
   'Mon-Fri 8:30am-4:30pm',
   'https://www.lacourt.org/forms/familylaw',
   '(213) 830-0845'),

  ('San Diego', 'San Diego Superior Court - Central Division',
   '1100 Union St', 'San Diego', '92101',
   32.7205, -117.1628, '(619) 844-2700',
   'Mon-Fri 8:00am-4:00pm',
   'https://www.sdcourt.ca.gov/sdcourt/family2/domesticviolence',
   '(619) 844-2704'),

  ('Orange', 'Orange County Superior Court - Lamoreaux Justice Center',
   '341 The City Dr S', 'Orange', '92868',
   33.7824, -117.8684, '(657) 622-5600',
   'Mon-Fri 8:00am-4:00pm',
   'https://www.occourts.org/self-help/familylaw/',
   '(657) 622-5656'),

  ('Riverside', 'Riverside Superior Court - Family Law',
   '4175 Main St', 'Riverside', '92501',
   33.9533, -117.3962, '(951) 777-3147',
   'Mon-Fri 8:00am-4:00pm',
   'https://www.riverside.courts.ca.gov/self-help',
   '(951) 955-4600'),

  ('San Bernardino', 'San Bernardino Superior Court - Family Law',
   '351 N Arrowhead Ave', 'San Bernardino', '92415',
   34.1083, -117.2898, '(909) 708-8747',
   'Mon-Fri 8:00am-4:00pm',
   'https://www.sb-court.org/self-help',
   '(909) 708-8747'),

  ('Santa Clara', 'Santa Clara Superior Court - Family Court',
   '170 Park Center Plaza', 'San Jose', '95113',
   37.3318, -121.8863, '(408) 882-2100',
   'Mon-Fri 8:30am-4:00pm',
   'https://www.scscourt.org/self_service/family/',
   '(408) 882-2100'),

  ('Alameda', 'Alameda Superior Court - Hayward Hall of Justice',
   '24405 Amador St', 'Hayward', '94544',
   37.6712, -122.0831, '(510) 891-6012',
   'Mon-Fri 8:30am-4:00pm',
   'https://www.alameda.courts.ca.gov/self-help',
   '(510) 891-6012'),

  ('Sacramento', 'Sacramento Superior Court - Family Law',
   '3341 Power Inn Rd', 'Sacramento', '95826',
   38.5595, -121.4203, '(916) 874-5522',
   'Mon-Fri 8:00am-4:00pm',
   'https://www.saccourt.ca.gov/family/family-law.aspx',
   '(916) 874-7848'),

  ('San Francisco', 'San Francisco Superior Court - Family Law',
   '400 McAllister St', 'San Francisco', '94102',
   37.7808, -122.4177, '(415) 551-4000',
   'Mon-Fri 8:30am-4:00pm',
   'https://www.sfsuperiorcourt.org/divisions/family',
   '(415) 551-4000'),

  ('Fresno', 'Fresno Superior Court - Family Law',
   '1130 O St', 'Fresno', '93721',
   36.7378, -119.7871, '(559) 457-2000',
   'Mon-Fri 8:00am-4:00pm',
   'https://www.fresno.courts.ca.gov/self-help',
   '(559) 457-2000')

ON CONFLICT (county) DO UPDATE SET
  court_name = EXCLUDED.court_name,
  street_address = EXCLUDED.street_address,
  city = EXCLUDED.city,
  zip_code = EXCLUDED.zip_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  filing_url = EXCLUDED.filing_url,
  dv_unit_phone = EXCLUDED.dv_unit_phone,
  updated_at = NOW();

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE public.plaid_connections IS 'Stores encrypted Plaid access tokens and connection metadata for financial data integration';
COMMENT ON TABLE public.fl150_financial_cache IS 'Caches aggregated financial data for FL-150 Income and Expense Declaration auto-fill';
COMMENT ON TABLE public.address_validations IS 'Caches validated addresses to reduce Google Maps API calls';
COMMENT ON TABLE public.california_courts IS 'Reference table of all California Superior Court locations';
COMMENT ON TABLE public.financial_access_log IS 'Audit log for all financial data access (CCPA compliance)';
