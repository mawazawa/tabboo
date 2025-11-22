-- Add unique constraint to form_field_mappings
-- Created: 2025-11-22

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'form_field_mappings_form_id_field_id_key'
    ) THEN
        ALTER TABLE form_field_mappings ADD CONSTRAINT form_field_mappings_form_id_field_id_key UNIQUE (form_id, field_id);
    END IF;
END $$;

