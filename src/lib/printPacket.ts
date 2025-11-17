/**
 * Print Packet Generator
 *
 * Generates print-optimized PDFs for in-person filing at courthouse.
 * Includes filing checklist, court location info, and printing instructions.
 *
 * INSTALLATION REQUIRED:
 * npm install pdf-lib
 */

import { assemblePacket, generatePacketFilename } from './packetAssembler';
import type {
  TROPacket,
  PrintOptions,
  PrintResult,
  FilingLocation,
  AssemblyOptions,
} from '@/types/PacketTypes';

import {
  STANLEY_MOSK_FILING_LOCATION,
} from '@/types/PacketTypes';

// PDF manipulation library (must be installed)
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates print-ready PDF packet with instructions
 *
 * @param packet - TRO packet to print
 * @param options - Print options
 * @returns Print result with PDF and instructions
 */
export async function generatePrintPacket(
  packet: TROPacket,
  options: PrintOptions = {}
): Promise<PrintResult> {
  // Default options
  const printOptions: PrintOptions = {
    includeChecklist: true,
    includeCourtInfo: true,
    includeCopiesReminder: true,
    paperSize: 'letter',
    orientation: 'portrait',
    copies: 3, // Original + 2 copies
    ...options,
  };

  // Assemble main packet
  const assemblyOptions: AssemblyOptions = {
    includePageNumbers: true,
    includeTableOfContents: true,
    includeBookmarks: false,
    compress: false, // Don't compress for printing
    pdfACompliance: false,
  };

  const mainAssembly = await assemblePacket(packet.forms, packet.metadata, assemblyOptions);

  if (mainAssembly.status !== 'completed' || !mainAssembly.pdf) {
    throw new Error('Failed to assemble print packet: ' + (mainAssembly.errors?.join(', ') || 'Unknown error'));
  }

  let finalPdf = mainAssembly.pdf;

  // Add checklist page at the beginning
  if (printOptions.includeChecklist) {
    finalPdf = await addChecklistPage(finalPdf, packet, printOptions);
  }

  // Add court information page
  if (printOptions.includeCourtInfo) {
    finalPdf = await addCourtInfoPage(finalPdf, STANLEY_MOSK_FILING_LOCATION);
  }

  // Generate instructions
  const instructions = generatePrintInstructions(packet, printOptions);

  return {
    pdf: finalPdf,
    instructions,
    filingLocation: STANLEY_MOSK_FILING_LOCATION,
  };
}

/**
 * Adds a filing checklist page to the beginning of the PDF
 */
async function addChecklistPage(
  pdfBlob: Blob,
  packet: TROPacket,
  options: PrintOptions
): Promise<Blob> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('Checklist page generation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pdfBytes = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));

  // Create checklist page
  const checklistPage = pdfDoc.insertPage(0, [612, 792]); // Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 750;

  // Title
  checklistPage.drawText('IN-PERSON FILING CHECKLIST', {
    x: 50,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  // Subtitle
  checklistPage.drawText('Los Angeles Superior Court - Family Law Division', {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  yPosition -= 40;

  // Case information box
  drawBox(checklistPage, 50, yPosition - 60, 512, 70);
  yPosition -= 20;

  checklistPage.drawText(`Case Number: ${packet.metadata.caseNumber || '[To be assigned by court]'}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: fontBold,
  });

  yPosition -= 20;

  checklistPage.drawText(`Packet Type: ${formatPacketType(packet.metadata.packetType)}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: font,
  });

  yPosition -= 20;

  checklistPage.drawText(`Number of Forms: ${packet.forms.length}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: font,
  });

  yPosition -= 40;

  // Before You Go section
  checklistPage.drawText('BEFORE YOU GO TO THE COURTHOUSE:', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
  });

  yPosition -= 25;

  const beforeYouGoChecklist = [
    '☐ Print this packet (all pages, single-sided)',
    `☐ Make ${options.copies! - 1} copies (${options.copies! - 1} for court/respondent, 1 for your records)`,
    '☐ Sign all forms in ORIGINAL INK (not digital signature)',
    '☐ Bring valid photo ID (driver\'s license or state ID)',
    '☐ Bring pen for any last-minute corrections',
    '☐ Do NOT staple pages - use paper clips only',
  ];

  beforeYouGoChecklist.forEach(item => {
    checklistPage.drawText(item, {
      x: 60,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= 18;
  });

  yPosition -= 20;

  // Forms included section
  checklistPage.drawText('FORMS INCLUDED IN THIS PACKET:', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
  });

  yPosition -= 25;

  packet.forms.forEach((form, index) => {
    const checkMark = form.isComplete ? '✓' : '☐';
    const status = form.isComplete ? '[COMPLETED]' : '[INCOMPLETE - FINISH BEFORE FILING]';

    checklistPage.drawText(`${checkMark} ${form.formType}: ${form.displayName}`, {
      x: 60,
      y: yPosition,
      size: 10,
      font: form.isComplete ? font : fontBold,
      color: form.isComplete ? rgb(0, 0, 0) : rgb(0.8, 0, 0),
    });

    yPosition -= 15;

    if (!form.isComplete) {
      checklistPage.drawText(`   ${status}`, {
        x: 80,
        y: yPosition,
        size: 8,
        font: font,
        color: rgb(0.8, 0, 0),
      });

      yPosition -= 12;
    }
  });

  yPosition -= 20;

  // Important notes
  checklistPage.drawText('IMPORTANT NOTES:', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
  });

  yPosition -= 25;

  const importantNotes = [
    '• NO FILING FEE for domestic violence restraining orders',
    '• Court is open Monday-Friday, 8:30 AM - 4:30 PM',
    '• Arrive early (before 3:00 PM) to ensure your filing is processed same day',
    '• Clerk will review forms for completeness before accepting',
    '• You will receive file-stamped copies and a hearing date',
  ];

  importantNotes.forEach(note => {
    checklistPage.drawText(note, {
      x: 60,
      y: yPosition,
      size: 9,
      font: font,
    });
    yPosition -= 15;
  });

  const updatedBytes = await pdfDoc.save();
  return new Blob([updatedBytes], { type: 'application/pdf' });
  */

  // Return original PDF for now
  return pdfBlob;
}

/**
 * Adds court location and directions page
 */
async function addCourtInfoPage(pdfBlob: Blob, location: FilingLocation): Promise<Blob> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('Court info page generation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pdfBytes = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));

  // Create court info page
  const courtPage = pdfDoc.insertPage(1, [612, 792]); // Letter size, insert after checklist
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 750;

  // Title
  courtPage.drawText('FILING LOCATION', {
    x: 50,
    y: yPosition,
    size: 20,
    font: fontBold,
  });

  yPosition -= 40;

  // Location box
  drawBox(courtPage, 50, yPosition - 120, 512, 130);
  yPosition -= 20;

  courtPage.drawText(location.courtName, {
    x: 60,
    y: yPosition,
    size: 16,
    font: fontBold,
  });

  yPosition -= 25;

  courtPage.drawText(location.address, {
    x: 60,
    y: yPosition,
    size: 12,
    font: font,
  });

  yPosition -= 18;

  courtPage.drawText(location.cityStateZip, {
    x: 60,
    y: yPosition,
    size: 12,
    font: font,
  });

  yPosition -= 25;

  courtPage.drawText(location.filingWindow, {
    x: 60,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0.8),
  });

  yPosition -= 25;

  courtPage.drawText(`Hours: ${location.hours}`, {
    x: 60,
    y: yPosition,
    size: 12,
    font: font,
  });

  if (location.phone) {
    yPosition -= 18;
    courtPage.drawText(`Phone: ${location.phone}`, {
      x: 60,
      y: yPosition,
      size: 12,
      font: font,
    });
  }

  yPosition -= 40;

  // Special instructions
  if (location.specialInstructions && location.specialInstructions.length > 0) {
    courtPage.drawText('SPECIAL INSTRUCTIONS:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });

    yPosition -= 25;

    location.specialInstructions.forEach(instruction => {
      courtPage.drawText(`• ${instruction}`, {
        x: 60,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= 18;
    });
  }

  const updatedBytes = await pdfDoc.save();
  return new Blob([updatedBytes], { type: 'application/pdf' });
  */

  // Return original PDF for now
  return pdfBlob;
}

/**
 * Draws a box on the page (helper for checklist)
 */
function drawBox(page: any, x: number, y: number, width: number, height: number): void {
  // PLACEHOLDER: Requires pdf-lib
  /*
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });
  */
}

/**
 * Formats packet type for display
 */
function formatPacketType(packetType: string): string {
  return packetType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generates printing instructions
 */
function generatePrintInstructions(packet: TROPacket, options: PrintOptions): string[] {
  const instructions: string[] = [
    '🖨️ PRINTING INSTRUCTIONS',
    '',
    '1. Print Settings:',
    `   • Paper size: ${options.paperSize?.toUpperCase() || 'LETTER'} (8.5" × 11")`,
    `   • Orientation: ${options.orientation?.toUpperCase() || 'PORTRAIT'}`,
    '   • Print quality: High quality / Best',
    '   • Color: Black and white is acceptable',
    '   • Pages: All pages',
    '   • Page scaling: None (100%)',
    '',
    '2. Paper Requirements:',
    '   • Use standard white paper (20lb)',
    '   • Print SINGLE-SIDED only',
    '   • Do NOT use thermal receipt paper',
    '',
    `3. Make Copies (${options.copies || 3} sets total):`,
    '   • 1 original set (with original ink signatures)',
    '   • 1 copy for court records',
    '   • 1 copy for respondent (court will serve)',
    '   • 1 copy for your personal records (optional but recommended)',
    '',
    '4. Signing:',
    '   • Sign ALL signature lines in ORIGINAL INK',
    '   • Use blue or black ink only',
    '   • Do NOT use digital/electronic signatures for in-person filing',
    '   • Initial any corrections in ink',
    '',
    '5. Organization:',
    '   • Keep forms in the order shown in this packet',
    '   • Use paper clips (NOT staples)',
    '   • Place checklist on top for easy reference',
    '',
    '6. Before You Go:',
    '   • Review all forms for completeness',
    '   • Bring valid photo ID',
    '   • Bring a pen for any corrections',
    '   • Arrive before 3:00 PM for same-day processing',
    '',
    '7. At the Courthouse:',
    '   • Go to Family Law filing window (Room 100)',
    '   • Give all copies to the clerk',
    '   • Clerk will review for completeness',
    '   • Clerk will file-stamp and return copies to you',
    '   • You will receive a hearing date (usually 21 days out)',
    '   • Ask clerk for DV-109 (Notice of Hearing)',
    '',
    '💡 TIPS:',
    '   • NO filing fee for DV restraining orders',
    '   • Court cannot give legal advice',
    '   • Consider arriving early to avoid long lines',
    '   • Bring water and snacks (may take 1-2 hours)',
    '   • Ask about emergency TRO if immediate danger',
  ];

  return instructions;
}

/**
 * Estimates printing cost
 */
export function estimatePrintingCost(packet: TROPacket, copies: number = 3): {
  pages: number;
  cost: number;
  breakdown: string;
} {
  const totalPages = packet.totalPages * copies;
  const costPerPage = 0.10; // $0.10 per page (typical at print shops)
  const totalCost = totalPages * costPerPage;

  return {
    pages: totalPages,
    cost: totalCost,
    breakdown: `${packet.totalPages} pages × ${copies} copies × $${costPerPage.toFixed(2)}/page = $${totalCost.toFixed(2)}`,
  };
}

/**
 * Validates packet is ready for printing
 */
export function validatePrintReadiness(packet: TROPacket): {
  ready: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if all required forms are present
  const missingRequired = packet.forms.filter(f => f.isRequired && !f.isComplete);
  if (missingRequired.length > 0) {
    issues.push(`${missingRequired.length} required form(s) incomplete: ${missingRequired.map(f => f.formType).join(', ')}`);
  }

  // Check for signatures
  const needSignatures = packet.forms.filter(f =>
    f.formData && !f.formData.signature && !f.formData.signatureName
  );
  if (needSignatures.length > 0) {
    issues.push(`${needSignatures.length} form(s) need signatures: ${needSignatures.map(f => f.formType).join(', ')}`);
  }

  return {
    ready: issues.length === 0,
    issues,
  };
}
