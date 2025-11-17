/**
 * E-Filing Export Button Component
 *
 * Provides a user-friendly interface for exporting court-ready PDFs.
 * Shows export options, validates requirements, and handles downloads.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  File,
  Files,
  ClipboardList,
} from '@/icons';
import { useToast } from '@/hooks/use-toast';
import { exportForEFiling, downloadEFilingExport, estimateExportSize, willExceedFileSizeLimit } from '@/lib/eFilingExporter';
import type { TROPacket, EFilingOptions } from '@/types/PacketTypes';
import { LA_SUPERIOR_COURT_REQUIREMENTS } from '@/types/PacketTypes';

interface Props {
  packet: TROPacket;
  onExportComplete?: () => void;
  disabled?: boolean;
  className?: string;
}

export function EFilingExportButton({
  packet,
  onExportComplete,
  disabled = false,
  className = '',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<EFilingOptions>({
    includeMetadata: true,
    separateCLETS: true,
    generateIndividualForms: false,
    includeChecklist: false,
    courtRequirements: LA_SUPERIOR_COURT_REQUIREMENTS,
  });

  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress (replace with actual progress tracking)
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Export packet
      const exportResult = await exportForEFiling(packet, exportOptions);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Download files
      downloadEFilingExport(exportResult);

      // Show success message
      toast({
        title: 'Export Successful',
        description: `Downloaded ${exportResult.metadata.fileNames.length} file(s) totaling ${formatFileSize(exportResult.metadata.fileSizeBytes)}`,
      });

      // Close dialog and notify parent
      setTimeout(() => {
        setIsOpen(false);
        setIsExporting(false);
        setExportProgress(0);
        onExportComplete?.();
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);

      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error during export',
        variant: 'destructive',
      });

      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const estimatedSize = estimateExportSize(packet);
  const exceedsLimit = willExceedFileSizeLimit(packet, LA_SUPERIOR_COURT_REQUIREMENTS);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          size="lg"
          variant="default"
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          Export for E-Filing
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileCheck className="h-6 w-6" />
            Export for E-Filing
          </DialogTitle>
          <DialogDescription>
            Generate court-ready PDF files for Los Angeles Superior Court e-filing system
          </DialogDescription>
        </DialogHeader>

        {/* Export Options */}
        <div className="space-y-6 my-4">
          {/* File Size Warning */}
          {exceedsLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>File Size Exceeds Limit</AlertTitle>
              <AlertDescription>
                Estimated file size ({formatFileSize(estimatedSize)}) exceeds court maximum of {formatFileSize(LA_SUPERIOR_COURT_REQUIREMENTS.maxFileSizeBytes)}.
                Consider removing unnecessary pages or compressing images.
              </AlertDescription>
            </Alert>
          )}

          {/* Packet Information */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-3">Packet Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Forms:</span>
                <span className="ml-2 font-medium">{packet.forms.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pages:</span>
                <span className="ml-2 font-medium">{packet.totalPages}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Case Number:</span>
                <span className="ml-2 font-medium">{packet.metadata.caseNumber || 'New Case'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Size:</span>
                <span className="ml-2 font-medium">{formatFileSize(estimatedSize)}</span>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Export Options */}
          <div className="space-y-4">
            <h4 className="font-semibold">Export Options</h4>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="separateCLETS"
                  checked={exportOptions.separateCLETS}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, separateCLETS: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="separateCLETS" className="font-medium cursor-pointer">
                    Generate Separate CLETS-001 PDF
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    CLETS-001 is confidential and filed separately from public packet
                  </p>
                </div>
                <Badge variant="secondary">Recommended</Badge>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="individualForms"
                  checked={exportOptions.generateIndividualForms}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, generateIndividualForms: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="individualForms" className="font-medium cursor-pointer">
                    Generate Individual Form PDFs
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Each form as a separate PDF (useful for selective filing)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="includeChecklist"
                  checked={exportOptions.includeChecklist}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeChecklist: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeChecklist" className="font-medium cursor-pointer">
                    Include Filing Checklist
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Helpful reference for e-filing process
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="includeMetadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeMetadata" className="font-medium cursor-pointer">
                    Embed PDF Metadata
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Case number, form types, and filing date in PDF properties
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Files to be Generated */}
          <div className="space-y-3">
            <h4 className="font-semibold">Files to be Generated</h4>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <File className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Main Packet PDF</div>
                  <div className="text-xs text-muted-foreground">
                    Combined packet with all forms (except CLETS-001 if separated)
                  </div>
                </div>
                <Badge>Required</Badge>
              </div>

              {exportOptions.separateCLETS && packet.forms.some(f => f.formType === 'CLETS-001') && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">CLETS-001 PDF</div>
                    <div className="text-xs text-muted-foreground">
                      Confidential law enforcement information (separate file)
                    </div>
                  </div>
                  <Badge variant="destructive">Confidential</Badge>
                </div>
              )}

              {exportOptions.generateIndividualForms && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <Files className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Individual Form PDFs</div>
                    <div className="text-xs text-muted-foreground">
                      {packet.forms.length} separate PDF files (one per form)
                    </div>
                  </div>
                </div>
              )}

              {exportOptions.includeChecklist && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Filing Checklist PDF</div>
                    <div className="text-xs text-muted-foreground">
                      Step-by-step e-filing instructions
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Exporting...</span>
                  <span className="text-muted-foreground">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || exceedsLimit}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export & Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Formats file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
