/**
 * Extract PDF Form Field Names
 * Development utility to list all form field names from a PDF
 *
 * Usage: node scripts/extract-pdf-fields.mjs public/fl320.pdf
 */

import { readFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

async function extractFieldNames(pdfPath) {
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

    // Export as JSON for programmatic use
    const outputJson = {
      totalFields: fields.length,
      fieldsByType,
      allFieldNames: allNames
    };

    console.log('📦 JSON Output (copy for scripts):\n');
    console.log(JSON.stringify(outputJson, null, 2));

  } catch (error) {
    console.error('❌ Error extracting fields:', error);
    process.exit(1);
  }
}

// Get PDF path from command line args
const pdfPath = process.argv[2] || 'public/fl320.pdf';
extractFieldNames(pdfPath);
