/**
 * Extract PDF Form Field Names and Coordinates
 * Development utility to extract form fields and generate SQL migrations
 *
 * Usage:
 *   node scripts/extract-pdf-fields.mjs public/dv100.pdf
 *   node scripts/extract-pdf-fields.mjs public/dv100.pdf --sql
 */

import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import path from 'path';

async function extractFieldNames(pdfPath, generateSQL = false) {
  console.log(`\n📄 Extracting field names from: ${pdfPath}\n`);

  try {
    // Read PDF file
    const pdfBytes = readFileSync(pdfPath);
    // Many court forms are encrypted for viewing only - we need to ignore encryption
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // Get form and fields
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`✅ Found ${fields.length} total fields\n`);

    // Try to get pages, but handle errors gracefully
    let pages = [];
    let defaultPageSize = { width: 612, height: 792 }; // US Letter
    try {
      pages = pdfDoc.getPages();
      if (pages.length > 0) {
        defaultPageSize = pages[0].getSize();
      }
    } catch (e) {
      console.log('⚠️  Could not get page info, using default page size (612x792)');
    }

    // Group fields by type
    const fieldsByType = {
      text: [],
      checkbox: [],
      radio: [],
      dropdown: [],
      button: [],
      other: []
    };

    fields.forEach((field, index) => {
      const name = field.getName();
      const constructor = field.constructor.name;

      // Categorize by type
      if (constructor.includes('TextField')) {
        fieldsByType.text.push(name);
      } else if (constructor.includes('CheckBox')) {
        fieldsByType.checkbox.push(name);
      } else if (constructor.includes('RadioGroup')) {
        fieldsByType.radio.push(name);
      } else if (constructor.includes('Dropdown')) {
        fieldsByType.dropdown.push(name);
      } else if (constructor.includes('Button')) {
        fieldsByType.button.push(name);
      } else {
        fieldsByType.other.push(name);
      }
    });

    // Print summary
    console.log('📊 Field Count by Type:');
    console.log(`   Text Fields: ${fieldsByType.text.length}`);
    console.log(`   Checkboxes: ${fieldsByType.checkbox.length}`);
    console.log(`   Radio Buttons: ${fieldsByType.radio.length}`);
    console.log(`   Dropdowns: ${fieldsByType.dropdown.length}`);
    console.log(`   Buttons: ${fieldsByType.button.length}`);
    console.log(`   Other: ${fieldsByType.other.length}\n`);

    // Print all field names
    console.log('📝 All Field Names (sorted alphabetically):\n');
    const allNames = fields.map(f => f.getName()).sort();
    allNames.forEach((name, index) => {
      console.log(`${String(index + 1).padStart(3, ' ')}. ${name}`);
    });

    console.log('\n\n📋 TypeScript Interface Suggestion:\n');
    console.log('export interface PDFFormData {');
    allNames.forEach(name => {
      // Convert PDF field name to camelCase for TypeScript
      const tsName = name.replace(/[^a-zA-Z0-9]/g, '_');
      console.log(`  ${tsName}?: string | boolean;`);
    });
    console.log('}\n');

    // Extract field coordinates
    const fieldData = [];
    const fieldsByPage = new Map();

    for (const field of fields) {
      const fieldName = field.getName();
      const fieldType = field.constructor.name;
      const widgets = field.acroField.getWidgets();

      for (const widget of widgets) {
        const rect = widget.getRectangle();

        // Find page index from widget's page reference
        let pageIndex = 0;
        const pageRef = widget.P();
        if (pageRef && pages.length > 0) {
          for (let p = 0; p < pages.length; p++) {
            if (pages[p].ref === pageRef) {
              pageIndex = p;
              break;
            }
          }
        }

        // Get page dimensions (use default if pages unavailable)
        let pageWidth = defaultPageSize.width;
        let pageHeight = defaultPageSize.height;
        if (pages.length > pageIndex) {
          const page = pages[pageIndex];
          const size = page.getSize();
          pageWidth = size.width;
          pageHeight = size.height;
        }

        // Convert to percentages (flip Y for top-left origin)
        const positionLeft = (rect.x / pageWidth) * 100;
        const positionTop = ((pageHeight - rect.y - rect.height) / pageHeight) * 100;
        const fieldWidth = (rect.width / pageWidth) * 100;

        const fieldInfo = {
          pdfFieldName: fieldName,
          fieldType: fieldType.includes('TextField') ? 'input' :
                     fieldType.includes('CheckBox') ? 'checkbox' :
                     fieldType.includes('Radio') ? 'radio' : 'input',
          pageNumber: pageIndex + 1,
          positionTop: Math.round(positionTop * 100) / 100,
          positionLeft: Math.round(positionLeft * 100) / 100,
          fieldWidth: Math.round(fieldWidth * 100) / 100,
          fieldHeight: Math.round(rect.height * 100) / 100,
        };

        fieldData.push(fieldInfo);

        if (!fieldsByPage.has(pageIndex + 1)) {
          fieldsByPage.set(pageIndex + 1, []);
        }
        fieldsByPage.get(pageIndex + 1).push(fieldInfo);
      }
    }

    // Print fields by page
    console.log('📊 Fields by page:');
    for (const [page, pageFields] of fieldsByPage) {
      console.log(`   Page ${page}: ${pageFields.length} fields`);
    }

    // Generate SQL if requested
    if (generateSQL) {
      const formId = path.basename(pdfPath, '.pdf').toUpperCase().replace(/[^A-Z0-9]/g, '-');
      const sql = generateSQLMigration(formId, fieldData);
      const outputPath = `supabase/migrations/20251123_${formId.toLowerCase()}_field_positions.sql`;
      writeFileSync(outputPath, sql);
      console.log(`\n✅ SQL migration written to: ${outputPath}`);

      // Also write JSON
      const jsonPath = outputPath.replace('.sql', '.json');
      writeFileSync(jsonPath, JSON.stringify(fieldData, null, 2));
      console.log(`   JSON data written to: ${jsonPath}`);
    }

    // Export as JSON for programmatic use
    const outputJson = {
      totalFields: fields.length,
      fieldsByType,
      allFieldNames: allNames,
      fieldData: generateSQL ? fieldData : undefined
    };

    if (!generateSQL) {
      console.log('\n📦 JSON Output (copy for scripts):\n');
      console.log(JSON.stringify(outputJson, null, 2));
    }

  } catch (error) {
    console.error('❌ Error extracting fields:', error);
    process.exit(1);
  }
}

function generateSQLMigration(formId, fields) {
  const timestamp = new Date().toISOString();

  let sql = `-- Field positions extracted from ${formId} PDF
-- Generated: ${timestamp}
-- Total fields: ${fields.length}

-- Clear existing mappings for this form (if re-running)
DELETE FROM form_field_mappings WHERE form_id = '${formId}';

-- Insert field mappings
`;

  for (const field of fields) {
    const formFieldName = field.pdfFieldName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      .replace(/^[A-Z]/, c => c.toLowerCase());

    sql += `
INSERT INTO form_field_mappings (
  form_id, field_id, form_field_name, page_number,
  position_top, position_left, field_width, field_height,
  placeholder_text, is_required, is_readonly
) VALUES (
  '${formId}', '${field.pdfFieldName}', '${formFieldName}', ${field.pageNumber},
  ${field.positionTop}, ${field.positionLeft}, ${field.fieldWidth}, ${field.fieldHeight},
  '${field.pdfFieldName.replace(/'/g, "''")}', false, false
) ON CONFLICT (form_id, field_id) DO UPDATE SET
  position_top = EXCLUDED.position_top,
  position_left = EXCLUDED.position_left,
  field_width = EXCLUDED.field_width,
  field_height = EXCLUDED.field_height;
`;
  }

  sql += `
-- Verification
DO $$
DECLARE
  field_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO field_count FROM form_field_mappings WHERE form_id = '${formId}';
  RAISE NOTICE 'Inserted % field mappings for ${formId}', field_count;
END $$;
`;

  return sql;
}

// Get PDF path from command line args
const pdfPath = process.argv[2] || 'public/fl320.pdf';
const generateSQL = process.argv.includes('--sql');
extractFieldNames(pdfPath, generateSQL);
