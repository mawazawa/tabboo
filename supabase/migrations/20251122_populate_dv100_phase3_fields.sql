-- Populate DV-100 Fields - Phase 3 (Items 10-22: Orders to Request)
-- Created: 2025-11-22
-- Purpose: Insert DV-100 form fields for Items 10-22 (Pages 7-10)
-- Note: Positions are estimated and should be refined using Glass Layer Field Mapper

DO $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'DV-100';

  -- ==================================================
  -- ITEM 10: Order to Not Abuse (Page 7)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item10_orderToNotAbuse', 'Order to not abuse', 'checkbox', 'orders_requested', 'item_10', 'boolean', 'Request order to not harass, assault, stalk, etc.', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item10_orderToNotAbuse'), 'item10_orderToNotAbuse', '10', 7, 5.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 11: No-Contact Order (Page 7)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item11_noContact', 'No contact order', 'checkbox', 'orders_requested', 'item_11', 'boolean', 'Request no contact with protected persons', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item11_noContact'), 'item11_noContact', '11', 7, 10.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 12: Stay-Away Order (Page 7)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12_stayAway', 'Stay away order', 'checkbox', 'orders_requested', 'item_12', 'boolean', 'Request stay-away order', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12_stayAway'), 'item12_stayAway', '12', 7, 15.0, 2.0, 3.0, FALSE;

  -- Item 12a: Places to stay away from
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_me', 'Stay away from me', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from petitioner', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_me'), 'item12a_me', '12a', 7, 17.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_myHome', 'Stay away from my home', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from home', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_myHome'), 'item12a_myHome', '12a', 7, 17.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_myJob', 'Stay away from my job', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from workplace', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_myJob'), 'item12a_myJob', '12a', 7, 17.0, 40.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_myVehicle', 'Stay away from my vehicle', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from vehicle', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_myVehicle'), 'item12a_myVehicle', '12a', 7, 17.0, 60.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_mySchool', 'Stay away from my school', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from school', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_mySchool'), 'item12a_mySchool', '12a', 7, 19.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_item8People', 'Stay away from Item 8 people', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from other protected persons', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_item8People'), 'item12a_item8People', '12a', 7, 19.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_childrensSchool', 'Stay away from childrens school', 'checkbox', 'orders_requested', 'item_12a', 'boolean', 'Stay away from childrens school or childcare', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_childrensSchool'), 'item12a_childrensSchool', '12a', 7, 19.0, 40.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12a_other', 'Stay away from other', 'textarea', 'orders_requested', 'item_12a', 'text', 'Other locations to stay away from', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12a_other'), 'item12a_other', '12a', 7, 21.0, 5.0, 90.0, 3.0, FALSE;

  -- Item 12b: Distance
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_100yards', '100 yards', 'checkbox', 'orders_requested', 'item_12b', 'boolean', 'Stay away 100 yards (300 feet)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_100yards'), 'item12b_100yards', '12b', 7, 25.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12b_otherDistance', 'Other distance', 'input', 'orders_requested', 'item_12b', 'text', 'Other distance in yards', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12b_otherDistance'), 'item12b_otherDistance', '12b', 7, 25.0, 25.0, 10.0, FALSE;

  -- Item 12c: Live together
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12c_no', 'Dont live together', 'checkbox', 'orders_requested', 'item_12c', 'boolean', 'Do not live together', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12c_no'), 'item12c_no', '12c', 7, 28.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12c_yes', 'Live together', 'checkbox', 'orders_requested', 'item_12c', 'boolean', 'Live together', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12c_yes'), 'item12c_yes', '12c', 7, 30.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12c_sameBuilding', 'Same building', 'checkbox', 'orders_requested', 'item_12c', 'boolean', 'Live in same building', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12c_sameBuilding'), 'item12c_sameBuilding', '12c', 7, 32.0, 8.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12c_sameNeighborhood', 'Same neighborhood', 'checkbox', 'orders_requested', 'item_12c', 'boolean', 'Live in same neighborhood', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12c_sameNeighborhood'), 'item12c_sameNeighborhood', '12c', 7, 32.0, 30.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12c_other', 'Live together other', 'textarea', 'orders_requested', 'item_12c', 'text', 'Other living arrangement', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12c_other'), 'item12c_other', '12c', 7, 34.0, 8.0, 87.0, 3.0, FALSE;

  -- Item 12d: Same workplace/school
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12d_no', 'Not same workplace/school', 'checkbox', 'orders_requested', 'item_12d', 'boolean', 'Not same workplace or school', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12d_no'), 'item12d_no', '12d', 7, 38.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12d_yes', 'Same workplace/school', 'checkbox', 'orders_requested', 'item_12d', 'boolean', 'Same workplace or school', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12d_yes'), 'item12d_yes', '12d', 7, 40.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12d_workTogether', 'Work together at', 'input', 'orders_requested', 'item_12d', 'text', 'Company/workplace name', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12d_workTogether'), 'item12d_workTogether', '12d', 7, 42.0, 25.0, 70.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12d_sameSchool', 'Same school', 'input', 'orders_requested', 'item_12d', 'text', 'School name', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12d_sameSchool'), 'item12d_sameSchool', '12d', 7, 44.0, 25.0, 70.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item12d_other', 'Workplace/school other', 'textarea', 'orders_requested', 'item_12d', 'text', 'Other workplace/school arrangement', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item12d_other'), 'item12d_other', '12d', 7, 46.0, 8.0, 87.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 13: Order to Move Out (Page 8)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13_moveOut', 'Move out order', 'checkbox', 'orders_requested', 'item_13', 'boolean', 'Request order to move out', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13_moveOut'), 'item13_moveOut', '13', 8, 5.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13a_address', 'Move out address', 'input', 'orders_requested', 'item_13a', 'address', 'Address to move out from', TRUE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13a_address'), 'item13a_address', '13a', 8, 7.0, 15.0, 80.0, FALSE;

  -- Item 13b: Reasons
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_ownHome', 'I own the home', 'checkbox', 'orders_requested', 'item_13b', 'boolean', 'Petitioner owns home', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_ownHome'), 'item13b_ownHome', '13b', 8, 10.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_nameOnLease', 'Name on lease', 'checkbox', 'orders_requested', 'item_13b', 'boolean', 'Petitioner name on lease', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_nameOnLease'), 'item13b_nameOnLease', '13b', 8, 12.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_liveWithChildren', 'Live with children', 'checkbox', 'orders_requested', 'item_13b', 'boolean', 'Live at address with children', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_liveWithChildren'), 'item13b_liveWithChildren', '13b', 8, 14.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_livedYears', 'Lived years', 'input', 'orders_requested', 'item_13b', 'number', 'Years lived at address', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_livedYears'), 'item13b_livedYears', '13b', 8, 16.0, 30.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_livedMonths', 'Lived months', 'input', 'orders_requested', 'item_13b', 'number', 'Months lived at address', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_livedMonths'), 'item13b_livedMonths', '13b', 8, 16.0, 50.0, 8.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_payRent', 'Pay rent/mortgage', 'checkbox', 'orders_requested', 'item_13b', 'boolean', 'Pay some/all rent or mortgage', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_payRent'), 'item13b_payRent', '13b', 8, 18.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item13b_other', 'Move out other reason', 'textarea', 'orders_requested', 'item_13b', 'text', 'Other reason for right to stay', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item13b_other'), 'item13b_other', '13b', 8, 20.0, 5.0, 90.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 14: Other Orders (Page 8)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item14_otherOrders', 'Other orders', 'checkbox', 'orders_requested', 'item_14', 'boolean', 'Request other orders', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item14_otherOrders'), 'item14_otherOrders', '14', 8, 25.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item14_describe', 'Other orders description', 'textarea', 'orders_requested', 'item_14', 'text', 'Description of additional orders', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item14_describe'), 'item14_describe', '14', 8, 27.0, 5.0, 90.0, 10.0, FALSE;

  -- ==================================================
  -- ITEM 15: Child Custody and Visitation (Page 8)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item15_childCustody', 'Child custody order', 'checkbox', 'orders_requested', 'item_15', 'boolean', 'Request child custody/visitation orders (must attach DV-105)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item15_childCustody'), 'item15_childCustody', '15', 8, 40.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 16: Protect Animals (Page 9)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16_protectAnimals', 'Protect animals order', 'checkbox', 'orders_requested', 'item_16', 'boolean', 'Request orders to protect animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16_protectAnimals'), 'item16_protectAnimals', '16', 9, 5.0, 2.0, 3.0, FALSE;

  -- Animal 1
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a1_name', 'Animal 1 name', 'input', 'orders_requested', 'item_16a', 'text', 'Name or ID of first animal', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a1_name'), 'item16a1_name', '16a(1)', 9, 8.0, 5.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a1_type', 'Animal 1 type', 'input', 'orders_requested', 'item_16a', 'text', 'Type of animal (dog, cat, etc.)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a1_type'), 'item16a1_type', '16a(1)', 9, 8.0, 28.0, 15.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a1_breed', 'Animal 1 breed', 'input', 'orders_requested', 'item_16a', 'text', 'Breed of animal', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a1_breed'), 'item16a1_breed', '16a(1)', 9, 8.0, 46.0, 15.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a1_color', 'Animal 1 color', 'input', 'orders_requested', 'item_16a', 'text', 'Color of animal', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a1_color'), 'item16a1_color', '16a(1)', 9, 8.0, 64.0, 15.0, FALSE;

  -- Animal 2-4 (abbreviated)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a2_name', 'Animal 2 name', 'input', 'orders_requested', 'item_16a', 'text', 'Name or ID of second animal', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a2_name'), 'item16a2_name', '16a(2)', 9, 10.0, 5.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a3_name', 'Animal 3 name', 'input', 'orders_requested', 'item_16a', 'text', 'Name or ID of third animal', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a3_name'), 'item16a3_name', '16a(3)', 9, 12.0, 5.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16a4_name', 'Animal 4 name', 'input', 'orders_requested', 'item_16a', 'text', 'Name or ID of fourth animal', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16a4_name'), 'item16a4_name', '16a(4)', 9, 14.0, 5.0, 20.0, FALSE;

  -- Item 16b: Animal protection orders
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b1_stayAway100', 'Stay away from animals 100 yards', 'checkbox', 'orders_requested', 'item_16b', 'boolean', 'Stay away 100 yards from animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b1_stayAway100'), 'item16b1_stayAway100', '16b(1)', 9, 17.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b1_stayAwayOther', 'Stay away from animals other', 'input', 'orders_requested', 'item_16b', 'text', 'Other distance in yards', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b1_stayAwayOther'), 'item16b1_stayAwayOther', '16b(1)', 9, 17.0, 40.0, 10.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b2_notTakeSellHarm', 'Not take sell harm animals', 'checkbox', 'orders_requested', 'item_16b', 'boolean', 'Order not to take, sell, hide, harm animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b2_notTakeSellHarm'), 'item16b2_notTakeSellHarm', '16b(2)', 9, 19.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b3_giveMePossession', 'Give me sole possession', 'checkbox', 'orders_requested', 'item_16b', 'boolean', 'Give petitioner sole possession of animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b3_giveMePossession'), 'item16b3_giveMePossession', '16b(3)', 9, 21.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b3_personAbuses', 'Person abuses animals', 'checkbox', 'orders_requested', 'item_16b', 'boolean', 'Person abuses animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b3_personAbuses'), 'item16b3_personAbuses', '16b(3)', 9, 23.0, 8.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b3_iTakeCare', 'I take care of animals', 'checkbox', 'orders_requested', 'item_16b', 'boolean', 'Petitioner takes care of animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b3_iTakeCare'), 'item16b3_iTakeCare', '16b(3)', 9, 25.0, 8.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b3_iPurchased', 'I purchased animals', 'checkbox', 'orders_requested', 'item_16b', 'boolean', 'Petitioner purchased animals', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b3_iPurchased'), 'item16b3_iPurchased', '16b(3)', 9, 27.0, 8.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item16b3_other', 'Animals possession other reason', 'textarea', 'orders_requested', 'item_16b', 'text', 'Other reason for possession', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item16b3_other'), 'item16b3_other', '16b(3)', 9, 29.0, 8.0, 87.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 17: Control of Property (Page 9)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item17_controlProperty', 'Control property order', 'checkbox', 'orders_requested', 'item_17', 'boolean', 'Request control of property', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item17_controlProperty'), 'item17_controlProperty', '17', 9, 34.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item17a_describe', 'Property description', 'textarea', 'orders_requested', 'item_17a', 'text', 'Description of property', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item17a_describe'), 'item17a_describe', '17a', 9, 36.0, 5.0, 90.0, 5.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item17b_why', 'Why control property', 'textarea', 'orders_requested', 'item_17b', 'text', 'Why you want control of property', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item17b_why'), 'item17b_why', '17b', 9, 42.0, 5.0, 90.0, 5.0, FALSE;

  -- ==================================================
  -- ITEM 18: Health and Other Insurance (Page 9)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item18_insurance', 'Insurance order', 'checkbox', 'orders_requested', 'item_18', 'boolean', 'Order no changes to insurance', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item18_insurance'), 'item18_insurance', '18', 9, 50.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 19: Record Communications (Page 9)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item19_recordCommunications', 'Record communications', 'checkbox', 'orders_requested', 'item_19', 'boolean', 'Permission to record violations', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item19_recordCommunications'), 'item19_recordCommunications', '19', 9, 55.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 20: Property Restraint (Page 10)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item20_propertyRestraint', 'Property restraint order', 'checkbox', 'orders_requested', 'item_20', 'boolean', 'Property restraint (married/RDP only)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item20_propertyRestraint'), 'item20_propertyRestraint', '20', 10, 5.0, 2.0, 3.0, FALSE;

  -- ==================================================
  -- ITEM 21: Extend Deadline to Serve (Page 10)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item21_extendDeadline', 'Extend service deadline', 'checkbox', 'orders_requested', 'item_21', 'boolean', 'Request more time to serve', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item21_extendDeadline'), 'item21_extendDeadline', '21', 10, 10.0, 2.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item21_explain', 'Extend deadline reason', 'textarea', 'orders_requested', 'item_21', 'text', 'Why need more time to serve', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item21_explain'), 'item21_explain', '21', 10, 12.0, 5.0, 90.0, 5.0, FALSE;

  -- ==================================================
  -- ITEM 22: Pay Debts (Page 10)
  -- ==================================================

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22_payDebts', 'Pay debts order', 'checkbox', 'orders_requested', 'item_22', 'boolean', 'Request order to pay debts', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22_payDebts'), 'item22_payDebts', '22', 10, 20.0, 2.0, 3.0, FALSE;

  -- Debt 1
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22a1_payTo', 'Debt 1 pay to', 'input', 'orders_requested', 'item_22a', 'text', 'Payee name for first debt', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22a1_payTo'), 'item22a1_payTo', '22a(1)', 10, 23.0, 15.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22a1_for', 'Debt 1 for', 'input', 'orders_requested', 'item_22a', 'text', 'What first debt is for', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22a1_for'), 'item22a1_for', '22a(1)', 10, 23.0, 38.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22a1_amount', 'Debt 1 amount', 'input', 'orders_requested', 'item_22a', 'currency', 'Amount of first debt', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22a1_amount'), 'item22a1_amount', '22a(1)', 10, 23.0, 61.0, 12.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22a1_dueDate', 'Debt 1 due date', 'input', 'orders_requested', 'item_22a', 'date', 'Due date for first debt', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22a1_dueDate'), 'item22a1_dueDate', '22a(1)', 10, 23.0, 76.0, 15.0, FALSE;

  -- Debts 2-3 (abbreviated)
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22a2_payTo', 'Debt 2 pay to', 'input', 'orders_requested', 'item_22a', 'text', 'Payee name for second debt', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22a2_payTo'), 'item22a2_payTo', '22a(2)', 10, 25.0, 15.0, 20.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22a3_payTo', 'Debt 3 pay to', 'input', 'orders_requested', 'item_22a', 'text', 'Payee name for third debt', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22a3_payTo'), 'item22a3_payTo', '22a(3)', 10, 27.0, 15.0, 20.0, FALSE;

  -- Explain why
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22_explainWhy', 'Explain why pay debts', 'textarea', 'orders_requested', 'item_22', 'text', 'Why person should pay debts', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22_explainWhy'), 'item22_explainWhy', '22', 10, 30.0, 5.0, 90.0, 5.0, FALSE;

  -- Special finding
  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b_specialFindingNo', 'Special finding - No', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Dont want special finding', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b_specialFindingNo'), 'item22b_specialFindingNo', '22b', 10, 37.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b_specialFindingYes', 'Special finding - Yes', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Want special finding', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b_specialFindingYes'), 'item22b_specialFindingYes', '22b', 10, 39.0, 5.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b1_a1', 'Special finding a(1)', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Apply special finding to debt a(1)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b1_a1'), 'item22b1_a1', '22b(1)', 10, 41.0, 8.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b1_a2', 'Special finding a(2)', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Apply special finding to debt a(2)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b1_a2'), 'item22b1_a2', '22b(1)', 10, 41.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b1_a3', 'Special finding a(3)', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Apply special finding to debt a(3)', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b1_a3'), 'item22b1_a3', '22b(1)', 10, 41.0, 32.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b2_knowNo', 'Know how debt made - No', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Dont know how debt was made', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b2_knowNo'), 'item22b2_knowNo', '22b(2)', 10, 44.0, 8.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b2_knowYes', 'Know how debt made - Yes', 'checkbox', 'orders_requested', 'item_22b', 'boolean', 'Know how debt was made', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b2_knowYes'), 'item22b2_knowYes', '22b(2)', 10, 44.0, 20.0, 3.0, FALSE;

  INSERT INTO canonical_fields (field_key, field_label, field_type, category, subcategory, semantic_type, description, is_pii)
  VALUES ('item22b2_explain', 'How debt made explain', 'textarea', 'orders_requested', 'item_22b', 'text', 'Explanation of how debt was made', FALSE)
  ON CONFLICT (field_key) DO NOTHING;

  INSERT INTO form_field_mappings (form_id, field_id, form_field_name, item_number, page_number, position_top, position_left, field_width, field_height, is_required)
  SELECT v_form_id, (SELECT id FROM canonical_fields WHERE field_key = 'item22b2_explain'), 'item22b2_explain', '22b(2)', 10, 46.0, 8.0, 87.0, 5.0, FALSE;

END $$;

-- Summary: Phase 3 adds approximately 85 fields for Items 10-22
