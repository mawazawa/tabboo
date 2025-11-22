-- Add missing columns to judicial_council_forms table
-- Created: 2025-11-22
-- Purpose: Align database schema with canonical field schema definition

DO $$
BEGIN
    -- Form Series
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'form_series') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN form_series TEXT;
    END IF;

    -- Description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'description') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN description TEXT;
    END IF;

    -- URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'url') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN url TEXT;
    END IF;

    -- PDF URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'pdf_url') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN pdf_url TEXT;
    END IF;

    -- Info Sheet URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'info_sheet_url') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN info_sheet_url TEXT;
    END IF;

    -- Form Pattern
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'form_pattern') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN form_pattern TEXT CHECK (form_pattern IN ('response', 'request', 'financial', 'declaration', 'notice', 'order'));
    END IF;

    -- Complexity Level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'complexity_level') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN complexity_level TEXT CHECK (complexity_level IN ('simple', 'moderate', 'complex'));
    END IF;

    -- Estimated Time Minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'estimated_time_minutes') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN estimated_time_minutes INTEGER;
    END IF;

    -- Related Code Sections
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'related_code_sections') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN related_code_sections TEXT[];
    END IF;

    -- Filing Requirements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'filing_requirements') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN filing_requirements TEXT;
    END IF;

    -- Filing Deadline Days
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'filing_deadline_days') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN filing_deadline_days INTEGER;
    END IF;

    -- Supersedes Form ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'supersedes_form_id') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN supersedes_form_id UUID REFERENCES judicial_council_forms(id);
    END IF;

    -- Total Field Count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'total_field_count') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN total_field_count INTEGER DEFAULT 0;
    END IF;

    -- Unique Field Count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'unique_field_count') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN unique_field_count INTEGER DEFAULT 0;
    END IF;

    -- Reused Field Count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'judicial_council_forms' AND column_name = 'reused_field_count') THEN
        ALTER TABLE judicial_council_forms ADD COLUMN reused_field_count INTEGER DEFAULT 0;
    END IF;

    -- Backfill form_series based on form_number if possible
    UPDATE judicial_council_forms 
    SET form_series = split_part(form_number, '-', 1) 
    WHERE form_series IS NULL AND form_number LIKE '%-%';

END $$;

