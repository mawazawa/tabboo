/**
 * Triggers browser download of PDF bytes
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for form export
 */
export function generateFilename(formType: string, caseNumber?: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const casePart = caseNumber ? `_${caseNumber}` : '';
  return `${formType}${casePart}_${date}.pdf`;
}
