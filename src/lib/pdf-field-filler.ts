import { PDFDocument, PDFTextField, PDFCheckBox, PDFFont, PDFField } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface FillOptions {
  formData: Record<string, string | boolean>;
  pdfPath: string; // '/fl320.pdf'
  fontSize?: number; // Default 12pt
  font?: PDFFont;
}

/**
 * Fills PDF form fields with provided data
 * Supports: text fields, textareas, checkboxes
 */
export async function fillPDFFields(options: FillOptions): Promise<Uint8Array> {
  // 1. Load PDF
  const pdfBytes = await fetch(options.pdfPath).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // 2. Register fontkit for custom fonts
  pdfDoc.registerFontkit(fontkit);

  // 3. Get form from PDF
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // 4. Map field names from PDF to our FormData keys
  // NOTE: PDF field names might be different from our TypeScript keys!
  const fieldNameMap = buildFieldNameMap(fields);

  // 5. Fill each field
  for (const [fieldName, value] of Object.entries(options.formData)) {
    const pdfFieldName = fieldNameMap.get(fieldName);
    if (!pdfFieldName) {
      console.warn(`Field "${fieldName}" not found in PDF`);
      continue;
    }

    try {
      const field = form.getField(pdfFieldName);

      // Handle text fields
      if (field instanceof PDFTextField) {
        field.setText(String(value));
        field.setFontSize(options.fontSize || 12);
      }

      // Handle checkboxes
      else if (field instanceof PDFCheckBox) {
        if (value === true || value === 'true') {
          field.check();
        } else {
          field.uncheck();
        }
      }

    } catch (error) {
      console.error(`Error filling field "${fieldName}":`, error);
    }
  }

  // 6. Flatten form (make fields non-editable)
  // form.flatten(); // Optional: prevents editing after export

  // 7. Save and return PDF bytes
  return await pdfDoc.save();
}

/**
 * Build map from our field names to PDF field names
 * This might require manual mapping if names don't match
 */
function buildFieldNameMap(fields: PDFField[]): Map<string, string> {
  const map = new Map<string, string>();

  // Simple 1:1 mapping (might need adjustments)
  for (const field of fields) {
    const name = field.getName();
    map.set(name, name); // Start with identity mapping
  }

  // Add known aliases/mappings
  // Example: map.set('partyName', 'Party_Name_TextField');

  return map;
}
