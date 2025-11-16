import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FieldOverlay } from '@/types/FormData';

export interface FormFieldMapping {
  id: string;
  form_id: string;
  field_id: string;
  form_field_name: string;
  page_number: number;
  position_top: number | null;
  position_left: number | null;
  field_width: number | null;
  field_height: number | null;
  placeholder_text: string | null;
  help_text: string | null;
  item_number: string | null;
  section_name: string | null;
  is_required: boolean | null;
  is_readonly: boolean | null;
  default_value: string | null;
  canonical_field: {
    field_key: string;
    field_label: string;
    field_type: string;
    vault_field_name: string | null;
    validation_pattern: string | null;
    description: string | null;
  };
}

/**
 * Hook to fetch form field mappings from the database for a specific CA Judicial Council form
 * @param formNumber - The form number (e.g., 'FL-320')
 * @returns Query result with field mappings grouped by page
 */
export function useFormFields(formNumber: string) {
  return useQuery({
    queryKey: ['formFields', formNumber],
    queryFn: async () => {
      // First, get the form ID for the specified form number
      const { data: formData, error: formError } = await supabase
        .from('judicial_council_forms')
        .select('id')
        .eq('form_number', formNumber)
        .eq('is_current', true)
        .single();

      if (formError) {
        console.error('Error fetching form:', formError);
        throw formError;
      }

      if (!formData) {
        throw new Error(`Form ${formNumber} not found`);
      }

      // Fetch all field mappings for this form with canonical field data
      const { data: fieldMappings, error: mappingsError } = await supabase
        .from('form_field_mappings')
        .select(`
          id,
          form_id,
          field_id,
          form_field_name,
          page_number,
          position_top,
          position_left,
          field_width,
          field_height,
          placeholder_text,
          help_text,
          item_number,
          section_name,
          is_required,
          is_readonly,
          default_value,
          canonical_fields!inner(
            field_key,
            field_label,
            field_type,
            vault_field_name,
            validation_pattern,
            description
          )
        `)
        .eq('form_id', formData.id)
        .order('page_number', { ascending: true })
        .limit(1000); // Fetch all fields (forms typically have < 100 fields)

      if (mappingsError) {
        console.error('Error fetching field mappings:', mappingsError);
        throw mappingsError;
      }

      if (!fieldMappings || fieldMappings.length === 0) {
        console.warn(`No field mappings found for form ${formNumber}`);
        return [];
      }

      // Transform the data to match the frontend format
      const transformedMappings: FormFieldMapping[] = fieldMappings.map((mapping: any) => ({
        ...mapping,
        canonical_field: Array.isArray(mapping.canonical_fields)
          ? mapping.canonical_fields[0]
          : mapping.canonical_fields
      }));

      return transformedMappings;
    },
    // Cache for 5 minutes since form structure doesn't change often
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Convert database field mappings to FieldOverlay format for FormViewer
 * @param mappings - Array of FormFieldMapping from database
 * @returns Array of field overlays grouped by page
 */
export function convertToFieldOverlays(
  mappings: FormFieldMapping[]
): { page: number; fields: FieldOverlay[] }[] {
  // Group by page
  const pageMap = new Map<number, FieldOverlay[]>();

  mappings.forEach((mapping) => {
    const { canonical_field } = mapping;

    // Skip fields without position data
    if (mapping.position_top === null || mapping.position_left === null) {
      console.warn(`Field ${mapping.form_field_name} missing position data`);
      return;
    }

    const overlay: FieldOverlay = {
      type: canonical_field.field_type as 'input' | 'textarea' | 'checkbox',
      field: mapping.form_field_name,
      top: mapping.position_top.toString(),
      left: mapping.position_left.toString(),
      width: mapping.field_width ? `${mapping.field_width}%` : undefined,
      height: mapping.field_height ? `${mapping.field_height}%` : undefined,
      placeholder: mapping.placeholder_text || canonical_field.field_label,
    };

    if (!pageMap.has(mapping.page_number)) {
      pageMap.set(mapping.page_number, []);
    }

    pageMap.get(mapping.page_number)!.push(overlay);
  });

  // Convert map to array format
  return Array.from(pageMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([page, fields]) => ({ page, fields }));
}

/**
 * Generate field name to index mapping from field mappings
 * @param mappings - Array of FormFieldMapping from database
 * @returns Record mapping field names to their indices
 */
export function generateFieldNameToIndex(
  mappings: FormFieldMapping[]
): Record<string, number> {
  const fieldNameToIndex: Record<string, number> = {};

  mappings.forEach((mapping, index) => {
    fieldNameToIndex[mapping.form_field_name] = index;
  });

  return fieldNameToIndex;
}
