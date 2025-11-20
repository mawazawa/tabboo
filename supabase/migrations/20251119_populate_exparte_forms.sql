-- Populate Ex Parte RFO Forms in Judicial Council Forms Catalog
-- Created: 2025-11-19
-- Purpose: Add FL-300, FL-303, FL-305 to forms catalog

-- ========================================
-- INSERT: FL-300 (Request for Order)
-- ========================================
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  pdf_url,
  info_sheet_url,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  filing_requirements,
  filing_deadline_days,
  revision_date,
  is_current,
  total_field_count
) VALUES (
  'FL-300',
  'Request for Order',
  'FL',
  'Primary form for requesting court orders in family law cases. Can be used for child custody, visitation, support, property control, attorney fees, and other family law matters.',
  'https://courts.ca.gov/system/files?file=2025-07/fl300.pdf',
  'https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl300info.pdf',
  'request',
  'moderate',
  45, -- Estimated 45 minutes to complete
  'File and serve at least 16 court days before hearing (unless requesting ex parte orders). Attach supporting declarations and financial forms if applicable.',
  16, -- 16 court days before hearing (standard)
  '2025-07-01',
  TRUE,
  65  -- Approximate field count (will update after field mapping)
) ON CONFLICT (form_number) DO UPDATE SET
  form_name = EXCLUDED.form_name,
  description = EXCLUDED.description,
  pdf_url = EXCLUDED.pdf_url,
  info_sheet_url = EXCLUDED.info_sheet_url,
  revision_date = EXCLUDED.revision_date,
  updated_at = NOW();

-- ========================================
-- INSERT: FL-303 (Declaration Regarding Notice)
-- ========================================
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  pdf_url,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  filing_requirements,
  revision_date,
  is_current,
  total_field_count
) VALUES (
  'FL-303',
  'Declaration Regarding Notice and Service of Request for Temporary Emergency (Ex Parte) Orders',
  'FL',
  'Used to declare notice given (or good cause for no notice) when requesting temporary emergency (ex parte) orders. Required attachment when requesting ex parte relief on FL-300.',
  'https://www.courts.ca.gov/documents/fl303.pdf',
  'declaration',
  'simple',
  15, -- Estimated 15 minutes to complete
  'Must be filed with FL-300 when requesting temporary emergency orders. Declare notice given to other party or provide good cause why notice was not given.',
  '2020-07-01',
  TRUE,
  30  -- Approximate field count
) ON CONFLICT (form_number) DO UPDATE SET
  form_name = EXCLUDED.form_name,
  description = EXCLUDED.description,
  pdf_url = EXCLUDED.pdf_url,
  revision_date = EXCLUDED.revision_date,
  updated_at = NOW();

-- ========================================
-- INSERT: FL-305 (Temporary Emergency Orders)
-- ========================================
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  pdf_url,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  filing_requirements,
  revision_date,
  is_current,
  total_field_count
) VALUES (
  'FL-305',
  'Temporary Emergency (Ex Parte) Orders',
  'FL',
  'Court-issued temporary orders granted on an emergency basis. This form is completed by the requesting party as a proposed order, then signed by the judge if granted. Contains specific temporary relief requested pending full hearing.',
  'https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl305.pdf',
  'order',
  'moderate',
  30, -- Estimated 30 minutes to complete
  'Draft proposed temporary orders as part of ex parte application. Must be served with FL-300 and all supporting documents if temporary orders are granted.',
  '2016-07-01',
  TRUE,
  45  -- Approximate field count
) ON CONFLICT (form_number) DO UPDATE SET
  form_name = EXCLUDED.form_name,
  description = EXCLUDED.description,
  pdf_url = EXCLUDED.pdf_url,
  revision_date = EXCLUDED.revision_date,
  updated_at = NOW();

-- ========================================
-- Comments for documentation
-- ========================================
COMMENT ON TABLE judicial_council_forms IS 'Added FL-300, FL-303, FL-305 for ex parte RFO workflow support';
