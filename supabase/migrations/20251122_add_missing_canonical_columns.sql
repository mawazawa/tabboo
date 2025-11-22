-- Add missing columns to canonical_fields and form_field_mappings
-- Created: 2025-11-22
-- Purpose: Sync schema with canonical definition

DO $$
BEGIN
    -- canonical_fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canonical_fields' AND column_name = 'category') THEN
        ALTER TABLE canonical_fields ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canonical_fields' AND column_name = 'subcategory') THEN
        ALTER TABLE canonical_fields ADD COLUMN subcategory TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canonical_fields' AND column_name = 'semantic_type') THEN
        ALTER TABLE canonical_fields ADD COLUMN semantic_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canonical_fields' AND column_name = 'validation_rules') THEN
        ALTER TABLE canonical_fields ADD COLUMN validation_rules JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canonical_fields' AND column_name = 'is_pii') THEN
        ALTER TABLE canonical_fields ADD COLUMN is_pii BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'canonical_fields' AND column_name = 'created_by') THEN
        ALTER TABLE canonical_fields ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    -- form_field_mappings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_field_mappings' AND column_name = 'depends_on_field_id') THEN
        ALTER TABLE form_field_mappings ADD COLUMN depends_on_field_id UUID REFERENCES canonical_fields(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_field_mappings' AND column_name = 'conditional_rule') THEN
        ALTER TABLE form_field_mappings ADD COLUMN conditional_rule JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_field_mappings' AND column_name = 'usage_count') THEN
        ALTER TABLE form_field_mappings ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_field_mappings' AND column_name = 'last_used_at') THEN
        ALTER TABLE form_field_mappings ADD COLUMN last_used_at TIMESTAMPTZ;
    END IF;

END $$;

