import { Download } from '@/icons';
import { StatefulButton, type ProcessStep } from '@/components/ui/stateful-button';
import { fillPDFFields } from '@/lib/pdf-field-filler';
import { downloadPDF, generateFilename } from '@/lib/pdf-downloader';
import { useToast } from '@/hooks/use-toast';
import type { FormData, FieldPositions } from '@/types/FormData';

interface Props {
  formData: FormData;
  formType: 'FL-320' | 'DV-100' | 'DV-105';
  fieldPositions?: FieldPositions;
  caseNumber?: string;
  onExportComplete?: () => void;
  disabled?: boolean;
}

export function ExportPDFButton({
  formData,
  formType,
  fieldPositions,
  caseNumber,
  onExportComplete,
  disabled = false
}: Props) {
  const { toast } = useToast();
  const processSteps: ProcessStep[] = [
    { name: 'Preparing template', duration: 250 },
    { name: 'Filling fields', duration: 400 },
    { name: 'Generating PDF', duration: 450 },
  ];

  const handleExport = async () => {
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
        fieldPositions, // Pass user's field positions (percentages)
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

      // User-friendly error message - hide technical details
      toast({
        title: 'Unable to Generate PDF',
        description: 'Please check your form inputs and try again. If the issue persists, try refreshing the page.',
        variant: 'destructive',
      });
      throw error instanceof Error ? error : new Error('Export failed');
    }
  };

  return (
    <StatefulButton
      onComplete={handleExport}
      processSteps={processSteps}
      successMessage="Export ready!"
      errorMessage="Export failed"
      variant="ghost"
      size="sm"
      className="h-6 px-1.5 gap-1 text-[10px]"
      expandOnProcess={false}
      disabled={disabled}
      haptic="success"
    >
      <>
        <Download className="h-3 w-3" />
        <span className="hidden sm:inline">PDF</span>
      </>
    </StatefulButton>
  );
}
