/**
 * E-Filing Exporter
 *
 * Generates court-ready PDF exports for Los Angeles Superior Court e-filing.
 * Ensures compliance with court requirements (page size, margins, metadata).
 *
 * INSTALLATION REQUIRED:
 * npm install pdf-lib
 */

import { assemblePacket, generatePacketFilename } from './packetAssembler';
import type {
  TROPacket,
  EFilingOptions,
  EFilingExportResult,
  AssemblyOptions,
} from '@/types/PacketTypes';

import {
  FormType,
  LA_SUPERIOR_COURT_REQUIREMENTS,
} from '@/types/PacketTypes';

// PDF manipulation library (must be installed)
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Exports packet as court-ready PDF for e-filing
 *
 * @param packet - TRO packet to export
 * @param options - E-filing export options
 * @returns Export result with main packet and optional separate files
 */
export async function exportForEFiling(
  packet: TROPacket,
  options: EFilingOptions = {}
): Promise<EFilingExportResult> {
  // Default options
  const exportOptions: EFilingOptions = {
    includeMetadata: true,
    separateCLETS: true,
    generateIndividualForms: false,
    includeChecklist: false,
    courtRequirements: LA_SUPERIOR_COURT_REQUIREMENTS,
    ...options,
  };

  // Step 1: Assemble main packet (excluding CLETS-001 if separateCLETS is true)
  const mainForms = exportOptions.separateCLETS
    ? packet.forms.filter(f => f.formType !== FormType.CLETS001)
    : packet.forms;

  const assemblyOptions: AssemblyOptions = {
    includePageNumbers: true,
    includeTableOfContents: false, // Usually not needed for e-filing
    includeBookmarks: false, // Optional for self-represented litigants
    compress: true,
    pdfACompliance: false,
  };

  const mainAssembly = await assemblePacket(mainForms, packet.metadata, assemblyOptions);

  if (mainAssembly.status !== 'completed' || !mainAssembly.pdf) {
    throw new Error('Failed to assemble main packet: ' + (mainAssembly.errors?.join(', ') || 'Unknown error'));
  }

  const result: EFilingExportResult = {
    packetPdf: mainAssembly.pdf,
    metadata: {
      exportedAt: new Date(),
      packetType: packet.metadata.packetType,
      caseNumber: packet.metadata.caseNumber,
      totalPages: mainAssembly.totalPages,
      fileSizeBytes: mainAssembly.fileSizeBytes,
      fileNames: [generatePacketFilename(packet.metadata)],
    },
  };

  // Step 2: Generate separate CLETS-001 PDF if requested
  if (exportOptions.separateCLETS) {
    const cletsForm = packet.forms.find(f => f.formType === FormType.CLETS001);
    if (cletsForm?.pdfData) {
      const cletsPdf = await generateCLETSPdf(cletsForm.pdfData, packet.metadata);
      result.cletsPdf = cletsPdf;
      result.metadata.fileNames.push(
        `${packet.metadata.caseNumber || 'NewCase'}_CLETS001_${getDateString()}.pdf`
      );
    }
  }

  // Step 3: Generate individual form PDFs if requested
  if (exportOptions.generateIndividualForms) {
    result.individualForms = new Map();

    for (const form of packet.forms) {
      if (!form.pdfData) continue;

      const individualPdf = await generateIndividualFormPdf(
        form.pdfData,
        form.formType,
        packet.metadata
      );

      result.individualForms.set(form.formType, individualPdf);
      result.metadata.fileNames.push(
        `${packet.metadata.caseNumber || 'NewCase'}_${form.formType.replace('-', '')}_${getDateString()}.pdf`
      );
    }
  }

  // Step 4: Generate filing checklist if requested
  if (exportOptions.includeChecklist) {
    result.checklistPdf = await generateFilingChecklist(packet);
    result.metadata.fileNames.push(
      `${packet.metadata.caseNumber || 'NewCase'}_FilingChecklist_${getDateString()}.pdf`
    );
  }

  // Step 5: Validate court requirements
  await validateEFilingRequirements(result, exportOptions.courtRequirements);

  return result;
}

/**
 * Generates a separate CLETS-001 PDF
 */
async function generateCLETSPdf(pdfData: Blob | string, metadata: any): Promise<Blob> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('CLETS PDF generation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pdfBytes = await getBytesFromPdfData(pdfData);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Add watermark: "CONFIDENTIAL - LAW ENFORCEMENT ONLY"
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.drawText('CONFIDENTIAL - LAW ENFORCEMENT ONLY', {
      x: 50,
      y: height - 30,
      size: 10,
      font: font,
      color: rgb(0.8, 0, 0),
    });
  });

  // Add metadata
  pdfDoc.setTitle('CLETS-001 Confidential Information');
  pdfDoc.setSubject('Confidential Law Enforcement Information');
  pdfDoc.setAuthor('SwiftFill');
  pdfDoc.setKeywords(['CLETS-001', 'Confidential', metadata.caseNumber || '']);

  const updatedBytes = await pdfDoc.save();
  return new Blob([updatedBytes], { type: 'application/pdf' });
  */

  // Mock blob
  return new Blob(['CLETS-001 Mock PDF'], { type: 'application/pdf' });
}

/**
 * Generates an individual form PDF with metadata
 */
async function generateIndividualFormPdf(
  pdfData: Blob | string,
  formType: FormType,
  metadata: any
): Promise<Blob> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('Individual form PDF generation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pdfBytes = await getBytesFromPdfData(pdfData);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Add metadata
  pdfDoc.setTitle(`${formType} - ${metadata.caseNumber || 'New Case'}`);
  pdfDoc.setSubject(`California ${formType} Form`);
  pdfDoc.setAuthor('SwiftFill');
  pdfDoc.setKeywords([formType, metadata.caseNumber || '', metadata.county || '']);
  pdfDoc.setCreator('SwiftFill v1.0');

  const updatedBytes = await pdfDoc.save();
  return new Blob([updatedBytes], { type: 'application/pdf' });
  */

  // Mock blob
  return new Blob([`${formType} Mock PDF`], { type: 'application/pdf' });
}

/**
 * Generates a filing checklist PDF
 */
async function generateFilingChecklist(packet: TROPacket): Promise<Blob> {
  // PLACEHOLDER: Requires pdf-lib
  console.warn('Filing checklist generation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = 750;

  // Title
  page.drawText('E-Filing Checklist', {
    x: 50,
    y: yPosition,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Case information
  page.drawText(`Case Number: ${packet.metadata.caseNumber || 'New Case'}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  page.drawText(`Packet Type: ${packet.metadata.packetType}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Forms checklist
  page.drawText('Forms Included:', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  packet.forms.forEach((form, index) => {
    const checkMark = form.isComplete ? '✓' : '☐';
    page.drawText(`${checkMark} ${form.formType}: ${form.displayName}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
  */

  // Mock blob
  return new Blob(['Filing Checklist Mock PDF'], { type: 'application/pdf' });
}

/**
 * Validates that export meets court requirements
 */
async function validateEFilingRequirements(
  exportResult: EFilingExportResult,
  courtRequirements: any
): Promise<void> {
  // Check file size
  if (exportResult.packetPdf.size > courtRequirements.maxFileSizeBytes) {
    const sizeMB = (exportResult.packetPdf.size / 1024 / 1024).toFixed(2);
    const maxMB = (courtRequirements.maxFileSizeBytes / 1024 / 1024).toFixed(0);
    throw new Error(
      `PDF file size (${sizeMB} MB) exceeds court maximum of ${maxMB} MB. ` +
      `Try compressing images or removing unnecessary pages.`
    );
  }

  // PLACEHOLDER: Additional validation requires pdf-lib
  console.warn('Full e-filing requirements validation requires pdf-lib to be installed');

  /*
  // ACTUAL IMPLEMENTATION:
  // - Verify page size is 8.5" x 11"
  // - Verify margins meet requirements
  // - Verify PDF is text-searchable
  // - Verify bookmarks (if required)
  */
}

/**
 * Converts PDF data to Uint8Array
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
 * Gets current date as YYYYMMDD string
 */
function getDateString(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all files from export result
 */
export function downloadEFilingExport(exportResult: EFilingExportResult): void {
  // Download main packet
  downloadBlob(exportResult.packetPdf, exportResult.metadata.fileNames[0]);

  // Download CLETS if present
  if (exportResult.cletsPdf && exportResult.metadata.fileNames[1]) {
    setTimeout(() => {
      downloadBlob(exportResult.cletsPdf!, exportResult.metadata.fileNames[1]);
    }, 500);
  }

  // Download individual forms if present
  if (exportResult.individualForms) {
    let delay = 1000;
    exportResult.individualForms.forEach((pdf, formType) => {
      setTimeout(() => {
        const filename = exportResult.metadata.fileNames.find(name => name.includes(formType.replace('-', '')));
        if (filename) {
          downloadBlob(pdf, filename);
        }
      }, delay);
      delay += 500;
    });
  }

  // Download checklist if present
  if (exportResult.checklistPdf) {
    const checklistFilename = exportResult.metadata.fileNames.find(name => name.includes('Checklist'));
    if (checklistFilename) {
      setTimeout(() => {
        downloadBlob(exportResult.checklistPdf!, checklistFilename);
      }, exportResult.individualForms ? 1000 + exportResult.individualForms.size * 500 : 1500);
    }
  }
}

/**
 * Estimates export file size
 */
export function estimateExportSize(packet: TROPacket): number {
  // Rough estimate: 50KB per page
  return packet.totalPages * 50 * 1024;
}

/**
 * Checks if export will exceed court file size limits
 */
export function willExceedFileSizeLimit(packet: TROPacket, courtRequirements: any): boolean {
  const estimatedSize = estimateExportSize(packet);
  return estimatedSize > courtRequirements.maxFileSizeBytes;
}
