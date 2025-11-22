-- Create RPC to upsert form fields from the UI
-- Created: 2025-11-22
-- Purpose: Allow "Glass Layer" mapper to save fields atomically

CREATE OR REPLACE FUNCTION upsert_form_field(
  p_form_number TEXT,
  p_field_name TEXT,
  p_page_number INTEGER,
  p_position_top DECIMAL,
  p_position_left DECIMAL,
  p_field_width DECIMAL,
  p_field_height DECIMAL,
  p_field_type TEXT DEFAULT 'input'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_form_id UUID;
  v_field_id UUID;
  v_mapping_id UUID;
BEGIN
  -- 1. Get Form ID
  SELECT id INTO v_form_id 
  FROM judicial_council_forms 
  WHERE form_number = p_form_number 
  LIMIT 1;

  IF v_form_id IS NULL THEN
    RAISE EXCEPTION 'Form % not found', p_form_number;
  END IF;

  -- 2. Upsert Canonical Field
  -- We use the p_field_name as the key for now, assuming it's unique enough or we want to reuse it.
  -- In a perfect world, we might want a separate p_field_key, but for the mapper tool, 
  -- we usually map "petitioner_firstName" which serves as both.
  INSERT INTO canonical_fields (field_key, field_label, field_type, category)
  VALUES (p_field_name, p_field_name, p_field_type, 'user_mapped')
  ON CONFLICT (field_key) DO UPDATE SET
    field_type = EXCLUDED.field_type,
    updated_at = NOW()
  RETURNING id INTO v_field_id;

  -- 3. Upsert Form Field Mapping
  INSERT INTO form_field_mappings (
    form_id, field_id, form_field_name, page_number,
    position_top, position_left, field_width, field_height,
    updated_at
  )
  VALUES (
    v_form_id, v_field_id, p_field_name, p_page_number,
    p_position_top, p_position_left, p_field_width, p_field_height,
    NOW()
  )
  ON CONFLICT (form_id, field_id) DO UPDATE SET
    page_number = EXCLUDED.page_number,
    position_top = EXCLUDED.position_top,
    position_left = EXCLUDED.position_left,
    field_width = EXCLUDED.field_width,
    field_height = EXCLUDED.field_height,
    form_field_name = EXCLUDED.form_field_name, -- Ensure name is synced
    updated_at = NOW()
  RETURNING id INTO v_mapping_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'field_id', v_field_id,
    'mapping_id', v_mapping_id
  );
END;
$$;

