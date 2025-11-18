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
import type { FormData } from "@/types/FormData";

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
  caseNumber,
}: ControlToolbarProps) => (
  <div className="flex items-center justify-between gap-3 mb-6 p-4 bg-card/85 backdrop-blur-xl rounded-xl border border-border/40 shadow-[0_2px_8px_hsl(220_13%_13%/0.04),inset_0_1px_0_hsl(0_0%_100%/0.4)] flex-shrink-0 transition-all duration-300">
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showThumbnails ? "default" : "ghost"}
            size="sm"
            onClick={onToggleThumbnails}
            className="gap-2 transition-all hover:scale-105"
            aria-label={showThumbnails ? "Hide page thumbnails" : "Show page thumbnails"}
          >
            <PanelLeftClose className={cn("h-4 w-4 transition-transform", !showThumbnails && "rotate-180")} strokeWidth={1.5} />
            <span className="font-medium">Pages</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{showThumbnails ? "Hide" : "Show"} Pages</p>
          <p className="text-xs text-muted-foreground">Navigate through form pages with thumbnails</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showAIPanel ? "default" : "outline"}
            size="default"
            onClick={onToggleAI}
            className="gap-2 font-semibold relative group hover:scale-105 transition-all"
            aria-label="Toggle AI Chat Assistant"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={2} />
            <span>AI Chat Fill</span>
            {showAIPanel && <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium mb-1">AI Chat Fill</p>
          <p className="text-xs text-muted-foreground">Ask questions and get help filling out your form using AI</p>
          <p className="text-xs text-primary mt-1">💡 More prominent and auto-interactive for AI core feature</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="lg"
            onClick={onAutofillAll}
            disabled={isVaultLoading || !hasVaultData}
            className="gap-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/95 hover:via-primary/85 hover:to-primary/75 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold relative overflow-hidden group hover:scale-105"
            aria-label="Autofill all compatible fields from vault"
          >
            {isVaultLoading ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} /> : <Sparkles className="h-5 w-5 group-hover:animate-pulse" strokeWidth={2} />}
            <span className="relative z-10">AI Magic Fill</span>
            {hasVaultData && !isVaultLoading && (
              <Badge variant="secondary" className="ml-1 bg-background/20 hover:bg-background/30 transition-colors text-xs font-bold">
                {autofillableCount}
              </Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium mb-1">✨ AI Magic Fill</p>
          <p className="text-xs text-muted-foreground mb-1">Instantly autofill all compatible fields from your Personal Data Vault</p>
          {hasVaultData && !isVaultLoading && (
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">✨ {autofillableCount} fields ready to fill!</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 border-t pt-1">
            💡 Make this larger and pill-shaped, located in the most likely place users can easily overlay the field
          </p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-1" />

      <ExportPDFButton
        formData={formData}
        formType="FL-320"
        caseNumber={caseNumber}
      />
    </div>

    <div className="flex items-center gap-1 px-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onZoomOut} disabled={pdfZoom <= 0.5} className="h-8 w-8 p-0">
            <span className="text-lg font-semibold">−</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Zoom out (minimum 50%)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={pdfZoom === 1 ? "default" : "ghost"}
            size="sm"
            onClick={onFitToPage}
            className="flex items-center gap-1 px-3 min-w-[120px] justify-center transition-colors"
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="text-sm font-medium">{pdfZoom === 1 ? "Fit to Page" : `${Math.round(pdfZoom * 100)}%`}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Scale PDF to fit viewport perfectly</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onZoomIn} disabled={pdfZoom >= 2} className="h-8 w-8 p-0">
            <span className="text-lg font-semibold">+</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Zoom in (maximum 200%)</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <div className="flex items-center gap-1 bg-muted/30 rounded-md px-1 py-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onDecreaseFontSize} disabled={fieldFontSize <= 8} className="h-7 w-7 p-0">
            <span className="text-sm">A</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Decrease field font size (minimum 8pt)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={fieldFontSize === 12 ? "default" : "ghost"}
            size="sm"
            onClick={onResetFontSize}
            className="flex items-center gap-1 px-2.5 min-w-[70px] justify-center h-7 text-xs font-semibold"
          >
            <span className="text-xs">Font</span>
            <span className="font-mono">{fieldFontSize}pt</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset to default 12pt font size</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onIncreaseFontSize} disabled={fieldFontSize >= 16} className="h-7 w-7 p-0">
            <span className="text-base font-semibold">A</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Increase field font size (maximum 16pt)</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <div className="flex items-center gap-2 border-l border-border/50 pl-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={isEditMode ? "default" : "ghost"} size="sm" onClick={onToggleEditMode} className={cn("gap-2", !isEditMode && "hover:bg-primary/10")}>
            <Move className="h-4 w-4" strokeWidth={1.5} />
            {isEditMode ? "Exit Edit" : "Edit Mode"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEditMode ? "Exit edit mode to fill form fields (E)" : "Enable edit mode to reposition fields (E)"}</p>
        </TooltipContent>
      </Tooltip>
    </div>

    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showVaultPanel ? "default" : "ghost"}
            size="sm"
            onClick={onToggleVault}
            className="gap-2 transition-all hover:scale-105"
            aria-label={showVaultPanel ? "Hide Personal Data Vault" : "Show Personal Data Vault"}
          >
            <Shield className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-medium">Vault</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium mb-1">{showVaultPanel ? "Hide" : "Show"} Vault</p>
          <p className="text-xs text-muted-foreground">Securely manage your personal information</p>
          <p className="text-xs text-primary mt-1">💡 Should be visually clear meaning and should be placed at the outer edge of toolbar</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showFieldsPanel && !showVaultPanel ? "default" : "ghost"}
            size="sm"
            onClick={onToggleFields}
            className="gap-2 transition-all hover:scale-105"
            aria-label={showFieldsPanel ? "Hide Fields panel" : "Show Fields panel"}
          >
            <span className="font-medium">Fields</span>
            <PanelRightClose className={cn("h-4 w-4 transition-transform", !showFieldsPanel && "rotate-180")} strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium mb-1">{showFieldsPanel ? "Hide" : "Show"} Fields</p>
          <p className="text-xs text-muted-foreground">Navigate and fill form fields sequentially</p>
          <p className="text-xs text-primary mt-1">💡 Should be visually clear meaning and should be placed at the very outer edge of the toolbar</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
);

