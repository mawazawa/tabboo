import { lazy, Suspense } from "react";
import { AdaptiveLayout } from "@/components/layout/AdaptiveLayout";
import { MobileBottomSheet } from "@/components/layout/MobileBottomSheet";
import { useWindowSize } from "@/hooks/use-adaptive-layout";
import { useFieldOperations } from "@/hooks/use-field-operations";
import { useDocumentPersistence } from "@/hooks/use-document-persistence";
import { useUIControls } from "@/hooks/use-ui-controls";
import { usePanelState } from "@/hooks/use-panel-state";
import { useVaultData } from "@/hooks/use-vault-data";
import { getCurrentFieldPositions } from "@/utils/field-positions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FocusTrap } from "@/components/ui/focus-trap";
import { IndexHeader } from "./index/components/IndexHeader";
import { ControlToolbar } from "./index/components/ControlToolbar";
import { MobileFormViewerSection } from "./index/components/MobileFormViewerSection";
import { DesktopWorkspace } from "./index/components/DesktopWorkspace";
import { FormTypeSelector } from "@/components/FormTypeSelector";
import type { FormType } from "@/components/FormViewer";

// Aggressive code splitting - lazy load all heavy components
const FormViewer = lazy(() => import("@/components/FormViewer").then(m => ({ default: m.FormViewer })));
const FieldNavigationPanel = lazy(() => import("@/components/FieldNavigationPanel").then(m => ({ default: m.FieldNavigationPanel })));
const DraggableAIAssistant = lazy(() => import("@/components/DraggableAIAssistant").then(m => ({ default: m.DraggableAIAssistant })));
const PersonalDataVaultPanel = lazy(() => import("@/components/PersonalDataVaultPanel").then(m => ({ default: m.PersonalDataVaultPanel })));
const PDFThumbnailSidebar = lazy(() => import("@/components/PDFThumbnailSidebar").then(m => ({ default: m.PDFThumbnailSidebar })));
const FieldSearchBar = lazy(() => import("@/components/FieldSearchBar").then(m => ({ default: m.FieldSearchBar })));
const TemplateManager = lazy(() => import("@/components/TemplateManager").then(m => ({ default: m.TemplateManager })));
const FieldGroupManager = lazy(() => import("@/components/FieldGroupManager").then(m => ({ default: m.FieldGroupManager })));
const CommandPalette = lazy(() => import("@/components/CommandPalette").then(m => ({ default: m.CommandPalette })));
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { FileText, MessageSquare, LogOut, Loader2, Calculator, PanelLeftClose, PanelRightClose, Shield, Settings, Sparkles, Move, ChevronLeft, ChevronRight } from "@/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { snapAllToGrid, alignHorizontal, alignVertical, distributeEvenly } from "@/utils/fieldPresets";
import type { FormTemplate } from "@/utils/templateManager";
import { autofillAllFromVault } from "@/utils/vaultFieldMatcher";
import { preloadDistributionCalculator, cancelDistributionCalculator } from "@/utils/routePreloader";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PanelSkeleton, ViewerSkeleton } from "./index/components/Skeletons";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ResizableHandleMulti } from "@/components/ui/resizable-handle-multi";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { FormData, ValidationRules, ValidationErrors, FieldPositions, ValidationRule } from "@/types/FormData";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formType, setFormType] = useState<FormType>('FL-320');
  const [formData, setFormData] = useState<FormData>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldPositions, setFieldPositions] = useState<FieldPositions>({});
  const [currentPDFPage, setCurrentPDFPage] = useState(1);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [copiedFieldPositions, setCopiedFieldPositions] = useState<FieldPositions | null>(null);
  const [validationRules, setValidationRules] = useState<ValidationRules>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const { toast } = useToast();
  const { height } = useWindowSize(); // For mobile bottom sheet snap points
  const hasUnsavedChanges = useRef(false);
  const pdfPanelRef = useRef<HTMLDivElement>(null);

  // Panel visibility state hook
  const panelState = usePanelState();
  const {
    showAIPanel, showFieldsPanel, showVaultPanel, showThumbnails,
    settingsSheetOpen, vaultSheetOpen, mobileTab,
    setSettingsSheetOpen, setVaultSheetOpen, setMobileTab,
    toggleAIPanel, toggleFieldsPanel, toggleVaultPanel, toggleThumbnails
  } = panelState;

  // Document persistence hook - handles auth, data loading, and autosave
  const {
    user,
    loading,
    documentId,
    handleLogout,
    saveStatus,
    lastSaved,
    saveError,
  } = useDocumentPersistence({
    formData,
    fieldPositions,
    validationRules,
    hasUnsavedChanges,
    setFormData,
    setFieldPositions,
    setValidationRules,
    setVaultSheetOpen,
  });

  // Vault data hook - fetches user's personal vault data
  const { vaultData, isVaultLoading, autofillableCount, hasVaultData } = useVaultData(user);

  // UI controls hook - handles zoom, font size, edit mode, and thumbnails
  const {
    pdfZoom,
    fieldFontSize,
    isEditMode,
    thumbnailPanelWidth,
    handleZoomOut,
    handleZoomIn,
    handleFitToPage,
    handleDecreaseFontSize,
    handleIncreaseFontSize,
    handleResetFontSize,
    handleEditToggle,
    handleThumbnailResize,
    setIsEditMode,
  } = useUIControls({
    pdfPanelRef,
    vaultData,
    user,
    toast,
  });

  // Field operations custom hook - handles all field manipulation (13 handlers)
  const {
    updateField,
    handleAutofillAll,
    updateFieldPosition,
    handleSnapToGrid,
    handleAlignHorizontal,
    handleAlignVertical,
    handleDistribute,
    handleCopyPositions,
    handlePastePositions,
    handleTransformPositions,
    handleApplyGroup,
    handleApplyTemplate,
    handleSaveValidationRules,
  } = useFieldOperations({
    formData,
    setFormData,
    fieldPositions,
    setFieldPositions,
    validationRules,
    setValidationRules,
    setValidationErrors,
    selectedFields,
    copiedFieldPositions,
    setCopiedFieldPositions,
    vaultData,
    hasUnsavedChanges,
  });

  // Wrapper for getCurrentFieldPositions utility to provide current state
  const getFieldPositions = useCallback(() => {
    return getCurrentFieldPositions(
      currentFieldIndex,
      fieldPositions,
      selectedFields,
      highlightedField
    );
  }, [currentFieldIndex, fieldPositions, selectedFields, highlightedField]);

  // Handle form type change - clear form data when switching
  const handleFormTypeChange = useCallback((newFormType: FormType) => {
    setFormType(newFormType);
    // Clear form data and reset state for new form
    setFormData({});
    setFieldPositions({});
    setCurrentFieldIndex(0);
    setCurrentPDFPage(1);
    setSelectedFields([]);
    setHighlightedField(null);
    setValidationErrors({});
    hasUnsavedChanges.current = false;

    toast({
      title: "Form Switched",
      description: `Switched to ${newFormType}. Start filling out the new form.`,
    });
  }, [toast]);

  const sharedFormViewerProps = {
    formData,
    updateField,
    currentFieldIndex,
    setCurrentFieldIndex,
    fieldPositions,
    updateFieldPosition,
    formType,
    zoom: pdfZoom,
    fieldFontSize,
    highlightedField,
    validationErrors,
    vaultData,
    isEditMode,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background w-full overflow-hidden">
      {/* Command Palette - Cmd+K */}
      <Suspense fallback={null}>
        <CommandPalette
          onToggleAI={toggleAIPanel}
          onToggleFields={toggleFieldsPanel}
          onToggleVault={toggleVaultPanel}
          onToggleThumbnails={toggleThumbnails}
          onOpenSettings={() => setSettingsSheetOpen(true)}
          onAutofillAll={handleAutofillAll}
          onLogout={handleLogout}
          userId={user?.id}
        />
      </Suspense>
      
      <IndexHeader
        onNavigateDistribution={() => navigate("/distribution-calculator")}
        onNavigateHome={() => navigate("/")}
        onPreloadDistribution={preloadDistributionCalculator}
        onCancelDistribution={cancelDistributionCalculator}
        onLogout={handleLogout}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        saveError={saveError}
        currentFormType={formType}
        onFormTypeChange={handleFormTypeChange}
        hasUnsavedChanges={hasUnsavedChanges.current}
      />

      <main className="flex-1 flex flex-col container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 overflow-hidden">
        <ControlToolbar
          showThumbnails={showThumbnails}
          onToggleThumbnails={toggleThumbnails}
          showAIPanel={showAIPanel}
          onToggleAI={toggleAIPanel}
          onAutofillAll={handleAutofillAll}
          isVaultLoading={isVaultLoading}
          hasVaultData={hasVaultData}
          autofillableCount={autofillableCount}
          pdfZoom={pdfZoom}
          onZoomOut={handleZoomOut}
          onZoomIn={handleZoomIn}
          onFitToPage={handleFitToPage}
          isEditMode={isEditMode}
          onToggleEditMode={handleEditToggle}
          showVaultPanel={showVaultPanel}
          onToggleVault={toggleVaultPanel}
          showFieldsPanel={showFieldsPanel}
          onToggleFields={toggleFieldsPanel}
          fieldFontSize={fieldFontSize}
          onDecreaseFontSize={handleDecreaseFontSize}
          onIncreaseFontSize={handleIncreaseFontSize}
          onResetFontSize={handleResetFontSize}
          formData={formData}
          fieldPositions={fieldPositions}
          caseNumber={formData.caseNumber}
        />

        <MobileFormViewerSection
          FormViewerComponent={FormViewer}
          sharedFormViewerProps={sharedFormViewerProps}
          fallback={<ViewerSkeleton />}
        />

        <DesktopWorkspace
          FormViewerComponent={FormViewer}
          FieldNavigationPanelComponent={FieldNavigationPanel}
          PersonalDataVaultPanelComponent={PersonalDataVaultPanel}
          ThumbnailSidebarComponent={PDFThumbnailSidebar}
          sharedFormViewerProps={sharedFormViewerProps}
          viewerFallback={<ViewerSkeleton />}
          panelFallback={<PanelSkeleton />}
          pdfPanelRef={pdfPanelRef}
          showThumbnails={showThumbnails}
          thumbnailPanelWidth={thumbnailPanelWidth}
          onThumbnailResize={handleThumbnailResize}
          currentPDFPage={currentPDFPage}
          onPageClick={setCurrentPDFPage}
          getCurrentFieldPositions={getFieldPositions}
          showFieldsPanel={showFieldsPanel}
          showVaultPanel={showVaultPanel}
          userId={user?.id}
          selectedFields={selectedFields}
          setSelectedFields={setSelectedFields}
          handleSnapToGrid={handleSnapToGrid}
          handleAlignHorizontal={handleAlignHorizontal}
          handleAlignVertical={handleAlignVertical}
          handleDistribute={handleDistribute}
          handleCopyPositions={handleCopyPositions}
          handlePastePositions={handlePastePositions}
          handleTransformPositions={handleTransformPositions}
          copiedFieldPositions={copiedFieldPositions}
          setHighlightedField={setHighlightedField}
          validationRules={validationRules}
          validationErrors={validationErrors}
          onSaveValidationRules={handleSaveValidationRules}
          settingsSheetOpen={settingsSheetOpen}
          onSettingsSheetChange={setSettingsSheetOpen}
          onApplyTemplate={handleApplyTemplate}
          onApplyGroup={handleApplyGroup}
        />

        <div className="hidden md:block">
          <Suspense fallback={null}>
            <DraggableAIAssistant
              formContext={formData}
              vaultData={vaultData}
              isVisible={showAIPanel}
              onToggleVisible={toggleAIPanel}
            />
          </Suspense>
        </div>

        <OfflineIndicator />

        <div className="md:hidden">
          <MobileBottomSheet snapPoints={[80, Math.min(400, height * 0.5), height - 100]} defaultSnapIndex={0} showHandle>
            <Tabs value={mobileTab} onValueChange={setMobileTab} className="h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-3 shrink-0">
                <TabsTrigger value="fields" className="text-xs">
                  Fields
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="vault" className="text-xs">
                  Vault
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="fields" className="h-full m-0 p-2">
                  <Suspense fallback={<PanelSkeleton />}>
                    <FieldNavigationPanel
                      formData={formData}
                      updateField={updateField}
                      currentFieldIndex={currentFieldIndex}
                      setCurrentFieldIndex={setCurrentFieldIndex}
                      fieldPositions={fieldPositions}
                      updateFieldPosition={updateFieldPosition}
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
                      onSaveValidationRules={handleSaveValidationRules}
                      settingsSheetOpen={settingsSheetOpen}
                      onSettingsSheetChange={setSettingsSheetOpen}
                      onApplyTemplate={handleApplyTemplate}
                      onApplyGroup={handleApplyGroup}
                    />
                  </Suspense>
                </TabsContent>

                <TabsContent value="ai" className="h-full m-0 p-2">
                  <Suspense fallback={<PanelSkeleton />}>
                    <div className="h-full">
                      <DraggableAIAssistant
                        formContext={formData}
                        vaultData={vaultData}
                        isVisible
                        onToggleVisible={() => setMobileTab("fields")}
                      />
                    </div>
                  </Suspense>
                </TabsContent>

                <TabsContent value="vault" className="h-full m-0 p-2">
                  <Suspense fallback={<PanelSkeleton />}>
                    {user?.id && <PersonalDataVaultPanel userId={user.id} />}
                  </Suspense>
                </TabsContent>
              </div>
            </Tabs>
          </MobileBottomSheet>
        </div>
      </main>

      {/* Personal Data Vault Sheet */}
      <Sheet open={vaultSheetOpen} onOpenChange={setVaultSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <FocusTrap
            active={vaultSheetOpen}
            escapeToDeactivate={true}
            onDeactivate={() => setVaultSheetOpen(false)}
          >
            <SheetHeader>
              <SheetTitle>Personal Data Vault</SheetTitle>
              <SheetDescription>
                Securely manage your personal information for auto-filling forms
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Suspense fallback={<PanelSkeleton />}>
                {user?.id && <PersonalDataVaultPanel userId={user.id} />}
              </Suspense>
            </div>
          </FocusTrap>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
