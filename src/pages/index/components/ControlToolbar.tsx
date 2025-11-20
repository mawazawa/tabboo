import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  PanelLeftClose,
  MessageSquare,
  Sparkles,
  Loader2,
  PanelRightClose,
  Shield,
  Move,
  FileText,
} from "@/icons";
import { cn } from "@/lib/utils";
import { ExportPDFButton } from "@/components/ExportPDFButton";
import type { FormData, FieldPositions } from "@/types/FormData";

interface ControlToolbarProps {
  showThumbnails: boolean;
  onToggleThumbnails: () => void;
  showAIPanel: boolean;
  onToggleAI: () => void;
  onAutofillAll: () => void;
  isVaultLoading: boolean;
  hasVaultData: boolean;
  autofillableCount: number;
  pdfZoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitToPage: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  showVaultPanel: boolean;
  onToggleVault: () => void;
  showFieldsPanel: boolean;
  onToggleFields: () => void;
  fieldFontSize: number;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onResetFontSize: () => void;
  formData: FormData;
  fieldPositions: FieldPositions;
  caseNumber?: string;
}

export const ControlToolbar = ({
  showThumbnails,
  onToggleThumbnails,
  showAIPanel,
  onToggleAI,
  onAutofillAll,
  isVaultLoading,
  hasVaultData,
  autofillableCount,
  pdfZoom,
  onZoomOut,
  onZoomIn,
  onFitToPage,
  isEditMode,
  onToggleEditMode,
  showVaultPanel,
  onToggleVault,
  showFieldsPanel,
  onToggleFields,
  fieldFontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onResetFontSize,
  formData,
  fieldPositions,
  caseNumber,
}: ControlToolbarProps) => (
  <div data-tour="toolbar" className="flex items-center justify-between gap-1 mb-3 px-2 py-1.5 bg-card/80 backdrop-blur-md rounded-lg border border-border/30 shadow-sm flex-shrink-0">
    {/* Left: Panel toggles */}
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleThumbnails}
            className={cn("h-6 w-6 p-0", showThumbnails && "bg-muted")}
          >
            <PanelLeftClose className={cn("h-3 w-3", !showThumbnails && "rotate-180")} strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{showThumbnails ? "Hide" : "Show"} Pages</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAI}
            className={cn("h-6 px-1.5 gap-1 text-[10px]", showAIPanel && "bg-muted")}
          >
            <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
            Chat
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>AI Chat Assistant</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVault}
            className={cn("h-6 px-1.5 gap-1 text-[10px]", showVaultPanel && "bg-muted")}
            data-tour="vault-button"
          >
            <Shield className="h-3 w-3" strokeWidth={1.5} />
            Vault
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Personal Data Vault</p>
        </TooltipContent>
      </Tooltip>
    </div>

    {/* Center: Zoom controls + AI Magic Fill */}
    <div className="flex items-center gap-2">
      {/* Zoom controls */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onZoomOut} disabled={pdfZoom <= 0.5} className="h-5 w-5 p-0 text-[10px]">
          −
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onFitToPage}
          className="h-5 px-1 text-[9px] font-mono"
        >
          {Math.round(pdfZoom * 100)}%
        </Button>
        <Button variant="ghost" size="sm" onClick={onZoomIn} disabled={pdfZoom >= 2} className="h-5 w-5 p-0 text-[10px]">
          +
        </Button>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onAutofillAll}
            disabled={isVaultLoading || !hasVaultData}
            className="h-7 px-3 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-sm transition-all"
          >
            {isVaultLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            <span>AI Fill</span>
            {hasVaultData && !isVaultLoading && autofillableCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-4 px-1 bg-primary-foreground/20 text-[9px] font-bold">
                {autofillableCount}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">AI Magic Fill</p>
          <p className="text-xs text-muted-foreground">Auto-fill {autofillableCount} fields from vault</p>
        </TooltipContent>
      </Tooltip>
    </div>

    {/* Right: Font, Edit, Fields, Export */}
    <div className="flex items-center gap-0.5">
      {/* Font size controls */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onDecreaseFontSize} disabled={fieldFontSize <= 8} className="h-5 w-5 p-0 text-[9px]">
          A
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFontSize}
          className="h-5 px-0.5 text-[9px] font-mono"
        >
          {fieldFontSize}
        </Button>
        <Button variant="ghost" size="sm" onClick={onIncreaseFontSize} disabled={fieldFontSize >= 16} className="h-5 w-5 p-0 text-[10px]">
          A
        </Button>
      </div>

      <div className="h-3 w-px bg-border/50 mx-0.5" />

      {/* Edit mode */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleEditMode}
            className={cn("h-6 w-6 p-0", isEditMode && "bg-muted")}
          >
            <Move className="h-3 w-3" strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEditMode ? "Exit Edit Mode" : "Edit Mode"} (E)</p>
        </TooltipContent>
      </Tooltip>

      {/* Fields panel */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFields}
            className={cn("h-6 w-6 p-0", showFieldsPanel && "bg-muted")}
          >
            <PanelRightClose className={cn("h-3 w-3", !showFieldsPanel && "rotate-180")} strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showFieldsPanel ? "Hide" : "Show"} Fields</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-3 w-px bg-border/50 mx-0.5" />

      {/* Export PDF */}
      <ExportPDFButton
        formData={formData}
        formType="FL-320"
        fieldPositions={fieldPositions}
        caseNumber={caseNumber}
      />
    </div>
  </div>
);

