import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Download } from "@/icons";
import { ExportPDFButton } from "@/components/ExportPDFButton";
import type { FormData, FieldPositions } from "@/types/FormData";

interface ControlToolbarProps {
  onAutofillAll: () => void;
  isVaultLoading: boolean;
  hasVaultData: boolean;
  pdfZoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitToPage: () => void;
  formData: FormData;
  fieldPositions: FieldPositions;
  caseNumber?: string;
}

export const ControlToolbar = ({
  onAutofillAll,
  isVaultLoading,
  hasVaultData,
  pdfZoom,
  onZoomOut,
  onZoomIn,
  onFitToPage,
  formData,
  fieldPositions,
  caseNumber,
}: ControlToolbarProps) => (
  <div className="flex items-center justify-center gap-4 mb-3 px-3 py-2 flex-shrink-0">
    {/* Zoom */}
    <div className="flex items-center gap-0.5 text-muted-foreground">
      <button
        onClick={onZoomOut}
        disabled={pdfZoom <= 0.5}
        className="px-1.5 py-0.5 text-xs hover:text-foreground disabled:opacity-30 transition-colors"
      >
        −
      </button>
      <button
        onClick={onFitToPage}
        className="px-1 text-[10px] font-mono hover:text-foreground transition-colors"
      >
        {Math.round(pdfZoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        disabled={pdfZoom >= 2}
        className="px-1.5 py-0.5 text-xs hover:text-foreground disabled:opacity-30 transition-colors"
      >
        +
      </button>
    </div>

    {/* AI Fill - Primary Action */}
    <Button
      onClick={onAutofillAll}
      disabled={isVaultLoading || !hasVaultData}
      size="sm"
      className="h-7 px-3 gap-1.5 text-xs font-medium"
    >
      {isVaultLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      Fill
    </Button>

    {/* Export */}
    <ExportPDFButton
      formData={formData}
      formType="FL-320"
      fieldPositions={fieldPositions}
      caseNumber={caseNumber}
    />
  </div>
);

