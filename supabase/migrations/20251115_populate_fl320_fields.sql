-- Populate FL-320 Fields into Canonical Schema
-- Created: 2025-11-15
-- Purpose: Insert FL-320 form and all its fields into the canonical schema

-- ==================================================
-- Insert FL-320 Form
-- ==================================================
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  url,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  related_code_sections,
  filing_requirements,
  filing_deadline_days,
  revision_date,
  is_current
) VALUES (
  'FL-320',
  'Responsive Declaration to Request for Order',
  'FL',
  'Used to respond to a Request for Order (FL-300) in family law cases. Allows respondent to consent or not consent to requested orders.',
  'https://www.courts.ca.gov/documents/fl320.pdf',
  'response',
  'moderate',
  45,
  ARRAY['Code of Civil Procedure, § 1005', 'Cal. Rules of Court, rule 5.92'],
  'Must be filed and served at least 9 court days before the hearing date.',
  9,
  '2016-07-01',
  TRUE
) ON CONFLICT (form_number) DO UPDATE SET
  form_name = EXCLUDED.form_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Get the form ID for FL-320
DO $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'FL-320';

  -- ==================================================
  -- HEADER SECTION - Party/Attorney Information
  -- ==================================================

  -- partyName
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'partyName', 'Name', 'input', 'header', 'party_info', 'person_name',
    'Name of party or attorney representing party',
    'full_name', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'partyName'),
    'partyName', 'Header', 1, 3.5, 2, 38, 'NAME';

  -- firmName
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'firmName', 'Firm Name', 'input', 'header', 'party_info', 'organization_name',
    'Law firm name if represented by attorney',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'firmName'),
    'firmName', 'Header', 1, 6.5, 2, 38, 'FIRM NAME';

  -- streetAddress
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'streetAddress', 'Street Address', 'input', 'header', 'party_info', 'address_street',
    'Street address of party or attorney',
    'street_address', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'streetAddress'),
    'streetAddress', 'Header', 1, 9.5, 2, 38, 'STREET ADDRESS';

  -- city
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'city', 'City', 'input', 'header', 'party_info', 'address_city',
    'City of residence or office',
    'city', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'city'),
    'city', 'Header', 1, 12.5, 2, 18, 'CITY';

  -- state
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'state', 'State', 'input', 'header', 'party_info', 'address_state',
    'State of residence or office',
    'state', FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'state'),
    'state', 'Header', 1, 12.5, 21, 6, 'STATE';

  -- zipCode
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'zipCode', 'ZIP Code', 'input', 'header', 'party_info', 'address_zip',
    'ZIP code of residence or office',
    'zip_code', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'zipCode'),
    'zipCode', 'Header', 1, 12.5, 28, 10, 'ZIP CODE';

  -- telephoneNo
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii, validation_pattern)
  VALUES (
    'telephoneNo', 'Telephone Number', 'input', 'header', 'party_info', 'phone',
    'Contact telephone number',
    'telephone_no', TRUE, '^\(\d{3}\) \d{3}-\d{4}$'
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'telephoneNo'),
    'telephoneNo', 'Header', 1, 15.5, 2, 18, 'TELEPHONE NO';

  -- faxNo
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii, validation_pattern)
  VALUES (
    'faxNo', 'Fax Number', 'input', 'header', 'party_info', 'phone',
    'Fax number for correspondence',
    'fax_no', FALSE, '^\(\d{3}\) \d{3}-\d{4}$'
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'faxNo'),
    'faxNo', 'Header', 1, 15.5, 21, 17, 'FAX NO';

  -- email
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii, validation_pattern)
  VALUES (
    'email', 'Email Address', 'input', 'header', 'party_info', 'email',
    'Email address for electronic correspondence',
    'email_address', TRUE, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'email'),
    'email', 'Header', 1, 18.5, 2, 38, 'E-MAIL ADDRESS';

  -- attorneyFor
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'attorneyFor', 'Attorney For', 'input', 'header', 'party_info', 'person_name',
    'Name of party being represented (or "Self-Represented")',
    'attorney_name', FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'attorneyFor'),
    'attorneyFor', 'Header', 1, 21.5, 2, 28, 'ATTORNEY FOR';

  -- stateBarNumber
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'stateBarNumber', 'State Bar Number', 'input', 'header', 'party_info', 'bar_number',
    'California State Bar number of attorney',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'stateBarNumber'),
    'stateBarNumber', 'Header', 1, 21.5, 31, 9, 'STATE BAR NO';

  -- ==================================================
  -- HEADER SECTION - Court Information
  -- ==================================================

  -- county
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'county', 'County', 'input', 'header', 'court_info', 'jurisdiction',
    'County where case is being heard',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'county'),
    'county', 'Header', 1, 4.5, 42, 30, 'COUNTY OF';

  -- courtStreetAddress
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'courtStreetAddress', 'Court Street Address', 'input', 'header', 'court_info', 'address_street',
    'Physical street address of the court',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtStreetAddress'),
    'courtStreetAddress', 'Header', 1, 7.5, 42, 30, 'STREET ADDRESS';

  -- courtMailingAddress
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'courtMailingAddress', 'Court Mailing Address', 'input', 'header', 'court_info', 'address_mailing',
    'Mailing address of the court (if different from street address)',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtMailingAddress'),
    'courtMailingAddress', 'Header', 1, 10, 42, 30, 'MAILING ADDRESS';

  -- courtCityAndZip
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'courtCityAndZip', 'Court City and ZIP Code', 'input', 'header', 'court_info', 'address_city_zip',
    'City and ZIP code of the court',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtCityAndZip'),
    'courtCityAndZip', 'Header', 1, 12.5, 42, 30, 'CITY AND ZIP CODE';

  -- branchName
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'branchName', 'Branch Name', 'input', 'header', 'court_info', 'branch',
    'Name of court branch (e.g., Central District, Downtown Courthouse)',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'branchName'),
    'branchName', 'Header', 1, 15, 42, 30, 'BRANCH NAME';

  -- ==================================================
  -- HEADER SECTION - Case Information
  -- ==================================================

  -- petitioner
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'petitioner', 'Petitioner', 'input', 'header', 'case_info', 'person_name',
    'Name of the petitioner in the case',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'petitioner'),
    'petitioner', 'Header', 1, 19, 74, 24, 'PETITIONER';

  -- respondent
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'respondent', 'Respondent', 'input', 'header', 'case_info', 'person_name',
    'Name of the respondent in the case',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'respondent'),
    'respondent', 'Header', 1, 21, 74, 24, 'RESPONDENT';

  -- otherParentParty
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'otherParentParty', 'Other Parent/Party', 'input', 'header', 'case_info', 'person_name',
    'Name of other parent or third party involved in case',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'otherParentParty'),
    'otherParentParty', 'Header', 1, 23, 74, 24, 'OTHER PARENT/PARTY';

  -- caseNumber
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'caseNumber', 'Case Number', 'input', 'header', 'case_info', 'case_id',
    'Court-assigned case number',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'caseNumber'),
    'caseNumber', 'Header', 1, 27.5, 74, 24, 'CASE NUMBER';

  -- hearingDate
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'hearingDate', 'Hearing Date', 'date', 'header', 'hearing_info', 'date',
    'Date of court hearing',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'hearingDate'),
    'hearingDate', 'Header', 1, 29, 74, 11, 'HEARING DATE';

  -- hearingTime
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'hearingTime', 'Hearing Time', 'input', 'header', 'hearing_info', 'time',
    'Time of court hearing',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'hearingTime'),
    'hearingTime', 'Header', 1, 29, 86, 6, 'TIME';

  -- hearingDepartment
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'hearingDepartment', 'Hearing Department', 'input', 'header', 'hearing_info', 'department',
    'Court department or division number',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'hearingDepartment'),
    'hearingDepartment', 'Header', 1, 29, 93, 5, 'DEPT';

  -- hearingRoom
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'hearingRoom', 'Hearing Room', 'input', 'header', 'hearing_info', 'room',
    'Court room number',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'hearingRoom'),
    'hearingRoom', 'Header', 1, 29, 93, 5, 'ROOM';

  -- ==================================================
  -- Update form statistics
  -- ==================================================
  UPDATE judicial_council_forms
  SET
    total_field_count = (SELECT COUNT(*) FROM form_field_mappings WHERE form_id = v_form_id),
    unique_field_count = (SELECT COUNT(DISTINCT field_id) FROM form_field_mappings WHERE form_id = v_form_id),
    updated_at = NOW()
  WHERE id = v_form_id;

END $$;

-- Refresh analytics views
SELECT refresh_field_analytics();

-- Display summary
SELECT
  'FL-320 Populated' AS status,
  (SELECT total_field_count FROM judicial_council_forms WHERE form_number = 'FL-320') AS total_fields,
  (SELECT unique_field_count FROM judicial_council_forms WHERE form_number = 'FL-320') AS unique_fields;
