-- Canonical Field Schema for California Judicial Council Forms
-- Created: 2025-11-15
-- Purpose: Track unique fields across all forms, enable field reuse analytics

-- ==================================================
-- TABLE: canonical_fields
-- ==================================================
-- Stores unique field definitions used across all forms
CREATE TABLE IF NOT EXISTS canonical_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Field identification
  field_key TEXT NOT NULL UNIQUE, -- Unique identifier (e.g., "partyName", "caseNumber")
  field_label TEXT NOT NULL, -- Human-readable label
  field_type TEXT NOT NULL CHECK (field_type IN ('input', 'textarea', 'checkbox', 'date', 'select')),

  -- Field categorization
  category TEXT NOT NULL, -- e.g., "header", "party_info", "court_info", "custody", "support"
  subcategory TEXT, -- More specific grouping

  -- Semantic meaning
  semantic_type TEXT, -- e.g., "person_name", "address", "phone", "email", "case_id"
  description TEXT, -- Detailed description of field purpose

  -- Validation rules
  validation_pattern TEXT, -- Regex pattern for validation
  validation_rules JSONB, -- Additional validation rules

  -- Vault mapping
  vault_field_name TEXT, -- Maps to personal_info column if applicable
  is_pii BOOLEAN DEFAULT FALSE, -- Personally Identifiable Information

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      field_key || ' ' ||
      field_label || ' ' ||
      COALESCE(description, '')
    )
  ) STORED
);

-- Indexes
CREATE INDEX idx_canonical_fields_key ON canonical_fields(field_key);
CREATE INDEX idx_canonical_fields_type ON canonical_fields(field_type);
CREATE INDEX idx_canonical_fields_category ON canonical_fields(category);
CREATE INDEX idx_canonical_fields_semantic ON canonical_fields(semantic_type);
CREATE INDEX idx_canonical_fields_search ON canonical_fields USING GIN(search_vector);

-- Enable RLS
ALTER TABLE canonical_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for authenticated users, admin write)
CREATE POLICY "Allow read for authenticated users" ON canonical_fields
  FOR SELECT TO authenticated
  USING (true);

-- ==================================================
-- TABLE: judicial_council_forms
-- ==================================================
-- Catalog of all California Judicial Council forms
CREATE TABLE IF NOT EXISTS judicial_council_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Form identification
  form_number TEXT NOT NULL UNIQUE, -- e.g., "FL-320", "DV-100"
  form_name TEXT NOT NULL, -- e.g., "Responsive Declaration to Request for Order"
  form_series TEXT NOT NULL, -- e.g., "FL" (Family Law), "DV" (Domestic Violence)

  -- Form metadata
  description TEXT,
  url TEXT, -- Official JC form URL
  pdf_url TEXT, -- Direct PDF URL
  info_sheet_url TEXT, -- Link to info sheet (e.g., FL-320-INFO)

  -- Form classification
  form_pattern TEXT CHECK (form_pattern IN ('response', 'request', 'financial', 'declaration', 'notice', 'order')),
  complexity_level TEXT CHECK (complexity_level IN ('simple', 'moderate', 'complex')),
  estimated_time_minutes INTEGER, -- Time to complete

  -- Legal context
  related_code_sections TEXT[], -- Array of legal code references
  filing_requirements TEXT, -- Special filing requirements
  filing_deadline_days INTEGER, -- Days before hearing (if applicable)

  -- Version tracking
  revision_date DATE, -- Official JC revision date
  is_current BOOLEAN DEFAULT TRUE,
  supersedes_form_id UUID REFERENCES judicial_council_forms(id),

  -- Usage statistics
  total_field_count INTEGER DEFAULT 0,
  unique_field_count INTEGER DEFAULT 0,
  reused_field_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jc_forms_number ON judicial_council_forms(form_number);
CREATE INDEX idx_jc_forms_series ON judicial_council_forms(form_series);
CREATE INDEX idx_jc_forms_pattern ON judicial_council_forms(form_pattern);
CREATE INDEX idx_jc_forms_current ON judicial_council_forms(is_current);

-- Enable RLS
ALTER TABLE judicial_council_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow read for authenticated users" ON judicial_council_forms
  FOR SELECT TO authenticated
  USING (true);

-- ==================================================
-- TABLE: form_field_mappings
-- ==================================================
-- Maps canonical fields to specific forms (many-to-many relationship)
CREATE TABLE IF NOT EXISTS form_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  form_id UUID NOT NULL REFERENCES judicial_council_forms(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES canonical_fields(id) ON DELETE CASCADE,

  -- Form-specific properties
  form_field_name TEXT NOT NULL, -- Name used in this specific form (may differ from field_key)
  item_number TEXT, -- Item number on form (e.g., "1", "2.a", "3.b")
  section_name TEXT, -- Section/category on form

  -- Position on form
  page_number INTEGER NOT NULL,
  position_top DECIMAL(5,2), -- Percentage from top (0-100)
  position_left DECIMAL(5,2), -- Percentage from left (0-100)
  field_width DECIMAL(5,2), -- Width as percentage
  field_height DECIMAL(5,2), -- Height as percentage (for textareas)

  -- Field behavior
  is_required BOOLEAN DEFAULT FALSE,
  is_readonly BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  placeholder_text TEXT,
  help_text TEXT,

  -- Conditional logic
  depends_on_field_id UUID REFERENCES canonical_fields(id),
  conditional_rule JSONB, -- Rules for when field is visible/enabled

  -- Usage tracking
  usage_count INTEGER DEFAULT 0, -- How many times filled
  last_used_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Uniqueness constraint
  UNIQUE(form_id, field_id)
);

-- Indexes
CREATE INDEX idx_form_field_form ON form_field_mappings(form_id);
CREATE INDEX idx_form_field_field ON form_field_mappings(field_id);
CREATE INDEX idx_form_field_page ON form_field_mappings(form_id, page_number);
CREATE INDEX idx_form_field_item ON form_field_mappings(form_id, item_number);

-- Enable RLS
ALTER TABLE form_field_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow read for authenticated users" ON form_field_mappings
  FOR SELECT TO authenticated
  USING (true);

-- ==================================================
-- MATERIALIZED VIEW: field_reuse_analytics
-- ==================================================
-- Aggregated statistics about field reuse across forms
CREATE MATERIALIZED VIEW field_reuse_analytics AS
SELECT
  cf.id AS field_id,
  cf.field_key,
  cf.field_label,
  cf.field_type,
  cf.category,
  cf.semantic_type,

  -- Reuse statistics
  COUNT(DISTINCT ffm.form_id) AS used_in_form_count,
  COUNT(ffm.id) AS total_occurrences,

  -- Form series breakdown
  STRING_AGG(DISTINCT jcf.form_series, ', ' ORDER BY jcf.form_series) AS form_series_list,
  STRING_AGG(DISTINCT jcf.form_number, ', ' ORDER BY jcf.form_number) AS form_numbers,

  -- Categorization
  CASE
    WHEN COUNT(DISTINCT ffm.form_id) >= 10 THEN 'universal'
    WHEN COUNT(DISTINCT ffm.form_id) >= 5 THEN 'common'
    WHEN COUNT(DISTINCT ffm.form_id) >= 2 THEN 'shared'
    ELSE 'unique'
  END AS reuse_category,

  -- Time saved calculation (estimated)
  COUNT(DISTINCT ffm.form_id) * 30 AS estimated_seconds_saved, -- 30 sec per field entry

  -- Last updated
  MAX(ffm.updated_at) AS last_used_at,
  NOW() AS analytics_generated_at

FROM canonical_fields cf
LEFT JOIN form_field_mappings ffm ON cf.id = ffm.field_id
LEFT JOIN judicial_council_forms jcf ON ffm.form_id = jcf.id
WHERE jcf.is_current = TRUE OR jcf.id IS NULL
GROUP BY cf.id, cf.field_key, cf.field_label, cf.field_type, cf.category, cf.semantic_type;

-- Index for performance
CREATE INDEX idx_field_reuse_category ON field_reuse_analytics(reuse_category);
CREATE INDEX idx_field_reuse_count ON field_reuse_analytics(used_in_form_count DESC);

-- ==================================================
-- MATERIALIZED VIEW: form_completion_analytics
-- ==================================================
-- Statistics about form completion and field coverage
CREATE MATERIALIZED VIEW form_completion_analytics AS
SELECT
  jcf.id AS form_id,
  jcf.form_number,
  jcf.form_name,
  jcf.form_series,
  jcf.form_pattern,

  -- Field statistics
  COUNT(ffm.id) AS total_fields,
  COUNT(DISTINCT ffm.field_id) AS unique_canonical_fields,
  COUNT(DISTINCT CASE WHEN fra.reuse_category = 'universal' THEN ffm.field_id END) AS universal_fields,
  COUNT(DISTINCT CASE WHEN fra.reuse_category = 'common' THEN ffm.field_id END) AS common_fields,
  COUNT(DISTINCT CASE WHEN fra.reuse_category = 'shared' THEN ffm.field_id END) AS shared_fields,
  COUNT(DISTINCT CASE WHEN fra.reuse_category = 'unique' THEN ffm.field_id END) AS unique_fields,

  -- Reuse efficiency
  ROUND(
    (COUNT(DISTINCT CASE WHEN fra.reuse_category IN ('universal', 'common', 'shared') THEN ffm.field_id END)::DECIMAL /
    NULLIF(COUNT(DISTINCT ffm.field_id), 0)) * 100,
    2
  ) AS reuse_percentage,

  -- Time savings
  SUM(fra.estimated_seconds_saved) AS total_seconds_saved,

  -- Vault coverage
  COUNT(DISTINCT CASE WHEN cf.vault_field_name IS NOT NULL THEN ffm.field_id END) AS autofillable_fields,
  ROUND(
    (COUNT(DISTINCT CASE WHEN cf.vault_field_name IS NOT NULL THEN ffm.field_id END)::DECIMAL /
    NULLIF(COUNT(DISTINCT ffm.field_id), 0)) * 100,
    2
  ) AS autofill_coverage_percentage,

  NOW() AS analytics_generated_at

FROM judicial_council_forms jcf
LEFT JOIN form_field_mappings ffm ON jcf.id = ffm.form_id
LEFT JOIN canonical_fields cf ON ffm.field_id = cf.id
LEFT JOIN field_reuse_analytics fra ON cf.id = fra.field_id
WHERE jcf.is_current = TRUE
GROUP BY jcf.id, jcf.form_number, jcf.form_name, jcf.form_series, jcf.form_pattern;

-- Index for performance
CREATE INDEX idx_form_completion_series ON form_completion_analytics(form_series);
CREATE INDEX idx_form_completion_reuse ON form_completion_analytics(reuse_percentage DESC);

-- ==================================================
-- FUNCTIONS
-- ==================================================

-- Function to refresh analytics materialized views
CREATE OR REPLACE FUNCTION refresh_field_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW field_reuse_analytics;
  REFRESH MATERIALIZED VIEW form_completion_analytics;
END;
$$;

-- Function to get field reuse summary
CREATE OR REPLACE FUNCTION get_field_reuse_summary()
RETURNS TABLE (
  reuse_category TEXT,
  field_count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fra.reuse_category,
    COUNT(*) AS field_count,
    ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) AS percentage
  FROM field_reuse_analytics fra
  GROUP BY fra.reuse_category
  ORDER BY
    CASE fra.reuse_category
      WHEN 'universal' THEN 1
      WHEN 'common' THEN 2
      WHEN 'shared' THEN 3
      WHEN 'unique' THEN 4
    END;
END;
$$;

-- Function to get top reused fields
CREATE OR REPLACE FUNCTION get_top_reused_fields(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  field_key TEXT,
  field_label TEXT,
  field_type TEXT,
  used_in_forms BIGINT,
  reuse_category TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fra.field_key,
    fra.field_label,
    fra.field_type,
    fra.used_in_form_count,
    fra.reuse_category
  FROM field_reuse_analytics fra
  ORDER BY fra.used_in_form_count DESC, fra.field_key
  LIMIT limit_count;
END;
$$;

-- ==================================================
-- TRIGGERS
-- ==================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canonical_fields_updated_at
  BEFORE UPDATE ON canonical_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jc_forms_updated_at
  BEFORE UPDATE ON judicial_council_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_field_mappings_updated_at
  BEFORE UPDATE ON form_field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- COMMENTS
-- ==================================================

COMMENT ON TABLE canonical_fields IS 'Unique field definitions used across all California Judicial Council forms';
COMMENT ON TABLE judicial_council_forms IS 'Catalog of California Judicial Council forms';
COMMENT ON TABLE form_field_mappings IS 'Many-to-many mapping between forms and canonical fields';
COMMENT ON MATERIALIZED VIEW field_reuse_analytics IS 'Aggregated statistics about field reuse across forms';
COMMENT ON MATERIALIZED VIEW form_completion_analytics IS 'Statistics about form completion and field coverage';

COMMENT ON COLUMN canonical_fields.field_key IS 'Unique identifier (camelCase) for programmatic access';
COMMENT ON COLUMN canonical_fields.semantic_type IS 'Semantic classification for intelligent mapping (e.g., person_name, address)';
COMMENT ON COLUMN canonical_fields.vault_field_name IS 'Maps to personal_info table column for autofill';
COMMENT ON COLUMN form_field_mappings.position_top IS 'Percentage from top of page (0-100)';
COMMENT ON COLUMN form_field_mappings.usage_count IS 'Number of times this field has been filled by users';
