import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from '@/icons';
import { fillPDFFields } from '@/lib/pdf-field-filler';
import { downloadPDF, generateFilename } from '@/lib/pdf-downloader';
import { useToast } from '@/hooks/use-toast';
import type { FormData } from '@/types/FormData';

interface Props {
  formData: FormData;
  formType: 'FL-320' | 'DV-100' | 'DV-105';
  caseNumber?: string;
  onExportComplete?: () => void;
  disabled?: boolean;
}

export function ExportPDFButton({
  formData,
  formType,
  caseNumber,
  onExportComplete,
  disabled = false
}: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // 1. Get PDF path
      const pdfPaths = {
        'FL-320': '/fl320.pdf',
        'DV-100': '/dv100.pdf',
        'DV-105': '/dv105.pdf',
      };

      // 2. Fill PDF fields
      const pdfBytes = await fillPDFFields({
        formData,
        pdfPath: pdfPaths[formType],
        formNumber: formType, // 'FL-320', 'DV-100', etc.
        fontSize: 12,
      });

      // 3. Download filled PDF
      const filename = generateFilename(formType, caseNumber);
      downloadPDF(pdfBytes, filename);

      // 4. Show success toast
      toast({
        title: 'Export Successful',
        description: `Downloaded ${filename}`,
      });

      // 5. Notify parent
      onExportComplete?.();

    } catch (error) {
      console.error('Export failed:', error);

      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      size="lg"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
