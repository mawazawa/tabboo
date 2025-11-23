-- Populate DV-100 Fields - Phase 4 (Items 23-34: Court Date Orders & Signatures)
-- Created: 2025-11-22
-- Purpose: Insert DV-100 form fields for Items 23-34 (Pages 11-13)
-- Note: Positions are estimated and should be refined using Glass Layer Field Mapper

DO $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'DV-100';

  -- ==================================================
  -- ITEM 23: Pay Expenses Caused by Abuse (Page 11)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_payExpenses', 'Pay expenses order', 'checkbox', 'court_date_orders', 'item_23', 'boolean', 'Request order to pay expenses caused by abuse', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_payExpenses'), 'item23_payExpenses', '23', 11, 5.0, 2.0, 3.0, FALSE;

  -- Expense 1
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_1_payTo', 'Expense 1 pay to', 'input', 'court_date_orders', 'item_23', 'text', 'Payee for first expense', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_1_payTo'), 'item23_1_payTo', '23(1)', 11, 8.0, 15.0, 25.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_1_for', 'Expense 1 for', 'input', 'court_date_orders', 'item_23', 'text', 'What first expense is for', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_1_for'), 'item23_1_for', '23(1)', 11, 8.0, 43.0, 25.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_1_amount', 'Expense 1 amount', 'input', 'court_date_orders', 'item_23', 'currency', 'Amount of first expense', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_1_amount'), 'item23_1_amount', '23(1)', 11, 8.0, 71.0, 15.0, FALSE;

  -- Expenses 2-4 (abbreviated)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_2_payTo', 'Expense 2 pay to', 'input', 'court_date_orders', 'item_23', 'text', 'Payee for second expense', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_2_payTo'), 'item23_2_payTo', '23(2)', 11, 10.0, 15.0, 25.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_3_payTo', 'Expense 3 pay to', 'input', 'court_date_orders', 'item_23', 'text', 'Payee for third expense', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_3_payTo'), 'item23_3_payTo', '23(3)', 11, 12.0, 15.0, 25.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item23_4_payTo', 'Expense 4 pay to', 'input', 'court_date_orders', 'item_23', 'text', 'Payee for fourth expense', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item23_4_payTo'), 'item23_4_payTo', '23(4)', 11, 14.0, 15.0, 25.0, FALSE;

  -- ==================================================
  -- ITEM 24: Child Support (Page 11)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item24_childSupport', 'Child support order', 'checkbox', 'court_date_orders', 'item_24', 'boolean', 'Request child support order', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item24_childSupport'), 'item24_childSupport', '24', 11, 18.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item24a_noOrder', 'No child support order', 'checkbox', 'court_date_orders', 'item_24a', 'boolean', 'No current order, want one', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item24a_noOrder'), 'item24a_noOrder', '24a', 11, 20.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item24b_haveOrder', 'Have child support order', 'checkbox', 'court_date_orders', 'item_24b', 'boolean', 'Have order, want changed', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item24b_haveOrder'), 'item24b_haveOrder', '24b', 11, 22.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item24c_tanf', 'Receive TANF/CalWORKS', 'checkbox', 'court_date_orders', 'item_24c', 'boolean', 'Receive or applied for TANF/Welfare/CalWORKS', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item24c_tanf'), 'item24c_tanf', '24c', 11, 24.0, 5.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 25: Spousal Support (Page 11)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item25_spousalSupport', 'Spousal support order', 'checkbox', 'court_date_orders', 'item_25', 'boolean', 'Request spousal support (married/RDP only)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item25_spousalSupport'), 'item25_spousalSupport', '25', 11, 28.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 26: Lawyer's Fees and Costs (Page 11)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item26_lawyerFees', 'Lawyer fees order', 'checkbox', 'court_date_orders', 'item_26', 'boolean', 'Request lawyer fees and costs', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item26_lawyerFees'), 'item26_lawyerFees', '26', 11, 32.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 27: Batterer Intervention Program (Page 12)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item27_battererProgram', 'Batterer program order', 'checkbox', 'automatic_orders', 'item_27', 'boolean', 'Request 52-week batterer intervention program', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item27_battererProgram'), 'item27_battererProgram', '27', 12, 5.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 28: Transfer of Wireless Phone Account (Page 12)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item28_wirelessTransfer', 'Wireless transfer order', 'checkbox', 'automatic_orders', 'item_28', 'boolean', 'Request wireless phone account transfer', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item28_wirelessTransfer'), 'item28_wirelessTransfer', '28', 12, 10.0, 2.0, 3.0, FALSE;

  -- Phone a
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item28a_myNumber', 'Phone a is my number', 'checkbox', 'automatic_orders', 'item_28a', 'boolean', 'Phone a is my number', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item28a_myNumber'), 'item28a_myNumber', '28a', 12, 13.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item28a_childNumber', 'Phone a child number', 'input', 'automatic_orders', 'item_28a', 'phone', 'Childs phone number with area code', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item28a_childNumber'), 'item28a_childNumber', '28a', 12, 13.0, 35.0, 20.0, FALSE;

  -- Phones b-d (abbreviated)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item28b_myNumber', 'Phone b is my number', 'checkbox', 'automatic_orders', 'item_28b', 'boolean', 'Phone b is my number', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item28b_myNumber'), 'item28b_myNumber', '28b', 12, 15.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item28c_myNumber', 'Phone c is my number', 'checkbox', 'automatic_orders', 'item_28c', 'boolean', 'Phone c is my number', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item28c_myNumber'), 'item28c_myNumber', '28c', 12, 17.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item28d_myNumber', 'Phone d is my number', 'checkbox', 'automatic_orders', 'item_28d', 'boolean', 'Phone d is my number', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item28d_myNumber'), 'item28d_myNumber', '28d', 12, 19.0, 5.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 32: Additional Pages (Page 13)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item32_additionalPages', 'Number of additional pages', 'input', 'additional', 'item_32', 'number', 'Number of extra pages attached', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item32_additionalPages'), 'item32_additionalPages', '32', 13, 5.0, 40.0, 8.0, FALSE;

  -- ==================================================
  -- ITEM 33: Your Signature (Page 13)
  -- This was already partially defined in Phase 1, add remaining fields
  -- ==================================================

  -- item33_date already exists in Phase 1

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, vault_field_name, is_pii)
  VALUES ('item33_printName', 'Type or Print Your Name', 'input', 'signature', 'petitioner_signature', 'person_name', 'Petitioner printed name for signature', 'full_name', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  -- Already in Phase 1
  -- INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  -- SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item33_printName'), 'item33_printName', '33', 13, 12.0, 25.0, 45.0, TRUE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item33_signName', 'Sign Your Name', 'input', 'signature', 'petitioner_signature', 'signature', 'Petitioner handwritten signature', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  -- Already in Phase 1
  -- INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  -- SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item33_signName'), 'item33_signName', '33', 13, 15.0, 25.0, 45.0, TRUE;

  -- ==================================================
  -- ITEM 34: Your Lawyer's Signature (Page 13)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item34_date', 'Lawyer signature date', 'input', 'signature', 'attorney', 'date', 'Date lawyer signed', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item34_date'), 'item34_date', '34', 13, 20.0, 10.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item34_lawyerName', 'Lawyer name', 'input', 'signature', 'attorney', 'name', 'Printed name of attorney', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item34_lawyerName'), 'item34_lawyerName', '34', 13, 23.0, 25.0, 45.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item34_lawyerSignature', 'Lawyer signature', 'input', 'signature', 'attorney', 'signature', 'Signature of attorney', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item34_lawyerSignature'), 'item34_lawyerSignature', '34', 13, 26.0, 25.0, 45.0, FALSE;

END $$;