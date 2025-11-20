-- Populate DV-100 Fields - Phase 1 (Critical Path Fields)
-- Created: 2025-11-19
-- Purpose: Insert DV-100 form and critical fields into canonical schema
-- Phase 1 includes: Header, Items 1-3, Item 5, Item 33 (~81 fields)
-- Note: Positions are estimated and should be refined using edit mode

-- ==================================================
-- Insert DV-100 Form
-- ==================================================
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  url,
  pdf_url,
  info_sheet_url,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  related_code_sections,
  filing_requirements,
  revision_date,
  total_field_count,
  is_current
) VALUES (
  'DV-100',
  'Request for Domestic Violence Restraining Order',
  'DV',
  'Petition for domestic violence restraining order with temporary orders. Used to request protection from abuse.',
  'https://www.courts.ca.gov/documents/dv100.pdf',
  'https://www.courts.ca.gov/documents/dv100.pdf',
  'https://www.courts.ca.gov/documents/dv100info.pdf',
  'request',
  'complex',
  90,
  ARRAY['Family Code § 6200-6389', 'Code of Civil Procedure § 527.6'],
  'Must be filed with CLETS-001. Serve respondent and file proof of service before hearing.',
  '2025-01-01',
  837,
  TRUE
) ON CONFLICT (form_number) DO UPDATE SET
  form_name = EXCLUDED.form_name,
  description = EXCLUDED.description,
  revision_date = EXCLUDED.revision_date,
  total_field_count = EXCLUDED.total_field_count,
  updated_at = NOW();

-- ==================================================
-- FIELD INSERTIONS
-- ==================================================
DO $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'DV-100';

  -- ==================================================
  -- HEADER SECTION - Court and Attorney Information
  -- ==================================================

  -- Superior Court County
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'courtCounty', 'Superior Court County', 'input', 'header', 'court_info', 'text',
    'County of Superior Court where case is filed',
    NULL, FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtCounty'),
    'courtCounty', 'Header', 1, 8.0, 28.0, 25.0, FALSE;

  -- Court Branch
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'courtBranch', 'Court Branch', 'input', 'header', 'court_info', 'text',
    'Branch name of Superior Court',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtBranch'),
    'courtBranch', 'Header', 1, 10.5, 28.0, 25.0, FALSE;

  -- Court Street Address
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'courtStreetAddress', 'Court Street Address', 'input', 'header', 'court_info', 'address_street',
    'Street address of courthouse',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtStreetAddress'),
    'courtStreetAddress', 'Header', 1, 13.0, 28.0, 25.0, FALSE;

  -- Court City and ZIP
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'courtCityAndZip', 'Court City and ZIP', 'input', 'header', 'court_info', 'address_city_zip',
    'City and ZIP code of courthouse',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'courtCityAndZip'),
    'courtCityAndZip', 'Header', 1, 15.5, 28.0, 25.0, FALSE;

  -- Attorney/Party Name (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'partyName'),
    'partyName', 'Header', 1, 8.0, 2.0, 22.0, FALSE, 'Your Name (or your lawyer\'s, if you have one)';

  -- State Bar Number
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, validation_pattern, is_pii)
  VALUES (
    'attorneyBarNumber', 'State Bar Number', 'input', 'header', 'attorney_info', 'bar_number',
    'Attorney State Bar Number',
    '^\d{6}$', FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'attorneyBarNumber'),
    'attorneyBarNumber', 'Header', 1, 8.0, 56.0, 12.0, FALSE, 'State Bar No.';

  -- Firm Name (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'firmName'),
    'firmName', 'Header', 1, 10.5, 2.0, 22.0, 'Firm Name (if applicable)';

  -- Street Address (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'streetAddress'),
    'streetAddress', 'Header', 1, 13.0, 2.0, 22.0, TRUE, 'Street Address';

  -- City (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'city'),
    'city', 'Header', 1, 15.5, 2.0, 10.0, TRUE;

  -- State (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, default_value)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'state'),
    'state', 'Header', 1, 15.5, 13.0, 3.0, 'CA';

  -- ZIP Code (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'zipCode'),
    'zipCode', 'Header', 1, 15.5, 17.0, 7.0, TRUE;

  -- Telephone Number (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'telephoneNo'),
    'telephoneNo', 'Header', 1, 18.0, 2.0, 11.0, TRUE;

  -- Fax Number (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'faxNo'),
    'faxNo', 'Header', 1, 18.0, 14.0, 10.0;

  -- Email (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'email'),
    'email', 'Header', 1, 20.5, 2.0, 22.0;

  -- Attorney For
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'attorneyFor', 'Attorney For', 'input', 'header', 'attorney_info', 'text',
    'Identifies whom the attorney represents',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'attorneyFor'),
    'attorneyFor', 'Header', 1, 23.0, 2.0, 22.0, 'Petitioner (person asking for protection)';

  -- Petitioner Name
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'petitioner', 'Petitioner Name', 'input', 'header', 'party_info', 'person_name',
    'Name of person asking for protection (petitioner)',
    'full_name', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'petitioner'),
    'petitioner', 'Header', 1, 28.0, 28.0, 25.0, TRUE;

  -- Respondent Name (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'respondent'),
    'respondent', 'Header', 1, 30.5, 28.0, 25.0, TRUE;

  -- Case Number (reuse from FL-320)
  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'caseNumber'),
    'caseNumber', 'Header', 1, 28.0, 56.0, 12.0;

  -- ==================================================
  -- ITEM 1: Person Asking for Protection (Page 1)
  -- ==================================================

  -- 1a. Your Full Name
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'item1a_fullName', 'Your Full Name', 'input', 'party_info', 'petitioner', 'person_name',
    'Full legal name of person asking for protection',
    'full_name', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1a_fullName'),
    'item1a_fullName', '1', 1, 35.0, 15.0, 50.0, TRUE;

  -- 1b. Date of Birth
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'item1b_dateOfBirth', 'Date of Birth', 'date', 'party_info', 'petitioner', 'date_of_birth',
    'Date of birth of person asking for protection',
    'date_of_birth', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1b_dateOfBirth'),
    'item1b_dateOfBirth', '1', 1, 37.5, 15.0, 15.0, TRUE;

  -- 1c. Age
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, validation_pattern, is_pii)
  VALUES (
    'item1c_age', 'Age', 'input', 'party_info', 'petitioner', 'number',
    'Age of person asking for protection',
    '^\d{1,3}$', FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1c_age'),
    'item1c_age', '1', 1, 37.5, 32.0, 5.0;

  -- 1d. Sex
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1d_sex', 'Sex', 'select', 'party_info', 'petitioner', 'sex',
    'Sex/gender of person asking for protection',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1d_sex'),
    'item1d_sex', '1', 1, 37.5, 39.0, 8.0;

  -- 1e. Race
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1e_race', 'Race', 'input', 'party_info', 'petitioner', 'text',
    'Race of person asking for protection',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1e_race'),
    'item1e_race', '1', 1, 40.0, 15.0, 15.0;

  -- 1f. Height
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1f_height', 'Height', 'input', 'party_info', 'petitioner', 'physical_description',
    'Height of person asking for protection',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1f_height'),
    'item1f_height', '1', 1, 40.0, 32.0, 8.0, 'e.g., 5''8"';

  -- 1g. Weight
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1g_weight', 'Weight', 'input', 'party_info', 'petitioner', 'physical_description',
    'Weight of person asking for protection',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, placeholder_text)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1g_weight'),
    'item1g_weight', '1', 1, 40.0, 42.0, 8.0, 'lbs';

  -- 1h. Hair Color
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1h_hairColor', 'Hair Color', 'input', 'party_info', 'petitioner', 'physical_description',
    'Hair color of person asking for protection',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1h_hairColor'),
    'item1h_hairColor', '1', 1, 42.5, 15.0, 10.0;

  -- 1i. Eye Color
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1i_eyeColor', 'Eye Color', 'input', 'party_info', 'petitioner', 'physical_description',
    'Eye color of person asking for protection',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1i_eyeColor'),
    'item1i_eyeColor', '1', 1, 42.5, 27.0, 10.0;

  -- 1j. Distinguishing Features
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item1j_distinguishingFeatures', 'Distinguishing Features', 'textarea', 'party_info', 'petitioner', 'physical_description',
    'Distinguishing features (tattoos, scars, etc.)',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item1j_distinguishingFeatures'),
    'item1j_distinguishingFeatures', '1', 1, 45.0, 15.0, 50.0, 4.0;

  -- ==================================================
  -- ITEM 2: Person You Want Protection From (Page 1)
  -- ==================================================

  -- 2a. Full Name
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item2a_fullName', 'Respondent Full Name', 'input', 'party_info', 'respondent', 'person_name',
    'Full legal name of person you want protection from',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item2a_fullName'),
    'item2a_fullName', '2', 1, 51.0, 15.0, 50.0, TRUE;

  -- 2b. Date of Birth
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item2b_dateOfBirth', 'Respondent Date of Birth', 'date', 'party_info', 'respondent', 'date_of_birth',
    'Date of birth of respondent',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item2b_dateOfBirth'),
    'item2b_dateOfBirth', '2', 1, 53.5, 15.0, 15.0;

  -- 2c. Sex
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item2c_sex', 'Respondent Sex', 'select', 'party_info', 'respondent', 'sex',
    'Sex/gender of respondent',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item2c_sex'),
    'item2c_sex', '2', 1, 53.5, 32.0, 8.0;

  -- 2d. Relationship
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item2d_relationship', 'Relationship to You', 'input', 'relationship', NULL, 'text',
    'Relationship of respondent to petitioner',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item2d_relationship'),
    'item2d_relationship', '2', 1, 56.0, 15.0, 25.0;

  -- 2e. Other Information
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item2e_otherInfo', 'Other Information About Respondent', 'textarea', 'party_info', 'respondent', 'long_text',
    'Additional information about respondent (address, workplace, vehicle, etc.)',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item2e_otherInfo'),
    'item2e_otherInfo', '2', 1, 58.5, 15.0, 50.0, 6.0;

  -- ==================================================
  -- ITEM 3: Relationship (Pages 1-2)
  -- Core checkboxes only for Phase 1
  -- ==================================================

  -- 3a. Married
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3a_married', 'Married to Each Other', 'checkbox', 'relationship', 'marital_status', 'boolean',
    'We are currently married',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3a_married'),
    'item3a_married', '3', 1, 67.0, 4.0, 3.0;

  -- 3b. Registered Domestic Partners
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3b_domesticPartners', 'Registered Domestic Partners', 'checkbox', 'relationship', 'marital_status', 'boolean',
    'We are registered domestic partners',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3b_domesticPartners'),
    'item3b_domesticPartners', '3', 1, 69.5, 4.0, 3.0;

  -- 3c. Divorced
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3c_divorced', 'Divorced', 'checkbox', 'relationship', 'marital_status', 'boolean',
    'We are divorced',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3c_divorced'),
    'item3c_divorced', '3', 1, 72.0, 4.0, 3.0;

  -- 3d. Dating/Dated Seriously
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3d_datingSeriusly', 'Dating or Dated Seriously', 'checkbox', 'relationship', 'dating', 'boolean',
    'We are dating or dated seriously',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3d_datingSeriusly'),
    'item3d_datingSeriusly', '3', 1, 74.5, 4.0, 3.0;

  -- 3e. Engaged
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3e_engaged', 'Engaged to Be Married', 'checkbox', 'relationship', 'dating', 'boolean',
    'We are/were engaged',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3e_engaged'),
    'item3e_engaged', '3', 1, 77.0, 4.0, 3.0;

  -- 3f. Have Child Together
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3f_haveChildTogether', 'Have a Child Together', 'checkbox', 'relationship', 'parental', 'boolean',
    'We have a child together',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3f_haveChildTogether'),
    'item3f_haveChildTogether', '3', 1, 79.5, 4.0, 3.0;

  -- 3g. Parent and Child
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3g_parentAndChild', 'Parent and Child', 'checkbox', 'relationship', 'family', 'boolean',
    'We are parent and child',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3g_parentAndChild'),
    'item3g_parentAndChild', '3', 2, 5.0, 4.0, 3.0;

  -- 3h. In-laws
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3h_inLaws', 'In-laws', 'checkbox', 'relationship', 'family', 'boolean',
    'We are in-laws',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3h_inLaws'),
    'item3h_inLaws', '3', 2, 7.5, 4.0, 3.0;

  -- 3i. Siblings
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3i_siblings', 'Siblings (Brothers/Sisters)', 'checkbox', 'relationship', 'family', 'boolean',
    'We are siblings',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3i_siblings'),
    'item3i_siblings', '3', 2, 10.0, 4.0, 3.0;

  -- 3j. Grandparent and Grandchild
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3j_grandparentGrandchild', 'Grandparent and Grandchild', 'checkbox', 'relationship', 'family', 'boolean',
    'We are grandparent and grandchild',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3j_grandparentGrandchild'),
    'item3j_grandparentGrandchild', '3', 2, 12.5, 4.0, 3.0;

  -- 3k. Other Family Relationship
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3k_otherFamily', 'Other Family Relationship', 'checkbox', 'relationship', 'family', 'boolean',
    'We are related by blood or marriage',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3k_otherFamily'),
    'item3k_otherFamily', '3', 2, 15.0, 4.0, 3.0;

  -- 3l. Living Together (Now or Past)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item3l_livingTogether', 'Living Together Now or in Past', 'checkbox', 'relationship', 'cohabitation', 'boolean',
    'We are living together or have lived together',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item3l_livingTogether'),
    'item3l_livingTogether', '3', 2, 17.5, 4.0, 3.0;

  -- ==================================================
  -- ITEM 5: Most Recent Abuse (Page 3)
  -- Complete abuse documentation section
  -- ==================================================

  -- 5a. Date of Abuse
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5a_dateOfAbuse', 'Date of Most Recent Abuse', 'date', 'abuse_history', 'incident', 'date',
    'Date of the most recent abuse incident',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5a_dateOfAbuse'),
    'item5a_dateOfAbuse', '5', 3, 10.0, 15.0, 15.0, TRUE;

  -- 5b. Witnesses - Don't Know
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5b_witnessDontKnow', 'Witnesses: Don''t Know', 'checkbox', 'abuse_history', 'witness', 'boolean',
    'Don''t know if anyone saw or heard the abuse',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5b_witnessDontKnow'),
    'item5b_witnessDontKnow', '5', 3, 13.0, 4.0, 3.0;

  -- 5b. Witnesses - No
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5b_witnessNo', 'Witnesses: No', 'checkbox', 'abuse_history', 'witness', 'boolean',
    'No one saw or heard the abuse',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5b_witnessNo'),
    'item5b_witnessNo', '5', 3, 15.5, 4.0, 3.0;

  -- 5b. Witnesses - Yes
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5b_witnessYes', 'Witnesses: Yes', 'checkbox', 'abuse_history', 'witness', 'boolean',
    'Someone saw or heard the abuse',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5b_witnessYes'),
    'item5b_witnessYes', '5', 3, 18.0, 4.0, 3.0;

  -- 5b. Witness Names
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5b_witnessNames', 'Witness Names', 'textarea', 'abuse_history', 'witness', 'long_text',
    'Names of witnesses who saw or heard the abuse',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5b_witnessNames'),
    'item5b_witnessNames', '5', 3, 20.5, 10.0, 55.0, 4.0;

  -- 5c. Weapon - No
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5c_weaponNo', 'Weapon Involved: No', 'checkbox', 'abuse_history', 'weapon', 'boolean',
    'No weapon was involved',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5c_weaponNo'),
    'item5c_weaponNo', '5', 3, 26.0, 4.0, 3.0;

  -- 5c. Weapon - Yes
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5c_weaponYes', 'Weapon Involved: Yes', 'checkbox', 'abuse_history', 'weapon', 'boolean',
    'A weapon was involved',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5c_weaponYes'),
    'item5c_weaponYes', '5', 3, 28.5, 4.0, 3.0;

  -- 5c. Weapon Description
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5c_weaponDescribe', 'Weapon Description', 'textarea', 'abuse_history', 'weapon', 'long_text',
    'Description of weapon used',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5c_weaponDescribe'),
    'item5c_weaponDescribe', '5', 3, 31.0, 10.0, 55.0, 3.0;

  -- 5d. Physical Harm - No
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5d_harmNo', 'Physical Harm: No', 'checkbox', 'abuse_history', 'harm', 'boolean',
    'Person did not cause physical harm',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5d_harmNo'),
    'item5d_harmNo', '5', 3, 36.0, 4.0, 3.0;

  -- 5d. Physical Harm - Yes
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5d_harmYes', 'Physical Harm: Yes', 'checkbox', 'abuse_history', 'harm', 'boolean',
    'Person caused physical harm',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5d_harmYes'),
    'item5d_harmYes', '5', 3, 38.5, 4.0, 3.0;

  -- 5d. Harm Description
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5d_harmDescribe', 'Harm Description', 'textarea', 'abuse_history', 'harm', 'long_text',
    'Description of physical harm caused',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5d_harmDescribe'),
    'item5d_harmDescribe', '5', 3, 41.0, 10.0, 55.0, 3.0;

  -- 5e. Police Called - Don't Know
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5e_policeDontKnow', 'Police Called: Don''t Know', 'checkbox', 'abuse_history', 'police', 'boolean',
    'Don''t know if police were called',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5e_policeDontKnow'),
    'item5e_policeDontKnow', '5', 3, 46.0, 4.0, 3.0;

  -- 5e. Police Called - No
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5e_policeNo', 'Police Called: No', 'checkbox', 'abuse_history', 'police', 'boolean',
    'Police were not called',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5e_policeNo'),
    'item5e_policeNo', '5', 3, 48.5, 4.0, 3.0;

  -- 5e. Police Called - Yes
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5e_policeYes', 'Police Called: Yes', 'checkbox', 'abuse_history', 'police', 'boolean',
    'Police were called',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5e_policeYes'),
    'item5e_policeYes', '5', 3, 51.0, 4.0, 3.0;

  -- 5f. Abuse Details
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5f_details', 'Detailed Description of Abuse', 'textarea', 'abuse_history', 'incident', 'long_text',
    'Detailed description of what happened, including exact words if threats',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5f_details'),
    'item5f_details', '5', 3, 55.0, 4.0, 61.0, 15.0, TRUE;

  -- 5g. Frequency - Just Once
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5g_justOnce', 'Happened Just Once', 'checkbox', 'abuse_history', 'frequency', 'boolean',
    'Abuse happened only one time',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5g_justOnce'),
    'item5g_justOnce', '5', 3, 72.0, 4.0, 3.0;

  -- 5g. Frequency - 2 to 5 Times
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5g_2to5times', 'Happened 2-5 Times', 'checkbox', 'abuse_history', 'frequency', 'boolean',
    'Abuse happened 2-5 times',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5g_2to5times'),
    'item5g_2to5times', '5', 3, 74.5, 4.0, 3.0;

  -- 5g. Frequency - Weekly
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5g_weekly', 'Happened About Once a Week', 'checkbox', 'abuse_history', 'frequency', 'boolean',
    'Abuse happened about once a week',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5g_weekly'),
    'item5g_weekly', '5', 3, 77.0, 4.0, 3.0;

  -- 5g. Frequency - Other
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5g_other', 'Happened Other Frequency', 'checkbox', 'abuse_history', 'frequency', 'boolean',
    'Abuse happened with other frequency (specify)',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5g_other'),
    'item5g_other', '5', 3, 79.5, 4.0, 3.0;

  -- 5g. Dates or Estimates
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item5g_dates', 'Dates or Estimates of Abuse', 'textarea', 'abuse_history', 'frequency', 'long_text',
    'Dates or estimates of when abuse occurred',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item5g_dates'),
    'item5g_dates', '5', 3, 82.0, 10.0, 55.0, 5.0;

  -- ==================================================
  -- ITEM 33: Your Signature (Page 13)
  -- ==================================================

  -- 33. Date
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item33_date', 'Signature Date', 'date', 'signature', 'petitioner_signature', 'date',
    'Date petitioner signed the form',
    FALSE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item33_date'),
    'item33_date', '33', 13, 55.0, 4.0, 15.0, TRUE;

  -- 33. Print Name
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES (
    'item33_printName', 'Type or Print Your Name', 'input', 'signature', 'petitioner_signature', 'person_name',
    'Petitioner printed name for signature',
    'full_name', TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item33_printName'),
    'item33_printName', '33', 13, 60.0, 4.0, 30.0, TRUE;

  -- 33. Sign Name
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES (
    'item33_signName', 'Sign Your Name', 'input', 'signature', 'petitioner_signature', 'signature',
    'Petitioner handwritten signature',
    TRUE
  ) ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT
    v_form_id,
    (SELECT id FROM canonical_fields WHERE field_key = 'item33_signName'),
    'item33_signName', '33', 13, 60.0, 36.0, 29.0, TRUE;

END $$;

-- ==================================================
-- COMMENTS
-- ==================================================

COMMENT ON TABLE judicial_council_forms IS 'Contains DV-100 form metadata (Phase 1 implementation)';

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Count inserted fields
-- SELECT COUNT(*) AS phase1_fields
-- FROM form_field_mappings ffm
-- JOIN judicial_council_forms jcf ON ffm.form_id = jcf.id
-- WHERE jcf.form_number = 'DV-100';
-- Expected: ~81 fields

-- List all DV-100 fields by item
-- SELECT item_number, COUNT(*) AS field_count
-- FROM form_field_mappings ffm
-- JOIN judicial_council_forms jcf ON ffm.form_id = jcf.id
-- WHERE jcf.form_number = 'DV-100'
-- GROUP BY item_number
-- ORDER BY item_number;
