/**
 * PDF Form Field Mapper - Shared Types
 *
 * These interfaces are the foundation for the PDF mapping system.
 * Other agents depend on these exact structures - do not modify without coordination.
 */

/**
 * Represents a mappable field on a PDF form
 */
export interface Field {
  /** Unique identifier for the field */
  id: string;

  /** Field key/name used for data binding */
  key: string;

  /** Field input type */
  type: 'text' | 'checkbox' | 'date';

  /** Bounding rectangle in PDF coordinates */
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  /** Page number (1-indexed) */
  page: number;

  /** Whether the field is required for form submission */
  required?: boolean;
}

/**
 * PDF viewer state for rendering and navigation
 */
export interface PDFState {
  /** Current zoom scale (1 = 100%) */
  scale: number;

  /** Currently displayed page (1-indexed) */
  currentPage: number;

  /** Total number of pages in the document */
  numPages: number;
}

/**
 * Field creation payload (without ID - generated on creation)
 */
export type FieldInput = Omit<Field, 'id'>;

/**
 * Field update payload
 */
export type FieldPatch = Partial<Omit<Field, 'id'>>;
