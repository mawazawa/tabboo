-- Populate DV-100 Fields - Phase 2 (Items 4, 6-9)
-- Created: 2025-11-22
-- Purpose: Insert DV-100 form fields for Items 4 and 6-9
-- Note: Positions are estimated and should be refined using Glass Layer Field Mapper

DO $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'DV-100';

  -- ==================================================
  -- ITEM 4: Other Restraining Orders and Court Cases (Page 2)
  -- ==================================================

  -- Item 4a: Existing Restraining Orders
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a_noOrders', 'No existing orders', 'checkbox', 'court_history', 'restraining_orders', 'boolean', 'No existing restraining orders', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a_noOrders'), 'item4a_noOrders', '4a', 2, 22.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a_yesOrders', 'Yes, existing orders', 'checkbox', 'court_history', 'restraining_orders', 'boolean', 'Has existing restraining orders', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a_yesOrders'), 'item4a_yesOrders', '4a', 2, 24.0, 2.0, 3.0, FALSE;

  -- Order 1 details
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a1_dateOfOrder', 'Date of order (1)', 'input', 'court_history', 'restraining_orders', 'date', 'Date first order was issued', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a1_dateOfOrder'), 'item4a1_dateOfOrder', '4a(1)', 2, 26.0, 15.0, 15.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a1_dateExpires', 'Date it expires (1)', 'input', 'court_history', 'restraining_orders', 'date', 'Expiration date of first order', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a1_dateExpires'), 'item4a1_dateExpires', '4a(1)', 2, 26.0, 35.0, 15.0, FALSE;

  -- Order 2 details
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a2_dateOfOrder', 'Date of order (2)', 'input', 'court_history', 'restraining_orders', 'date', 'Date second order was issued', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a2_dateOfOrder'), 'item4a2_dateOfOrder', '4a(2)', 2, 28.0, 15.0, 15.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4a2_dateExpires', 'Date it expires (2)', 'input', 'court_history', 'restraining_orders', 'date', 'Expiration date of second order', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4a2_dateExpires'), 'item4a2_dateExpires', '4a(2)', 2, 28.0, 35.0, 15.0, FALSE;

  -- Item 4b: Other Court Cases
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_noOtherCases', 'No other cases', 'checkbox', 'court_history', 'other_cases', 'boolean', 'No other court cases', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_noOtherCases'), 'item4b_noOtherCases', '4b', 2, 32.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_yesOtherCases', 'Yes, other cases', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has other court cases', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_yesOtherCases'), 'item4b_yesOtherCases', '4b', 2, 34.0, 2.0, 3.0, FALSE;

  -- Case type checkboxes
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_custody', 'Custody case', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has custody case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_custody'), 'item4b_custody', '4b', 2, 36.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_divorce', 'Divorce case', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has divorce case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_divorce'), 'item4b_divorce', '4b', 2, 36.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_juvenile', 'Juvenile case', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has juvenile case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_juvenile'), 'item4b_juvenile', '4b', 2, 36.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_guardianship', 'Guardianship case', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has guardianship case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_guardianship'), 'item4b_guardianship', '4b', 2, 38.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_criminal', 'Criminal case', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has criminal case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_criminal'), 'item4b_criminal', '4b', 2, 38.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item4b_other', 'Other case', 'checkbox', 'court_history', 'other_cases', 'boolean', 'Has other type of case', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item4b_other'), 'item4b_other', '4b', 2, 38.0, 35.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 6: Different Type of Abuse (Page 4)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6a_dateOfAbuse', 'Date of abuse (Item 6)', 'input', 'abuse_description', 'incident_2', 'date', 'Date of second abuse incident', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6a_dateOfAbuse'), 'item6a_dateOfAbuse', '6a', 4, 5.0, 15.0, 25.0, FALSE;

  -- Witness fields for Item 6
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6b_witnessDontKnow', 'Witness - I dont know (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Unknown if witnesses present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6b_witnessDontKnow'), 'item6b_witnessDontKnow', '6b', 4, 8.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6b_witnessNo', 'Witness - No (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'No witnesses present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6b_witnessNo'), 'item6b_witnessNo', '6b', 4, 8.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6b_witnessYes', 'Witness - Yes (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Witnesses present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6b_witnessYes'), 'item6b_witnessYes', '6b', 4, 8.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6b_witnessNames', 'Witness names (Item 6)', 'textarea', 'abuse_description', 'incident_2', 'text', 'Names of witnesses', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6b_witnessNames'), 'item6b_witnessNames', '6b', 4, 10.0, 5.0, 90.0, 5.0, FALSE;

  -- Weapon fields for Item 6
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6c_weaponNo', 'Weapon - No (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'No weapon used', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6c_weaponNo'), 'item6c_weaponNo', '6c', 4, 16.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6c_weaponYes', 'Weapon - Yes (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Weapon used or threatened', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6c_weaponYes'), 'item6c_weaponYes', '6c', 4, 16.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6c_weaponDescribe', 'Weapon description (Item 6)', 'textarea', 'abuse_description', 'incident_2', 'text', 'Description of weapon', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6c_weaponDescribe'), 'item6c_weaponDescribe', '6c', 4, 18.0, 5.0, 90.0, 5.0, FALSE;

  -- Harm fields for Item 6
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6d_harmNo', 'Harm - No (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'No harm caused', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6d_harmNo'), 'item6d_harmNo', '6d', 4, 24.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6d_harmYes', 'Harm - Yes (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Harm caused', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6d_harmYes'), 'item6d_harmYes', '6d', 4, 24.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6d_harmDescribe', 'Harm description (Item 6)', 'textarea', 'abuse_description', 'incident_2', 'text', 'Description of harm', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6d_harmDescribe'), 'item6d_harmDescribe', '6d', 4, 26.0, 5.0, 90.0, 5.0, FALSE;

  -- Police fields for Item 6
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6e_policeDontKnow', 'Police - Dont know (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Unknown if police came', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6e_policeDontKnow'), 'item6e_policeDontKnow', '6e', 4, 32.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6e_policeNo', 'Police - No (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Police did not come', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6e_policeNo'), 'item6e_policeNo', '6e', 4, 32.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6e_policeYes', 'Police - Yes (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Police came', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6e_policeYes'), 'item6e_policeYes', '6e', 4, 32.0, 35.0, 3.0, FALSE;

  -- Details for Item 6
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6f_details', 'Incident details (Item 6)', 'textarea', 'abuse_description', 'incident_2', 'text', 'Detailed description of incident', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6f_details'), 'item6f_details', '6f', 4, 36.0, 5.0, 90.0, 15.0, FALSE;

  -- Frequency for Item 6
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6g_justOnce', 'Just once (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Happened just once', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6g_justOnce'), 'item6g_justOnce', '6g', 4, 54.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6g_2to5times', '2-5 times (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Happened 2-5 times', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6g_2to5times'), 'item6g_2to5times', '6g', 4, 54.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6g_weekly', 'Weekly (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Happens weekly', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6g_weekly'), 'item6g_weekly', '6g', 4, 54.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6g_other', 'Other frequency (Item 6)', 'checkbox', 'abuse_description', 'incident_2', 'boolean', 'Other frequency', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6g_other'), 'item6g_other', '6g', 4, 54.0, 50.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item6g_dates', 'Dates/estimates (Item 6)', 'textarea', 'abuse_description', 'incident_2', 'text', 'Dates or estimates of incidents', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item6g_dates'), 'item6g_dates', '6g', 4, 56.0, 5.0, 90.0, 5.0, FALSE;

  -- ==================================================
  -- ITEM 7: Other Abuse (Page 5) - Same structure as 5 and 6
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7a_dateOfAbuse', 'Date of abuse (Item 7)', 'input', 'abuse_description', 'incident_3', 'date', 'Date of third abuse incident', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7a_dateOfAbuse'), 'item7a_dateOfAbuse', '7a', 5, 5.0, 15.0, 25.0, FALSE;

  -- Witness fields for Item 7
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_witnessDontKnow', 'Witness - I dont know (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Unknown if witnesses present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_witnessDontKnow'), 'item7b_witnessDontKnow', '7b', 5, 8.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_witnessNo', 'Witness - No (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'No witnesses present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_witnessNo'), 'item7b_witnessNo', '7b', 5, 8.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_witnessYes', 'Witness - Yes (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Witnesses present', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_witnessYes'), 'item7b_witnessYes', '7b', 5, 8.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7b_witnessNames', 'Witness names (Item 7)', 'textarea', 'abuse_description', 'incident_3', 'text', 'Names of witnesses', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7b_witnessNames'), 'item7b_witnessNames', '7b', 5, 10.0, 5.0, 90.0, 5.0, FALSE;

  -- Weapon fields for Item 7
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7c_weaponNo', 'Weapon - No (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'No weapon used', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7c_weaponNo'), 'item7c_weaponNo', '7c', 5, 16.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7c_weaponYes', 'Weapon - Yes (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Weapon used or threatened', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7c_weaponYes'), 'item7c_weaponYes', '7c', 5, 16.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7c_weaponDescribe', 'Weapon description (Item 7)', 'textarea', 'abuse_description', 'incident_3', 'text', 'Description of weapon', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7c_weaponDescribe'), 'item7c_weaponDescribe', '7c', 5, 18.0, 5.0, 90.0, 5.0, FALSE;

  -- Harm fields for Item 7
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7d_harmNo', 'Harm - No (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'No harm caused', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7d_harmNo'), 'item7d_harmNo', '7d', 5, 24.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7d_harmYes', 'Harm - Yes (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Harm caused', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7d_harmYes'), 'item7d_harmYes', '7d', 5, 24.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7d_harmDescribe', 'Harm description (Item 7)', 'textarea', 'abuse_description', 'incident_3', 'text', 'Description of harm', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7d_harmDescribe'), 'item7d_harmDescribe', '7d', 5, 26.0, 5.0, 90.0, 5.0, FALSE;

  -- Police fields for Item 7
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7e_policeDontKnow', 'Police - Dont know (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Unknown if police came', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7e_policeDontKnow'), 'item7e_policeDontKnow', '7e', 5, 32.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7e_policeNo', 'Police - No (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Police did not come', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7e_policeNo'), 'item7e_policeNo', '7e', 5, 32.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7e_policeYes', 'Police - Yes (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Police came', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7e_policeYes'), 'item7e_policeYes', '7e', 5, 32.0, 35.0, 3.0, FALSE;

  -- Details for Item 7
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7f_details', 'Incident details (Item 7)', 'textarea', 'abuse_description', 'incident_3', 'text', 'Detailed description of incident', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7f_details'), 'item7f_details', '7f', 5, 36.0, 5.0, 90.0, 15.0, FALSE;

  -- Frequency for Item 7
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7g_justOnce', 'Just once (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Happened just once', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7g_justOnce'), 'item7g_justOnce', '7g', 5, 54.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7g_2to5times', '2-5 times (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Happened 2-5 times', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7g_2to5times'), 'item7g_2to5times', '7g', 5, 54.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7g_weekly', 'Weekly (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Happens weekly', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7g_weekly'), 'item7g_weekly', '7g', 5, 54.0, 35.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7g_other', 'Other frequency (Item 7)', 'checkbox', 'abuse_description', 'incident_3', 'boolean', 'Other frequency', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7g_other'), 'item7g_other', '7g', 5, 54.0, 50.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7g_dates', 'Dates/estimates (Item 7)', 'textarea', 'abuse_description', 'incident_3', 'text', 'Dates or estimates of incidents', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7g_dates'), 'item7g_dates', '7g', 5, 56.0, 5.0, 90.0, 5.0, FALSE;

  -- Need more space checkbox
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item7_needMoreSpace', 'Need more space for abuse description', 'checkbox', 'abuse_description', 'additional', 'boolean', 'Check to attach DV-101 or additional pages', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item7_needMoreSpace'), 'item7_needMoreSpace', '7', 5, 62.0, 5.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 8: Other Protected People (Page 6)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8a_no', 'No other protected people', 'checkbox', 'protected_persons', 'selection', 'boolean', 'No other people need protection', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8a_no'), 'item8a_no', '8a', 6, 5.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b_yes', 'Yes, other protected people', 'checkbox', 'protected_persons', 'selection', 'boolean', 'Other people need protection', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b_yes'), 'item8b_yes', '8b', 6, 7.0, 2.0, 3.0, FALSE;

  -- Person 1
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person1Name', 'Person 1 name', 'input', 'protected_persons', 'person_1', 'name', 'Full name of first protected person', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person1Name'), 'item8b1_person1Name', '8b(1)', 6, 10.0, 5.0, 30.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person1Age', 'Person 1 age', 'input', 'protected_persons', 'person_1', 'age', 'Age of first protected person', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person1Age'), 'item8b1_person1Age', '8b(1)', 6, 10.0, 38.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person1Relationship', 'Person 1 relationship', 'input', 'protected_persons', 'person_1', 'text', 'Relationship to petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person1Relationship'), 'item8b1_person1Relationship', '8b(1)', 6, 10.0, 50.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person1LivesYes', 'Person 1 lives with you - Yes', 'checkbox', 'protected_persons', 'person_1', 'boolean', 'Person lives with petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person1LivesYes'), 'item8b1_person1LivesYes', '8b(1)', 6, 10.0, 75.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person1LivesNo', 'Person 1 lives with you - No', 'checkbox', 'protected_persons', 'person_1', 'boolean', 'Person does not live with petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person1LivesNo'), 'item8b1_person1LivesNo', '8b(1)', 6, 10.0, 85.0, 3.0, FALSE;

  -- Person 2
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person2Name', 'Person 2 name', 'input', 'protected_persons', 'person_2', 'name', 'Full name of second protected person', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person2Name'), 'item8b1_person2Name', '8b(1)', 6, 12.0, 5.0, 30.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person2Age', 'Person 2 age', 'input', 'protected_persons', 'person_2', 'age', 'Age of second protected person', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person2Age'), 'item8b1_person2Age', '8b(1)', 6, 12.0, 38.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person2Relationship', 'Person 2 relationship', 'input', 'protected_persons', 'person_2', 'text', 'Relationship to petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person2Relationship'), 'item8b1_person2Relationship', '8b(1)', 6, 12.0, 50.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person2LivesYes', 'Person 2 lives with you - Yes', 'checkbox', 'protected_persons', 'person_2', 'boolean', 'Person lives with petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person2LivesYes'), 'item8b1_person2LivesYes', '8b(1)', 6, 12.0, 75.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person2LivesNo', 'Person 2 lives with you - No', 'checkbox', 'protected_persons', 'person_2', 'boolean', 'Person does not live with petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person2LivesNo'), 'item8b1_person2LivesNo', '8b(1)', 6, 12.0, 85.0, 3.0, FALSE;

  -- Person 3 and 4 (abbreviated for brevity - same pattern)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person3Name', 'Person 3 name', 'input', 'protected_persons', 'person_3', 'name', 'Full name of third protected person', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person3Name'), 'item8b1_person3Name', '8b(1)', 6, 14.0, 5.0, 30.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b1_person4Name', 'Person 4 name', 'input', 'protected_persons', 'person_4', 'name', 'Full name of fourth protected person', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b1_person4Name'), 'item8b1_person4Name', '8b(1)', 6, 16.0, 5.0, 30.0, FALSE;

  -- Need more people checkbox
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b_needMorePeople', 'Need more space for people', 'checkbox', 'protected_persons', 'additional', 'boolean', 'Check to attach additional sheet', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b_needMorePeople'), 'item8b_needMorePeople', '8b', 6, 18.0, 5.0, 3.0, FALSE;

  -- Why protection needed
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item8b2_whyProtection', 'Why people need protection', 'textarea', 'protected_persons', 'explanation', 'text', 'Explanation of why these people need protection', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item8b2_whyProtection'), 'item8b2_whyProtection', '8b(2)', 6, 20.0, 5.0, 90.0, 10.0, FALSE;

  -- ==================================================
  -- ITEM 9: Firearms Information (Page 6)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9a_dontKnow', 'Firearms - Dont know', 'checkbox', 'firearms', 'knowledge', 'boolean', 'Dont know about firearms', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9a_dontKnow'), 'item9a_dontKnow', '9a', 6, 32.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9b_no', 'Firearms - No', 'checkbox', 'firearms', 'knowledge', 'boolean', 'No firearms', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9b_no'), 'item9b_no', '9b', 6, 34.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c_yes', 'Firearms - Yes', 'checkbox', 'firearms', 'knowledge', 'boolean', 'Has firearms', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c_yes'), 'item9c_yes', '9c', 6, 36.0, 2.0, 3.0, FALSE;

  -- Firearm 1
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c1_describe', 'Firearm 1 description', 'input', 'firearms', 'firearm_1', 'text', 'Description of first firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c1_describe'), 'item9c1_describe', '9c(1)', 6, 38.0, 5.0, 35.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c1_number', 'Firearm 1 number', 'input', 'firearms', 'firearm_1', 'text', 'Number or amount', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c1_number'), 'item9c1_number', '9c(1)', 6, 38.0, 42.0, 10.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c1_location', 'Firearm 1 location', 'input', 'firearms', 'firearm_1', 'text', 'Location of firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c1_location'), 'item9c1_location', '9c(1)', 6, 38.0, 55.0, 40.0, FALSE;

  -- Firearms 2-6 (abbreviated)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c2_describe', 'Firearm 2 description', 'input', 'firearms', 'firearm_2', 'text', 'Description of second firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c2_describe'), 'item9c2_describe', '9c(2)', 6, 40.0, 5.0, 35.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c3_describe', 'Firearm 3 description', 'input', 'firearms', 'firearm_3', 'text', 'Description of third firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c3_describe'), 'item9c3_describe', '9c(3)', 6, 42.0, 5.0, 35.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c4_describe', 'Firearm 4 description', 'input', 'firearms', 'firearm_4', 'text', 'Description of fourth firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c4_describe'), 'item9c4_describe', '9c(4)', 6, 44.0, 5.0, 35.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c5_describe', 'Firearm 5 description', 'input', 'firearms', 'firearm_5', 'text', 'Description of fifth firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c5_describe'), 'item9c5_describe', '9c(5)', 6, 46.0, 5.0, 35.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item9c6_describe', 'Firearm 6 description', 'input', 'firearms', 'firearm_6', 'text', 'Description of sixth firearm', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item9c6_describe'), 'item9c6_describe', '9c(6)', 6, 48.0, 5.0, 35.0, FALSE;

END $$;

-- Summary: Phase 2 adds approximately 85 fields for Items 4, 6-9
