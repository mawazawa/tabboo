import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { supabase } from '@/integrations/supabase/client';

interface FillOptions {
  formData: Record<string, string | boolean>;
  pdfPath: string; // '/fl320.pdf'
  formNumber: string; // 'FL-320', 'DV-100', etc.
  fontSize?: number; // Default 12pt
}

interface FieldPosition {
  form_field_name: string;
  page_number: number;
  position_top: string; // Inches from top
  position_left: string; // Inches from left
  field_width: string; // Inches
  field_height: string | null; // Inches
  field_type: string; // 'input', 'textarea', 'checkbox'
}

/**
 * Fills static PDF forms by drawing text at coordinates from database
 * November 2025 implementation for court forms like FL-320
 */
export async function fillPDFFields(options: FillOptions): Promise<Uint8Array> {
  console.log(`[PDF Filler] Starting export for ${options.formNumber}`);

  // 1. Load PDF (many court forms are encrypted for viewing only)
  const pdfBytes = await fetch(options.pdfPath).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  console.log(`[PDF Filler] Loaded PDF, ${pdfDoc.getPageCount()} pages`);

  // 2. Register fontkit and embed font
  pdfDoc.registerFontkit(fontkit);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 3. Fetch field positions from database
  const fieldPositions = await fetchFieldPositions(options.formNumber);
  console.log(`[PDF Filler] Found ${fieldPositions.length} field position mappings`);

  // 4. Draw text for each field in formData
  let fieldsDrawn = 0;
  for (const [fieldKey, value] of Object.entries(options.formData)) {
    // Skip empty values (but allow numeric zero)
    if (value === null || value === undefined || value === '') continue;

    // Find position data for this field
    const position = fieldPositions.find(p => p.form_field_name === fieldKey);
    if (!position) {
      console.warn(`[PDF Filler] No position data for field: ${fieldKey}`);
      continue;
    }

    // Get the page
    const pageIndex = position.page_number - 1; // Database is 1-indexed
    const page = pdfDoc.getPage(pageIndex);

    // Convert value to string (handle booleans as checkmarks)
    const textValue = formatFieldValue(value, position.field_type);
    if (!textValue) continue; // Skip empty checkboxes

    // Convert database coordinates (inches from top-left) to PDF points (from bottom-left)
    const fontSize = options.fontSize || 12;
    const coords = convertCoordinates(position, page, fontSize);

    // Draw the text
    try {
      page.drawText(textValue, {
        x: coords.x,
        y: coords.y,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        maxWidth: coords.maxWidth,
      });
      fieldsDrawn++;
    } catch (error) {
      console.error(`[PDF Filler] Error drawing field ${fieldKey}:`, error);
    }
  }

  console.log(`[PDF Filler] Drew ${fieldsDrawn} fields on PDF`);

  // 5. Save and return PDF bytes
  return await pdfDoc.save();
}

/**
 * Fetch field position mappings from database
 */
async function fetchFieldPositions(formNumber: string): Promise<FieldPosition[]> {
  const { data, error } = await supabase
    .from('form_field_mappings')
    .select('form_field_name, page_number, position_top, position_left, field_width, field_height, field_type')
    .eq('form_number', formNumber);

  if (error) {
    console.error('[PDF Filler] Database error:', error);
    throw new Error(`Failed to fetch field positions: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`No field position mappings found for ${formNumber}`);
  }

  return data as FieldPosition[];
}

/**
 * Convert database coordinates to PDF points
 * Database: inches from top-left corner
 * PDF: points from bottom-left corner (1 inch = 72 points)
 *
 * CRITICAL: PDF drawText() uses Y-coordinate as TEXT BASELINE, not text top.
 * We must adjust Y-coordinate down by ~85% of font size to position text correctly
 * within the field bounding box.
 */
function convertCoordinates(position: FieldPosition, page: PDFPage, fontSize: number) {
  const POINTS_PER_INCH = 72;

  // Baseline offset: PDF text renders from baseline, not top
  // Typical font has cap height at ~70% and baseline at ~85% from top
  // For 12pt font: 12 * 0.85 = 10.2pt offset needed
  const BASELINE_RATIO = 0.85;

  // Parse database values (stored as strings)
  const topInches = parseFloat(position.position_top);
  const leftInches = parseFloat(position.position_left);
  const widthInches = parseFloat(position.field_width);

  // Get page dimensions
  const { height: pageHeight } = page.getSize();

  // Convert to PDF coordinate system
  // X: left margin (inches * 72 = points)
  const x = leftInches * POINTS_PER_INCH;

  // Y: flip from top-origin to bottom-origin + adjust for text baseline
  // PDF y=0 is at bottom, database y=0 is at top
  // Subtract baseline offset so text top aligns with field box top
  const baselineOffset = fontSize * BASELINE_RATIO;
  const y = pageHeight - (topInches * POINTS_PER_INCH) - baselineOffset;

  // Max width for text wrapping
  const maxWidth = widthInches * POINTS_PER_INCH;

  return { x, y, maxWidth };
}

/**
 * Format field values for display
 */
function formatFieldValue(value: string | boolean, fieldType: string): string {
  // Handle checkboxes
  if (fieldType === 'checkbox') {
    if (value === true || value === 'true') {
      return '✓'; // Checkmark
    }
    return ''; // Don't draw anything for unchecked boxes
  }

  // Handle text fields
  return String(value);
}
