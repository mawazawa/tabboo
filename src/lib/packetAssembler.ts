/**
 * TRO Packet Assembler
 *
 * Combines multiple PDF forms into a single court-ready packet following
 * Los Angeles Superior Court requirements.
 *
 * INSTALLATION REQUIRED:
 * npm install pdf-lib
 *
 * pdf-lib is needed for PDF manipulation (combining, page numbers, metadata)
 */

import type {
  TROPacket,
  PacketForm,
  PacketMetadata,
  AssemblyOptions,
  AssemblyResult,
  AssemblyStatus,
  FormType,
  FormOrder,
  PacketType,
} from '@/types/PacketTypes';

import {
  DV_INITIAL_REQUEST_FORM_ORDER,
  DV_RESPONSE_FORM_ORDER,
  LA_SUPERIOR_COURT_REQUIREMENTS,
} from '@/types/PacketTypes';

// PDF manipulation library (must be installed)
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Assembles multiple forms into a single PDF packet
 *
 * @param forms - Array of forms to assemble
 * @param metadata - Packet metadata
 * @param options - Assembly options
 * @returns Assembly result with PDF blob
 */
export async function assemblePacket(
  forms: PacketForm[],
  metadata: PacketMetadata,
  options: AssemblyOptions = {}
): Promise<AssemblyResult> {
  const startTime = Date.now();

  try {
    // Step 1: Validate inputs
    validateInputs(forms, metadata);

    // Step 2: Sort forms in correct order
    const sortedForms = sortFormsInOrder(forms, metadata.packetType);

    // Step 3: Validate form dependencies
    validateFormDependencies(sortedForms, metadata.packetType);

    // Step 4: Combine PDFs
    const combinedPdf = await combinePDFs(sortedForms, options);

    // Step 5: Add page numbers (if requested)
    if (options.includePageNumbers) {
      await addPageNumbers(combinedPdf);
    }

    // Step 6: Add table of contents (if requested)
    if (options.includeTableOfContents) {
      await addTableOfContents(combinedPdf, sortedForms);
    }

    // Step 7: Add metadata
    await addMetadata(combinedPdf, metadata);

    // Step 8: Add bookmarks (if requested)
    if (options.includeBookmarks) {
      await addBookmarks(combinedPdf, sortedForms);
    }

    // Step 9: Validate court requirements
    await validateCourtRequirements(combinedPdf);

    // Step 10: Convert to blob
    const pdfBlob = await convertToBlob(combinedPdf);

    const durationMs = Date.now() - startTime;

    return {
      status: AssemblyStatus.COMPLETED,
      pdf: pdfBlob,
      totalPages: await getTotalPages(combinedPdf),
      fileSizeBytes: pdfBlob.size,
      assembledAt: new Date(),
      durationMs,
    };

  } catch (error) {
    const durationMs = Date.now() - startTime;

    return {
      status: AssemblyStatus.FAILED,
      totalPages: 0,
      fileSizeBytes: 0,
      assembledAt: new Date(),
      durationMs,
      errors: [error instanceof Error ? error.message : 'Unknown error during assembly'],
    };
  }
}

/**
 * Validates input forms and metadata
 */
function validateInputs(forms: PacketForm[], metadata: PacketMetadata): void {
  if (!forms || forms.length === 0) {
    throw new Error('No forms provided for assembly');
  }

  if (!metadata) {
    throw new Error('Packet metadata is required');
  }

  // Check that all forms have PDF data
  const missingPdfData = forms.filter(f => !f.pdfData);
  if (missingPdfData.length > 0) {
    throw new Error(
      `The following forms are missing PDF data: ${missingPdfData.map(f => f.formType).join(', ')}`
    );
  }
}

/**
 * Sorts forms in the correct order based on packet type
 */
function sortFormsInOrder(forms: PacketForm[], packetType: PacketType): PacketForm[] {
  const formOrder = getFormOrderForPacketType(packetType);

  // Create a map of form type to position
  const positionMap = new Map<FormType, number>();
  formOrder.forEach((order) => {
    positionMap.set(order.formType, order.position);
  });

  // Sort forms by position
  const sorted = [...forms].sort((a, b) => {
    const posA = positionMap.get(a.formType) ?? 999;
    const posB = positionMap.get(b.formType) ?? 999;
    return posA - posB;
  });

  // Update startPage and endPage for each form
  let currentPage = 1;
  sorted.forEach((form) => {
    form.startPage = currentPage;
    form.endPage = currentPage + (form.pageCount || 1) - 1;
    currentPage = form.endPage + 1;
  });

  return sorted;
}

/**
 * Gets the form order for a specific packet type
 */
function getFormOrderForPacketType(packetType: PacketType): FormOrder[] {
  switch (packetType) {
    case PacketType.DV_INITIAL_REQUEST:
      return DV_INITIAL_REQUEST_FORM_ORDER;
    case PacketType.DV_RESPONSE:
      return DV_RESPONSE_FORM_ORDER;
    default:
      throw new Error(`Unknown packet type: ${packetType}`);
  }
}

/**
 * Validates that all required forms are present based on dependencies
 */
function validateFormDependencies(forms: PacketForm[], packetType: PacketType): void {
  const formOrder = getFormOrderForPacketType(packetType);
  const presentFormTypes = new Set(forms.map(f => f.formType));

  // Check required forms
  const requiredForms = formOrder.filter(order => order.required);
  const missingRequired = requiredForms
    .filter(order => !presentFormTypes.has(order.formType))
    .map(order => order.formType);

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required forms for ${packetType}: ${missingRequired.join(', ')}`
    );
  }

  // TODO: Check conditional forms based on includedWhen conditions
  // This would require access to form data to check conditions
}

/**
 * Combines multiple PDF documents into one
 *
 * NOTE: This is a placeholder implementation. To make this work:
 * 1. Install pdf-lib: npm install pdf-lib
 * 2. Uncomment the import at the top
 * 3. Implement the actual PDF combining logic below
 */
async function combinePDFs(forms: PacketForm[], options: AssemblyOptions): Promise<any> {
  // PLACEHOLDER: Replace with actual pdf-lib implementation
  console.warn('PDF combination requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION (uncomment when pdf-lib is installed):

  const mergedPdf = await PDFDocument.create();

  for (const form of forms) {
    if (!form.pdfData) continue;

    // Load the form PDF
    const formPdfBytes = await getBytesFromPdfData(form.pdfData);
    const formPdf = await PDFDocument.load(formPdfBytes);

    // Copy all pages from this form
    const copiedPages = await mergedPdf.copyPages(formPdf, formPdf.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  // Apply compression if requested
  if (options.compress) {
    // PDF compression options
    mergedPdf.setProducer('SwiftFill v1.0');
  }

  return mergedPdf;
  */

  // For now, return a mock object
  return {
    _isMock: true,
    forms,
  };
}

/**
 * Adds page numbers to the PDF
 */
async function addPageNumbers(pdf: any): Promise<void> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('Page numbering requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const totalPages = pages.length;
    const text = `Page ${pageNumber} of ${totalPages}`;

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const { width, height } = page.getSize();

    // Add page number at bottom center
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 30,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  });
  */
}

/**
 * Adds table of contents to the beginning of the PDF
 */
async function addTableOfContents(pdf: any, forms: PacketForm[]): Promise<void> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('Table of contents requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const tocPage = pdf.insertPage(0);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  const lineHeight = 20;

  let yPosition = tocPage.getHeight() - 100;

  // Title
  tocPage.drawText('Table of Contents', {
    x: 50,
    y: yPosition,
    size: 16,
    font: font,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // List each form
  forms.forEach((form, index) => {
    const entry = `${index + 1}. ${form.displayName} ........................ Page ${form.startPage}`;

    tocPage.drawText(entry, {
      x: 70,
      y: yPosition,
      size: fontSize,
      font: await pdf.embedFont(StandardFonts.Helvetica),
      color: rgb(0, 0, 0),
    });

    yPosition -= lineHeight;
  });
  */
}

/**
 * Adds metadata to the PDF
 */
async function addMetadata(pdf: any, metadata: PacketMetadata): Promise<void> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('PDF metadata requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  pdf.setTitle(`${metadata.packetType} - ${metadata.caseNumber || 'New Case'}`);
  pdf.setAuthor('SwiftFill');
  pdf.setSubject(`TRO Packet - ${metadata.county} County`);
  pdf.setKeywords([
    metadata.packetType,
    metadata.caseNumber || '',
    'TRO',
    'Domestic Violence',
    metadata.county || '',
  ]);
  pdf.setProducer('SwiftFill v1.0');
  pdf.setCreator('SwiftFill');
  pdf.setCreationDate(metadata.createdAt);
  pdf.setModificationDate(metadata.lastModified);
  */
}

/**
 * Adds PDF bookmarks for easy navigation
 */
async function addBookmarks(pdf: any, forms: PacketForm[]): Promise<void> {
  // PLACEHOLDER: Requires pdf-lib with bookmark support
  console.warn('PDF bookmarks require pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:
  // Note: pdf-lib doesn't natively support bookmarks/outlines
  // You would need an additional library like pdf-lib-outline

  forms.forEach((form) => {
    // Create bookmark for each form
    // Bookmark text: form.displayName
    // Destination: page index form.startPage - 1
  });
  */
}

/**
 * Validates that the PDF meets court requirements
 */
async function validateCourtRequirements(pdf: any): Promise<void> {
  const requirements = LA_SUPERIOR_COURT_REQUIREMENTS;

  // PLACEHOLDER: Requires pdf-lib
  console.warn('Court requirements validation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pages = pdf.getPages();

  // Check page size
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const widthInches = width / 72; // PDF points to inches
    const heightInches = height / 72;

    if (
      Math.abs(widthInches - requirements.pageSize.width) > 0.1 ||
      Math.abs(heightInches - requirements.pageSize.height) > 0.1
    ) {
      throw new Error(
        `Page ${index + 1} has incorrect size: ${widthInches}" × ${heightInches}". ` +
        `Required: ${requirements.pageSize.width}" × ${requirements.pageSize.height}"`
      );
    }
  });

  // Check file size
  const pdfBytes = await pdf.save();
  if (pdfBytes.length > requirements.maxFileSizeBytes) {
    const sizeMB = (pdfBytes.length / 1024 / 1024).toFixed(2);
    const maxMB = (requirements.maxFileSizeBytes / 1024 / 1024).toFixed(0);
    throw new Error(
      `PDF file size (${sizeMB} MB) exceeds court maximum of ${maxMB} MB`
    );
  }
  */
}

/**
 * Converts PDF document to Blob
 */
async function convertToBlob(pdf: any): Promise<Blob> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('PDF to Blob conversion requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
  */

  // Mock blob for now
  return new Blob(['Mock PDF'], { type: 'application/pdf' });
}

/**
 * Gets total page count from PDF
 */
async function getTotalPages(pdf: any): Promise<number> {
  // PLACEHOLDER: Requires pdf-lib

  /*
  // ACTUAL IMPLEMENTATION:
  return pdf.getPageCount();
  */

  return 0;
}

/**
 * Converts PDF data (Blob or string) to Uint8Array
 */
async function getBytesFromPdfData(pdfData: Blob | string): Promise<Uint8Array> {
  if (pdfData instanceof Blob) {
    const arrayBuffer = await pdfData.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } else if (typeof pdfData === 'string') {
    // Data URL or base64
    if (pdfData.startsWith('data:')) {
      const base64 = pdfData.split(',')[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      // Assume base64
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
  }

  throw new Error('Unsupported PDF data format');
}

/**
 * Generates a filename for the assembled packet
 */
export function generatePacketFilename(metadata: PacketMetadata): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const caseNum = metadata.caseNumber?.replace(/[^a-zA-Z0-9]/g, '') || 'NewCase';
  const packetTypeShort = metadata.packetType
    .replace('dv_', '')
    .replace('_', '-')
    .toUpperCase();

  return `${caseNum}_${packetTypeShort}_Packet_${date}.pdf`;
}

/**
 * Estimates assembly time based on form count and complexity
 */
export function estimateAssemblyTime(formCount: number): number {
  // Base time: 500ms + 200ms per form
  return 500 + (formCount * 200);
}

/**
 * Checks if pdf-lib is installed
 */
export function isPdfLibAvailable(): boolean {
  try {
    // Try to require pdf-lib
    // @ts-ignore
    const pdfLib = require('pdf-lib');
    return !!pdfLib;
  } catch {
    return false;
  }
}

/**
 * Gets installation instructions if pdf-lib is not available
 */
export function getPdfLibInstallationInstructions(): string {
  return `
PDF assembly requires the pdf-lib library.

To install:
1. Run: npm install pdf-lib
2. Restart the development server
3. Try assembling the packet again

See: https://pdf-lib.js.org/
  `.trim();
}

/**
 * Creates a placeholder packet for testing without pdf-lib
 */
export async function createPlaceholderPacket(
  forms: PacketForm[],
  metadata: PacketMetadata
): Promise<TROPacket> {
  const sortedForms = sortFormsInOrder(forms, metadata.packetType);

  let totalPages = 0;
  sortedForms.forEach((form) => {
    totalPages += form.pageCount || 0;
  });

  return {
    metadata,
    forms: sortedForms,
    assemblyStatus: AssemblyStatus.NOT_STARTED,
    validationStatus: 'not_validated' as any,
    totalPages,
    completionPercentage: calculateCompletionPercentage(sortedForms),
  };
}

/**
 * Calculates overall completion percentage
 */
function calculateCompletionPercentage(forms: PacketForm[]): number {
  if (forms.length === 0) return 0;

  const totalCompletion = forms.reduce((sum, form) => {
    return sum + (form.completionPercentage || 0);
  }, 0);

  return Math.round(totalCompletion / forms.length);
}
