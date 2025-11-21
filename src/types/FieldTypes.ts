/**
 * Shared Field Types
 *
 * Re-exports from mapper.ts for backward compatibility.
 * The mapper.ts Field is the canonical type for the PDF field mapping system.
 *
 * @author Claude Code
 * @since November 2025
 */

// Re-export canonical types from mapper
export type { Field, FieldPatch as FieldUpdate } from './mapper';

// Export field type union for convenience
export type FieldType = 'text' | 'checkbox' | 'date';
