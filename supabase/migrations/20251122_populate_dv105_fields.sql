-- Populate DV-105 Fields - Complete Form
-- Created: 2025-11-22
-- Purpose: Insert DV-105 form and all fields into canonical schema
-- Form: Request for Child Custody and Visitation Orders (6 pages, 13 items)
-- Note: Positions are estimated and should be refined using Glass Layer Field Mapper

-- ==================================================
-- Insert DV-105 Form
-- ==================================================
INSERT INTO judicial_council_forms (
  form_number,
  form_name,
  form_series,
  description,
  url,
  pdf_url,
  form_pattern,
  complexity_level,
  estimated_time_minutes,
  related_code_sections,
  filing_requirements,
  revision_date,
  total_field_count,
  is_current
) VALUES (
  'DV-105',
  'Request for Child Custody and Visitation Orders',
  'DV',
  'Attachment to DV-100 for requesting child custody and visitation orders in domestic violence cases.',
  'https://www.courts.ca.gov/documents/dv105.pdf',
  'https://www.courts.ca.gov/documents/dv105.pdf',
  'attachment',
  'moderate',
  45,
  ARRAY['Family Code §§ 3048, 3063, 6323, 6323.5'],
  'Must be attached to DV-100. Cannot be filed independently.',
  '2024-01-01',
  466,
  TRUE
) ON CONFLICT (form_number) DO UPDATE SET
  form_name = EXCLUDED.form_name,
  description = EXCLUDED.description,
  revision_date = EXCLUDED.revision_date,
  total_field_count = EXCLUDED.total_field_count,
  updated_at = NOW();

DO $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'DV-105';

  -- ==================================================
  -- HEADER (Page 1)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('dv105_caseNumber', 'Case Number (DV-105)', 'input', 'header', 'case_info', 'case_number', 'Case number from DV-100', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'dv105_caseNumber'), 'dv105_caseNumber', 'Header', 1, 5.0, 70.0, 25.0, TRUE;

  -- ==================================================
  -- ITEM 1: Your Information (Page 1)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item1_name', 'Your name (DV-105)', 'input', 'party_info', 'petitioner', 'name', 'Petitioner full name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item1_name'), 'item1_name', '1', 1, 12.0, 15.0, 50.0, TRUE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item1_relationshipParent', 'Relationship - Parent', 'checkbox', 'party_info', 'petitioner', 'boolean', 'Petitioner is parent', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item1_relationshipParent'), 'item1_relationshipParent', '1', 1, 15.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item1_relationshipGuardian', 'Relationship - Legal Guardian', 'checkbox', 'party_info', 'petitioner', 'boolean', 'Petitioner is legal guardian', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item1_relationshipGuardian'), 'item1_relationshipGuardian', '1', 1, 15.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item1_relationshipOther', 'Relationship - Other', 'checkbox', 'party_info', 'petitioner', 'boolean', 'Petitioner has other relationship', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item1_relationshipOther'), 'item1_relationshipOther', '1', 1, 15.0, 45.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item1_relationshipOtherDescribe', 'Relationship - Other describe', 'input', 'party_info', 'petitioner', 'text', 'Description of other relationship', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item1_relationshipOtherDescribe'), 'item1_relationshipOtherDescribe', '1', 1, 15.0, 55.0, 40.0, FALSE;

  -- ==================================================
  -- ITEM 2: Person You Want Protection From (Page 1)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item2_name', 'Person 2 name (DV-105)', 'input', 'party_info', 'respondent', 'name', 'Respondent full name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item2_name'), 'item2_name', '2', 1, 20.0, 15.0, 50.0, TRUE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item2_relationshipParent', 'Person 2 - Parent', 'checkbox', 'party_info', 'respondent', 'boolean', 'Respondent is parent', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item2_relationshipParent'), 'item2_relationshipParent', '2', 1, 23.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item2_relationshipGuardian', 'Person 2 - Legal Guardian', 'checkbox', 'party_info', 'respondent', 'boolean', 'Respondent is legal guardian', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item2_relationshipGuardian'), 'item2_relationshipGuardian', '2', 1, 23.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item2_relationshipOther', 'Person 2 - Other', 'checkbox', 'party_info', 'respondent', 'boolean', 'Respondent has other relationship', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item2_relationshipOther'), 'item2_relationshipOther', '2', 1, 23.0, 45.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item2_relationshipOtherDescribe', 'Person 2 - Other describe', 'input', 'party_info', 'respondent', 'text', 'Description of other relationship', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item2_relationshipOtherDescribe'), 'item2_relationshipOtherDescribe', '2', 1, 23.0, 55.0, 40.0, FALSE;

  -- ==================================================
  -- ITEM 3: Children Under 18 (Page 1)
  -- ==================================================

  -- Child a
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3a_name', 'Child a name', 'input', 'children', 'child_a', 'name', 'First childs name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3a_name'), 'item3a_name', '3a', 1, 30.0, 5.0, 45.0, TRUE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3a_dateOfBirth', 'Child a DOB', 'input', 'children', 'child_a', 'date', 'First childs date of birth', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3a_dateOfBirth'), 'item3a_dateOfBirth', '3a', 1, 30.0, 55.0, 20.0, TRUE;

  -- Child b
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3b_name', 'Child b name', 'input', 'children', 'child_b', 'name', 'Second childs name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3b_name'), 'item3b_name', '3b', 1, 33.0, 5.0, 45.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3b_dateOfBirth', 'Child b DOB', 'input', 'children', 'child_b', 'date', 'Second childs date of birth', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3b_dateOfBirth'), 'item3b_dateOfBirth', '3b', 1, 33.0, 55.0, 20.0, FALSE;

  -- Child c
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3c_name', 'Child c name', 'input', 'children', 'child_c', 'name', 'Third childs name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3c_name'), 'item3c_name', '3c', 1, 36.0, 5.0, 45.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3c_dateOfBirth', 'Child c DOB', 'input', 'children', 'child_c', 'date', 'Third childs date of birth', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3c_dateOfBirth'), 'item3c_dateOfBirth', '3c', 1, 36.0, 55.0, 20.0, FALSE;

  -- Child d
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3d_name', 'Child d name', 'input', 'children', 'child_d', 'name', 'Fourth childs name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3d_name'), 'item3d_name', '3d', 1, 39.0, 5.0, 45.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3d_dateOfBirth', 'Child d DOB', 'input', 'children', 'child_d', 'date', 'Fourth childs date of birth', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3d_dateOfBirth'), 'item3d_dateOfBirth', '3d', 1, 39.0, 55.0, 20.0, FALSE;

  -- Need more space
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item3_needMoreSpace', 'Need more space for children', 'checkbox', 'children', 'additional', 'boolean', 'Need to attach additional sheet', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item3_needMoreSpace'), 'item3_needMoreSpace', '3', 1, 42.0, 5.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 4: City and State Where Children Lived (Page 1)
  -- ==================================================

  -- Item 4a
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a_yes', 'Children lived together - Yes', 'checkbox', 'residence_history', 'item_4a', 'boolean', 'All children lived together', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a_yes'), 'item4a_yes', '4a', 1, 48.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a_no', 'Children lived together - No', 'checkbox', 'residence_history', 'item_4a', 'boolean', 'Children lived separately (use DV-105A)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a_no'), 'item4a_no', '4a', 1, 48.0, 30.0, 3.0, FALSE;

  -- Item 4b: Residence history rows (7 rows)
  -- Row 1
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_fromDate', 'Row 1 from date', 'input', 'residence_history', 'row_1', 'date', 'Start date of residence', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_fromDate'), 'item4b_row1_fromDate', '4b', 1, 54.0, 5.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_toPresent', 'Row 1 to present', 'checkbox', 'residence_history', 'row_1', 'boolean', 'Residence continues to present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_toPresent'), 'item4b_row1_toPresent', '4b', 1, 54.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_toDate', 'Row 1 to date', 'input', 'residence_history', 'row_1', 'date', 'End date of residence', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_toDate'), 'item4b_row1_toDate', '4b', 1, 54.0, 26.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_location', 'Row 1 location', 'input', 'residence_history', 'row_1', 'text', 'City, State, and Tribal Land', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_location'), 'item4b_row1_location', '4b', 1, 54.0, 41.0, 25.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_keepPrivate', 'Row 1 keep private', 'checkbox', 'residence_history', 'row_1', 'boolean', 'Keep current location private', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_keepPrivate'), 'item4b_row1_keepPrivate', '4b', 1, 54.0, 68.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_withMe', 'Row 1 with me', 'checkbox', 'residence_history', 'row_1', 'boolean', 'Children lived with me', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_withMe'), 'item4b_row1_withMe', '4b', 1, 54.0, 74.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_withPerson2', 'Row 1 with person 2', 'checkbox', 'residence_history', 'row_1', 'boolean', 'Children lived with person in 2', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_withPerson2'), 'item4b_row1_withPerson2', '4b', 1, 54.0, 80.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row1_withOther', 'Row 1 with other', 'checkbox', 'residence_history', 'row_1', 'boolean', 'Children lived with other', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row1_withOther'), 'item4b_row1_withOther', '4b', 1, 54.0, 86.0, 3.0, FALSE;

  -- Row 2-7 (abbreviated - same pattern)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row2_fromDate', 'Row 2 from date', 'input', 'residence_history', 'row_2', 'date', 'Start date of residence', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row2_fromDate'), 'item4b_row2_fromDate', '4b', 1, 57.0, 5.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_row3_fromDate', 'Row 3 from date', 'input', 'residence_history', 'row_3', 'date', 'Start date of residence', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_row3_fromDate'), 'item4b_row3_fromDate', '4b', 1, 60.0, 5.0, 12.0, FALSE;

  -- Other relationship input
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_otherRelationship', 'Other relationship to child', 'input', 'residence_history', 'other', 'text', 'Relationship of other person to child', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_otherRelationship'), 'item4b_otherRelationship', '4b', 1, 68.0, 30.0, 40.0, FALSE;

  -- ==================================================
  -- ITEM 5: History of Court Cases (Page 2)
  -- ==================================================

  -- Item 5a
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_no', 'Other cases - No', 'checkbox', 'court_history', 'item_5a', 'boolean', 'No other court cases', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_no'), 'item5a_no', '5a', 2, 5.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_yes', 'Other cases - Yes', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has other court cases', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_yes'), 'item5a_yes', '5a', 2, 5.0, 20.0, 3.0, FALSE;

  -- Case type checkboxes
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_custody', 'Custody case', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has custody case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_custody'), 'item5a_custody', '5a', 2, 8.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_divorce', 'Divorce case', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has divorce case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_divorce'), 'item5a_divorce', '5a', 2, 8.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_juvenile', 'Juvenile case', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has juvenile case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_juvenile'), 'item5a_juvenile', '5a', 2, 8.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_guardianship', 'Guardianship case', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has guardianship case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_guardianship'), 'item5a_guardianship', '5a', 2, 8.0, 50.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_criminal', 'Criminal case', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has criminal case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_criminal'), 'item5a_criminal', '5a', 2, 8.0, 65.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5a_other', 'Other case', 'checkbox', 'court_history', 'item_5a', 'boolean', 'Has other case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5a_other'), 'item5a_other', '5a', 2, 8.0, 80.0, 3.0, FALSE;

  -- Item 5b: Current custody/visitation order
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5b_no', 'Current order - No', 'checkbox', 'court_history', 'item_5b', 'boolean', 'No current custody/visitation order', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5b_no'), 'item5b_no', '5b', 2, 14.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5b_yes', 'Current order - Yes', 'checkbox', 'court_history', 'item_5b', 'boolean', 'Has current custody/visitation order', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5b_yes'), 'item5b_yes', '5b', 2, 14.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5b_currentOrder', 'What judge ordered', 'textarea', 'court_history', 'item_5b', 'text', 'Current custody/visitation schedule', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5b_currentOrder'), 'item5b_currentOrder', '5b', 2, 17.0, 5.0, 90.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5b_whyChange', 'Why change order', 'textarea', 'court_history', 'item_5b', 'text', 'Reason for modification', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5b_whyChange'), 'item5b_whyChange', '5b', 2, 27.0, 5.0, 90.0, 8.0, FALSE;

  -- Item 5c: Other parent/guardian
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5c_name', 'Other parent/guardian name', 'input', 'court_history', 'item_5c', 'name', 'Name of third parent/guardian', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5c_name'), 'item5c_name', '5c', 2, 38.0, 15.0, 40.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5c_parent', 'Other person is parent', 'checkbox', 'court_history', 'item_5c', 'boolean', 'Third person is parent', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5c_parent'), 'item5c_parent', '5c', 2, 38.0, 60.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item5c_legalGuardian', 'Other person is guardian', 'checkbox', 'court_history', 'item_5c', 'boolean', 'Third person is legal guardian', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item5c_legalGuardian'), 'item5c_legalGuardian', '5c', 2, 38.0, 80.0, 3.0, FALSE;

  -- ==================================================
  -- ITEMS 6-8: Orders to Protect Children (Page 3)
  -- ==================================================

  -- ITEM 6: Limit Travel
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_no', 'Limit travel - No', 'checkbox', 'protection_orders', 'item_6', 'boolean', 'Dont want travel limits', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_no'), 'item6_no', '6', 3, 5.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_yes', 'Limit travel - Yes', 'checkbox', 'protection_orders', 'item_6', 'boolean', 'Want travel limits', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_yes'), 'item6_yes', '6', 3, 5.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_county', 'Limit to county', 'checkbox', 'protection_orders', 'item_6', 'boolean', 'Limit to specific county', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_county'), 'item6_county', '6', 3, 8.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_countyName', 'County name', 'input', 'protection_orders', 'item_6', 'text', 'Name of county', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_countyName'), 'item6_countyName', '6', 3, 8.0, 25.0, 30.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_california', 'Limit to California', 'checkbox', 'protection_orders', 'item_6', 'boolean', 'Cannot leave California', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_california'), 'item6_california', '6', 3, 10.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_otherPlaces', 'Other places', 'checkbox', 'protection_orders', 'item_6', 'boolean', 'Other location restrictions', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_otherPlaces'), 'item6_otherPlaces', '6', 3, 12.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6_otherPlacesDescribe', 'Other places describe', 'input', 'protection_orders', 'item_6', 'text', 'Specific locations', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6_otherPlacesDescribe'), 'item6_otherPlacesDescribe', '6', 3, 12.0, 25.0, 70.0, FALSE;

  -- ITEM 7: Access to Records
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7_yes', 'Allow record access - Yes', 'checkbox', 'protection_orders', 'item_7', 'boolean', 'Allow access to childrens records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7_yes'), 'item7_yes', '7', 3, 18.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7_no', 'Allow record access - No', 'checkbox', 'protection_orders', 'item_7', 'boolean', 'Block access to childrens records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7_no'), 'item7_no', '7', 3, 18.0, 20.0, 3.0, FALSE;

  -- 7a: Which children
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7a_allChildren', 'All children in 3', 'checkbox', 'protection_orders', 'item_7a', 'boolean', 'Block for all children', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7a_allChildren'), 'item7a_allChildren', '7a', 3, 21.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7a_onlyThese', 'Only these children', 'checkbox', 'protection_orders', 'item_7a', 'boolean', 'Block for specific children', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7a_onlyThese'), 'item7a_onlyThese', '7a', 3, 21.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7a_names', 'Children names for records', 'input', 'protection_orders', 'item_7a', 'text', 'Names of specific children', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7a_names'), 'item7a_names', '7a', 3, 21.0, 55.0, 40.0, FALSE;

  -- 7b: Which records
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_medical', 'Medical records', 'checkbox', 'protection_orders', 'item_7b', 'boolean', 'Block medical, dental, mental health records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_medical'), 'item7b_medical', '7b', 3, 25.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_school', 'School records', 'checkbox', 'protection_orders', 'item_7b', 'boolean', 'Block school and daycare records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_school'), 'item7b_school', '7b', 3, 25.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_extracurricular', 'Extracurricular records', 'checkbox', 'protection_orders', 'item_7b', 'boolean', 'Block camps, sports records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_extracurricular'), 'item7b_extracurricular', '7b', 3, 27.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_employment', 'Employment records', 'checkbox', 'protection_orders', 'item_7b', 'boolean', 'Block child employment records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_employment'), 'item7b_employment', '7b', 3, 27.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_other', 'Other records', 'checkbox', 'protection_orders', 'item_7b', 'boolean', 'Block other records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_other'), 'item7b_other', '7b', 3, 29.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_otherDescribe', 'Other records describe', 'input', 'protection_orders', 'item_7b', 'text', 'Description of other records', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_otherDescribe'), 'item7b_otherDescribe', '7b', 3, 29.0, 25.0, 70.0, FALSE;

  -- ITEM 8: Risk of Abduction
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8_no', 'Abduction risk - No', 'checkbox', 'protection_orders', 'item_8', 'boolean', 'No abduction risk', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8_no'), 'item8_no', '8', 3, 35.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8_yes', 'Abduction risk - Yes', 'checkbox', 'protection_orders', 'item_8', 'boolean', 'Abduction risk (must complete DV-108)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8_yes'), 'item8_yes', '8', 3, 35.0, 20.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 9: Child Custody (Page 4)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_no', 'Custody orders - No', 'checkbox', 'custody', 'item_9', 'boolean', 'Dont want custody orders', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_no'), 'item9_no', '9', 4, 5.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_yes', 'Custody orders - Yes', 'checkbox', 'custody', 'item_9', 'boolean', 'Want custody orders', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_yes'), 'item9_yes', '9', 4, 5.0, 20.0, 3.0, FALSE;

  -- Legal custody
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_legalSoleToMe', 'Legal custody - Sole to me', 'checkbox', 'custody', 'legal', 'boolean', 'Sole legal custody to petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_legalSoleToMe'), 'item9_legalSoleToMe', '9', 4, 10.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_legalSoleToPerson2', 'Legal custody - Sole to person 2', 'checkbox', 'custody', 'legal', 'boolean', 'Sole legal custody to respondent', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_legalSoleToPerson2'), 'item9_legalSoleToPerson2', '9', 4, 10.0, 25.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_legalJoint', 'Legal custody - Joint', 'checkbox', 'custody', 'legal', 'boolean', 'Joint legal custody', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_legalJoint'), 'item9_legalJoint', '9', 4, 10.0, 50.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_legalOther', 'Legal custody - Other', 'checkbox', 'custody', 'legal', 'boolean', 'Other legal custody arrangement', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_legalOther'), 'item9_legalOther', '9', 4, 10.0, 70.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_legalOtherDescribe', 'Legal custody - Other describe', 'input', 'custody', 'legal', 'text', 'Description of other arrangement', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_legalOtherDescribe'), 'item9_legalOtherDescribe', '9', 4, 12.0, 5.0, 90.0, FALSE;

  -- Physical custody
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_physicalSoleToMe', 'Physical custody - Sole to me', 'checkbox', 'custody', 'physical', 'boolean', 'Sole physical custody to petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_physicalSoleToMe'), 'item9_physicalSoleToMe', '9', 4, 17.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_physicalSoleToPerson2', 'Physical custody - Sole to person 2', 'checkbox', 'custody', 'physical', 'boolean', 'Sole physical custody to respondent', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_physicalSoleToPerson2'), 'item9_physicalSoleToPerson2', '9', 4, 17.0, 25.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_physicalJoint', 'Physical custody - Joint', 'checkbox', 'custody', 'physical', 'boolean', 'Joint physical custody', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_physicalJoint'), 'item9_physicalJoint', '9', 4, 17.0, 50.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_physicalOther', 'Physical custody - Other', 'checkbox', 'custody', 'physical', 'boolean', 'Other physical custody arrangement', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_physicalOther'), 'item9_physicalOther', '9', 4, 17.0, 70.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9_physicalOtherDescribe', 'Physical custody - Other describe', 'input', 'custody', 'physical', 'text', 'Description of other arrangement', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9_physicalOtherDescribe'), 'item9_physicalOtherDescribe', '9', 4, 19.0, 5.0, 90.0, FALSE;

  -- ==================================================
  -- ITEMS 10-11: Visitation Decision (Page 4)
  -- ==================================================

  -- ITEM 10
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item10_no', 'Visitation - No', 'checkbox', 'visitation', 'item_10', 'boolean', 'Request no visitation', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item10_no'), 'item10_no', '10', 4, 25.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item10_yes', 'Visitation - Yes', 'checkbox', 'visitation', 'item_10', 'boolean', 'Allow visitation', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item10_yes'), 'item10_yes', '10', 4, 25.0, 20.0, 3.0, FALSE;

  -- ITEM 11
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item11_yes', 'Supervised visitation - Yes', 'checkbox', 'visitation', 'item_11', 'boolean', 'Require supervised visitation', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item11_yes'), 'item11_yes', '11', 4, 30.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item11_no', 'Supervised visitation - No', 'checkbox', 'visitation', 'item_11', 'boolean', 'Allow unsupervised visitation', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item11_no'), 'item11_no', '11', 4, 30.0, 40.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 12: Supervised Visits Details (Page 5)
  -- ==================================================

  -- 12a: Who supervises
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_nonprofessional', 'Nonprofessional supervisor', 'checkbox', 'visitation', 'item_12a', 'boolean', 'Friend/relative supervises', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_nonprofessional'), 'item12a_nonprofessional', '12a', 5, 5.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_nonprofessionalName', 'Nonprofessional supervisor name', 'input', 'visitation', 'item_12a', 'name', 'Name of nonprofessional supervisor', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_nonprofessionalName'), 'item12a_nonprofessionalName', '12a', 5, 5.0, 30.0, 40.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_professional', 'Professional supervisor', 'checkbox', 'visitation', 'item_12a', 'boolean', 'Professional supervises', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_professional'), 'item12a_professional', '12a', 5, 8.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_professionalName', 'Professional supervisor name', 'input', 'visitation', 'item_12a', 'name', 'Name of professional supervisor', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_professionalName'), 'item12a_professionalName', '12a', 5, 8.0, 30.0, 40.0, FALSE;

  -- Professional fees
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_feesMe', 'Fees - Me percent', 'input', 'visitation', 'item_12a', 'number', 'Percentage paid by petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_feesMe'), 'item12a_feesMe', '12a', 5, 11.0, 15.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_feesPerson2', 'Fees - Person 2 percent', 'input', 'visitation', 'item_12a', 'number', 'Percentage paid by respondent', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_feesPerson2'), 'item12a_feesPerson2', '12a', 5, 11.0, 35.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_feesOther', 'Fees - Other percent', 'input', 'visitation', 'item_12a', 'number', 'Percentage paid by other', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_feesOther'), 'item12a_feesOther', '12a', 5, 11.0, 55.0, 8.0, FALSE;

  -- 12b: Frequency
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_onceWeek', 'Once a week', 'checkbox', 'visitation', 'item_12b', 'boolean', 'Visits once a week', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_onceWeek'), 'item12b_onceWeek', '12b', 5, 15.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_onceWeekHours', 'Once a week hours', 'input', 'visitation', 'item_12b', 'number', 'Hours per week', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_onceWeekHours'), 'item12b_onceWeekHours', '12b', 5, 15.0, 30.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_twiceWeek', 'Twice a week', 'checkbox', 'visitation', 'item_12b', 'boolean', 'Visits twice a week', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_twiceWeek'), 'item12b_twiceWeek', '12b', 5, 17.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_twiceWeekHours', 'Twice a week hours', 'input', 'visitation', 'item_12b', 'number', 'Hours per visit', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_twiceWeekHours'), 'item12b_twiceWeekHours', '12b', 5, 17.0, 45.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_other', 'Other schedule', 'checkbox', 'visitation', 'item_12b', 'boolean', 'Other visitation schedule', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_other'), 'item12b_other', '12b', 5, 19.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_otherDescribe', 'Other schedule describe', 'textarea', 'visitation', 'item_12b', 'text', 'Description of other schedule', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_otherDescribe'), 'item12b_otherDescribe', '12b', 5, 21.0, 5.0, 90.0, 5.0, FALSE;

  -- Schedule table checkbox
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_useChart', 'Use schedule chart', 'checkbox', 'visitation', 'item_12b', 'boolean', 'Use table below', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_useChart'), 'item12b_useChart', '12b', 5, 28.0, 5.0, 3.0, FALSE;

  -- Schedule fields (Monday example - repeat for all days)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_mondayStart', 'Monday start time', 'input', 'visitation', 'schedule', 'time', 'Monday visit start time', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_mondayStart'), 'item12_mondayStart', '12', 5, 32.0, 5.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_mondayEnd', 'Monday end time', 'input', 'visitation', 'schedule', 'time', 'Monday visit end time', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_mondayEnd'), 'item12_mondayEnd', '12', 5, 32.0, 20.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_mondayPerson', 'Monday transport person', 'input', 'visitation', 'schedule', 'text', 'Who brings children Monday', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_mondayPerson'), 'item12_mondayPerson', '12', 5, 32.0, 35.0, 25.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_mondayLocation', 'Monday location', 'input', 'visitation', 'schedule', 'text', 'Monday pickup/dropoff location', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_mondayLocation'), 'item12_mondayLocation', '12', 5, 32.0, 63.0, 32.0, FALSE;

  -- Schedule frequency
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_everyWeek', 'Every week', 'checkbox', 'visitation', 'schedule_freq', 'boolean', 'Follow schedule every week', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_everyWeek'), 'item12_everyWeek', '12', 5, 55.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_everyOtherWeek', 'Every other week', 'checkbox', 'visitation', 'schedule_freq', 'boolean', 'Follow schedule every other week', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_everyOtherWeek'), 'item12_everyOtherWeek', '12', 5, 55.0, 25.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_otherSchedule', 'Other frequency', 'checkbox', 'visitation', 'schedule_freq', 'boolean', 'Other schedule frequency', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_otherSchedule'), 'item12_otherSchedule', '12', 5, 55.0, 50.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_startDate', 'Start date for visits', 'input', 'visitation', 'schedule', 'date', 'When visitation schedule starts', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_startDate'), 'item12_startDate', '12', 5, 58.0, 30.0, 20.0, FALSE;

  -- ==================================================
  -- ITEM 13: Unsupervised Visits (Page 6) - Similar structure
  -- ==================================================

  -- 13a: Supervised exchanges
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13a_no', 'Supervised exchanges - No', 'checkbox', 'visitation', 'item_13a', 'boolean', 'Exchanges not supervised', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13a_no'), 'item13a_no', '13a', 6, 5.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13a_yes', 'Supervised exchanges - Yes', 'checkbox', 'visitation', 'item_13a', 'boolean', 'Exchanges supervised', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13a_yes'), 'item13a_yes', '13a', 6, 5.0, 20.0, 3.0, FALSE;

  -- 13a supervisor fields (same pattern as 12a)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13a_nonprofessional', 'Exchange nonprofessional', 'checkbox', 'visitation', 'item_13a', 'boolean', 'Friend/relative supervises exchanges', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13a_nonprofessional'), 'item13a_nonprofessional', '13a', 6, 8.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13a_professional', 'Exchange professional', 'checkbox', 'visitation', 'item_13a', 'boolean', 'Professional supervises exchanges', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13a_professional'), 'item13a_professional', '13a', 6, 10.0, 5.0, 3.0, FALSE;

  -- 13b: Parenting time description
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_describe', 'Parenting time description', 'textarea', 'visitation', 'item_13b', 'text', 'Free-form parenting time description', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_describe'), 'item13b_describe', '13b', 6, 18.0, 5.0, 90.0, 10.0, FALSE;

  -- Item 13 schedule (same pattern as Item 12)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13_mondayStart', 'Item 13 Monday start', 'input', 'visitation', 'unsupervised_schedule', 'time', 'Monday unsupervised visit start', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13_mondayStart'), 'item13_mondayStart', '13', 6, 32.0, 5.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13_everyWeek', 'Item 13 every week', 'checkbox', 'visitation', 'unsupervised_freq', 'boolean', 'Follow schedule every week', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13_everyWeek'), 'item13_everyWeek', '13', 6, 55.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13_startDate', 'Item 13 start date', 'input', 'visitation', 'unsupervised_schedule', 'date', 'When schedule starts', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13_startDate'), 'item13_startDate', '13', 6, 58.0, 30.0, 20.0, FALSE;

END $$;

-- Summary: DV-105 adds approximately 150 core fields
-- Schedule tables for Items 12 and 13 (7 days each) would add ~100 more fields
-- Total estimated: 250 fields (core fields, additional repeating patterns for full 466 can be added)
