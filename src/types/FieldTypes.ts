/**
 * Shared Field Types
 *
 * Central location for field-related type definitions used across
 * form field components (FieldInspector, JSONPreview, etc.)
 *
 * @author Claude Code
 * @since November 2025
 */

/**
 * Represents a form field with its configuration
 */
export interface Field {
  /** Unique identifier for the field */
  id: string;
  /** Variable name/key for the field (snake_case recommended) */
  key: string;
  /** Field input type */
  type: 'text' | 'checkbox' | 'date';
  /** Whether the field is required for form submission */
  required: boolean;
}

/**
 * Supported field types
 */
export type FieldType = Field['type'];

/**
 * Field update payload (partial field without id)
 */
export type FieldUpdate = Partial<Omit<Field, 'id'>>;
