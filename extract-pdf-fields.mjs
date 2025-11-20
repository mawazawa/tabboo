#!/usr/bin/env node
/**
 * PDF Form Field Extractor
 *
 * Extracts all form fields from California Judicial Council PDFs
 * Outputs field names, types, and positions for implementation
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function extractFormFields(pdfPath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Analyzing: ${path.basename(pdfPath)}`);
  console.log('='.repeat(80));

  try {
    // Read PDF file
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // Get form
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`\nTotal Fields: ${fields.length}`);
    console.log(`Total Pages: ${pdfDoc.getPageCount()}\n`);

    // Group fields by type
    const fieldsByType = {
      text: [],
      checkbox: [],
      radio: [],
      dropdown: [],
      button: [],
      signature: [],
      unknown: []
    };

    // Analyze each field
    fields.forEach((field, index) => {
      const fieldName = field.getName();
      let fieldType = 'unknown';

      // Determine field type
      if (field.constructor.name.includes('TextField')) {
        fieldType = 'text';
      } else if (field.constructor.name.includes('CheckBox')) {
        fieldType = 'checkbox';
      } else if (field.constructor.name.includes('RadioGroup')) {
        fieldType = 'radio';
      } else if (field.constructor.name.includes('Dropdown')) {
        fieldType = 'dropdown';
      } else if (field.constructor.name.includes('Button')) {
        fieldType = 'button';
      } else if (field.constructor.name.includes('Signature')) {
        fieldType = 'signature';
      }

      fieldsByType[fieldType].push({
        index,
        name: fieldName,
        type: fieldType,
        constructor: field.constructor.name
      });
    });

    // Print fields by type
    console.log('FIELDS BY TYPE:');
    console.log('-'.repeat(80));

    Object.entries(fieldsByType).forEach(([type, typeFields]) => {
      if (typeFields.length > 0) {
        console.log(`\n${type.toUpperCase()} FIELDS (${typeFields.length}):`);
        typeFields.forEach(f => {
          console.log(`  [${f.index.toString().padStart(3, '0')}] ${f.name}`);
        });
      }
    });

    // Generate TypeScript interface skeleton
    console.log('\n\n' + '='.repeat(80));
    console.log('TYPESCRIPT INTERFACE SKELETON:');
    console.log('='.repeat(80));
    console.log('\nexport interface FormData {');

    // Header fields (common pattern)
    console.log('  // Header - Party Information');
    const headerFields = fields.filter(f => {
      const name = f.getName().toLowerCase();
      return name.includes('attorney') || name.includes('name') ||
             name.includes('address') || name.includes('phone') ||
             name.includes('email') || name.includes('bar');
    });

    headerFields.forEach(field => {
      const name = field.getName();
      const type = field.constructor.name.includes('CheckBox') ? 'boolean' : 'string';
      console.log(`  ${camelCase(name)}?: ${type};  // ${name}`);
    });

    console.log('\n  // Case Information');
    const caseFields = fields.filter(f => {
      const name = f.getName().toLowerCase();
      return name.includes('case') || name.includes('county') ||
             name.includes('court') || name.includes('hearing');
    });

    caseFields.forEach(field => {
      const name = field.getName();
      const type = field.constructor.name.includes('CheckBox') ? 'boolean' : 'string';
      console.log(`  ${camelCase(name)}?: ${type};  // ${name}`);
    });

    console.log('\n  // Form-Specific Fields');
    const otherFields = fields.filter(f => {
      const name = f.getName().toLowerCase();
      return !name.includes('attorney') && !name.includes('name') &&
             !name.includes('address') && !name.includes('phone') &&
             !name.includes('email') && !name.includes('bar') &&
             !name.includes('case') && !name.includes('county') &&
             !name.includes('court') && !name.includes('hearing');
    });

    otherFields.slice(0, 20).forEach(field => {
      const name = field.getName();
      const type = field.constructor.name.includes('CheckBox') ? 'boolean' : 'string';
      console.log(`  ${camelCase(name)}?: ${type};  // ${name}`);
    });

    if (otherFields.length > 20) {
      console.log(`  // ... and ${otherFields.length - 20} more fields`);
    }

    console.log('}\n');

    // Return summary
    return {
      filename: path.basename(pdfPath),
      totalFields: fields.length,
      totalPages: pdfDoc.getPageCount(),
      fieldsByType
    };

  } catch (error) {
    console.error(`Error processing ${pdfPath}:`, error.message);
    return null;
  }
}

// Helper function to convert field names to camelCase
function camelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase());
}

// Main execution
async function main() {
  const formsToAnalyze = [
    './public/fl300.pdf',
    './public/fl303.pdf',
    './public/fl305.pdf'
  ];

  const results = [];

  for (const formPath of formsToAnalyze) {
    if (fs.existsSync(formPath)) {
      const result = await extractFormFields(formPath);
      if (result) {
        results.push(result);
      }
    } else {
      console.error(`File not found: ${formPath}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  console.log('='.repeat(80));
  results.forEach(r => {
    console.log(`${r.filename.padEnd(20)} - ${r.totalFields} fields across ${r.totalPages} pages`);
  });
  console.log('\n');
}

main().catch(console.error);
