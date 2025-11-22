import { Suspense, type ComponentType, type ReactNode, type RefObject } from "react";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { ResizableHandleMulti } from "@/components/ui/resizable-handle-multi";
import type {
  FieldPosition,
  FieldPositions,
  FormData,
  PersonalVaultData,
  ValidationErrors,
  ValidationRules,
  ValidationRule,
} from "@/types/FormData";
import type { FormTemplate } from "@/utils/templateManager";
import type { ThumbnailSidebarProps } from "@/components/PDFThumbnailSidebar";

interface SharedFormViewerProps {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  fieldPositions: FieldPositions;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  zoom: number;
  fieldFontSize: number;
  highlightedField?: string | null;
  validationErrors: ValidationErrors;
  vaultData?: PersonalVaultData | null;
  isEditMode?: boolean;
}

interface FieldNavigationPanelInjectedProps {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  fieldPositions: FieldPositions;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  selectedFields: string[];
  setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
  onSnapToGrid: (gridSize: number) => void;
  onAlignHorizontal: (alignment: "left" | "center" | "right") => void;
  onAlignVertical: (alignment: "top" | "middle" | "bottom") => void;
  onDistribute: (direction: "horizontal" | "vertical") => void;
  onCopyPositions: () => void;
  onPastePositions: () => void;
  onTransformPositions: (transformation: { offsetX?: number; offsetY?: number; scale?: number }) => void;
  hasCopiedPositions: boolean;
  onFieldHover: (fieldName: string | null) => void;
  validationRules: ValidationRules;
  validationErrors: ValidationErrors;
  onSaveValidationRules: (fieldName: string, rules: ValidationRule[]) => void;
  settingsSheetOpen: boolean;
  onSettingsSheetChange: (open: boolean) => void;
  onApplyTemplate: (template: FormTemplate) => void;
  onApplyGroup: (groupPositions: Record<string, FieldPosition>) => void;
}

interface PersonalVaultPanelProps {
  userId: string;
}

interface ThumbnailSidebarInjectedProps {
  currentPage?: number;
  onPageClick?: (pageNumber: number) => void;
  currentFieldPositions?: { top: number; left: number }[];
  showFieldIndicator?: boolean;
  panelWidth?: number;
}

interface DesktopWorkspaceProps {
  FormViewerComponent: ComponentType<SharedFormViewerProps>;
  FieldNavigationPanelComponent: ComponentType<FieldNavigationPanelInjectedProps>;
  PersonalDataVaultPanelComponent: ComponentType<PersonalVaultPanelProps>;
  ThumbnailSidebarComponent: ComponentType<ThumbnailSidebarInjectedProps>;
  sharedFormViewerProps: SharedFormViewerProps;
  viewerFallback: ReactNode;
  panelFallback: ReactNode;
  pdfPanelRef: RefObject<HTMLDivElement>;
  showThumbnails: boolean;
  thumbnailPanelWidth: number;
  onThumbnailResize: (size: number) => void;
  currentPDFPage: number;
  onPageClick: (page: number) => void;
  getCurrentFieldPositions: () => { top: number; left: number }[];
  showFieldsPanel: boolean;
  showVaultPanel: boolean;
  userId?: string;
  selectedFields: string[];
  setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
  handleSnapToGrid: (gridSize: number) => void;
  handleAlignHorizontal: (alignment: "left" | "center" | "right") => void;
  handleAlignVertical: (alignment: "top" | "middle" | "bottom") => void;
  handleDistribute: (direction: "horizontal" | "vertical") => void;
  handleCopyPositions: () => void;
  handlePastePositions: () => void;
  handleTransformPositions: (transformation: { offsetX?: number; offsetY?: number; scale?: number }) => void;
  copiedFieldPositions: FieldPositions | null;
  setHighlightedField: (field: string | null) => void;
  validationRules: ValidationRules;
  validationErrors: ValidationErrors;
  onSaveValidationRules: (fieldName: string, rules: ValidationRule[]) => void;
  settingsSheetOpen: boolean;
  onSettingsSheetChange: (open: boolean) => void;
  onApplyTemplate: (template: FormTemplate) => void;
  onApplyGroup: (groupPositions: Record<string, FieldPosition>) => void;
}

export const DesktopWorkspace = ({
  FormViewerComponent,
  FieldNavigationPanelComponent,
  PersonalDataVaultPanelComponent,
  ThumbnailSidebarComponent,
  sharedFormViewerProps,
  viewerFallback,
  panelFallback,
  pdfPanelRef,
  showThumbnails,
  thumbnailPanelWidth,
  onThumbnailResize,
  currentPDFPage,
  onPageClick,
  getCurrentFieldPositions,
  showFieldsPanel,
  showVaultPanel,
  userId,
  selectedFields,
  setSelectedFields,
  handleSnapToGrid,
  handleAlignHorizontal,
  handleAlignVertical,
  handleDistribute,
  handleCopyPositions,
  handlePastePositions,
  handleTransformPositions,
  copiedFieldPositions,
  setHighlightedField,
  validationRules,
  validationErrors,
  onSaveValidationRules,
  settingsSheetOpen,
  onSettingsSheetChange,
  onApplyTemplate,
  onApplyGroup,
}: DesktopWorkspaceProps) => (
  <ResizablePanelGroup direction="horizontal" className="hidden md:flex flex-1 w-full">
    <ResizablePanel id="viewer-panel" order={1} defaultSize={70} minSize={40}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          id="thumbnail-panel"
          order={1}
          defaultSize={15}
          minSize={10}
          maxSize={35}
          collapsible
          collapsedSize={0}
          onResize={onThumbnailResize}
          className={showThumbnails ? "" : "hidden"}
        >
          <Suspense fallback={panelFallback}>
            <ThumbnailSidebarComponent
              currentPage={currentPDFPage}
              onPageClick={onPageClick}
              currentFieldPositions={getCurrentFieldPositions()}
              showFieldIndicator={selectedFields.length > 0}
              panelWidth={thumbnailPanelWidth}
            />
          </Suspense>
        </ResizablePanel>

        {showThumbnails && <ResizableHandleMulti withHandle className="hover:bg-primary/30 transition-colors" />}

        <ResizablePanel id="pdf-panel" order={2} defaultSize={75} minSize={50}>
          <div ref={pdfPanelRef} className="h-full w-full" data-tour="form-viewer">
            <Suspense fallback={viewerFallback}>
              <FormViewerComponent {...sharedFormViewerProps} />
            </Suspense>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>

    <ResizableHandleMulti withHandle className="hover:bg-primary/30 transition-colors" />

    <ResizablePanel
      id="right-panel"
      order={2}
      defaultSize={30}
      minSize={25}
      maxSize={50}
      collapsible
      collapsedSize={0}
      className={showFieldsPanel || showVaultPanel ? "" : "hidden"}
    >
      <div className="h-full w-full flex flex-col overflow-hidden pl-3">
        <Suspense fallback={panelFallback}>
          {showVaultPanel ? (
            <PersonalDataVaultPanelComponent userId={userId || ""} />
          ) : (
            <FieldNavigationPanelComponent
              formData={sharedFormViewerProps.formData}
              updateField={sharedFormViewerProps.updateField}
              currentFieldIndex={sharedFormViewerProps.currentFieldIndex}
              setCurrentFieldIndex={sharedFormViewerProps.setCurrentFieldIndex}
              fieldPositions={sharedFormViewerProps.fieldPositions}
              updateFieldPosition={sharedFormViewerProps.updateFieldPosition}
              selectedFields={selectedFields}
              setSelectedFields={setSelectedFields}
              onSnapToGrid={handleSnapToGrid}
              onAlignHorizontal={handleAlignHorizontal}
              onAlignVertical={handleAlignVertical}
              onDistribute={handleDistribute}
              onCopyPositions={handleCopyPositions}
              onPastePositions={handlePastePositions}
              onTransformPositions={handleTransformPositions}
              hasCopiedPositions={!!copiedFieldPositions}
              onFieldHover={setHighlightedField}
              validationRules={validationRules}
              validationErrors={validationErrors}
              onSaveValidationRules={onSaveValidationRules}
              settingsSheetOpen={settingsSheetOpen}
              onSettingsSheetChange={onSettingsSheetChange}
              onApplyTemplate={onApplyTemplate}
              onApplyGroup={onApplyGroup}
            />
          )}
        </Suspense>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
);
