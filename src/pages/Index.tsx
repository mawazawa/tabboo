import { lazy, Suspense } from "react";
import { AdaptiveLayout } from "@/components/layout/AdaptiveLayout";
import { MobileBottomSheet } from "@/components/layout/MobileBottomSheet";
import { useWindowSize } from "@/hooks/use-adaptive-layout";
import { useFieldOperations } from "@/hooks/use-field-operations";
import { useDocumentPersistence } from "@/hooks/use-document-persistence";
import { useUIControls } from "@/hooks/use-ui-controls";
import { getCurrentFieldPositions } from "@/utils/field-positions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FocusTrap } from "@/components/ui/focus-trap";
import { IndexHeader } from "./index/components/IndexHeader";
import { ControlToolbar } from "./index/components/ControlToolbar";
import { MobileFormViewerSection } from "./index/components/MobileFormViewerSection";
import { DesktopWorkspace } from "./index/components/DesktopWorkspace";

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
import { FileText, MessageSquare, LogOut, Loader2, Calculator, PanelLeftClose, PanelRightClose, Shield, Settings, Sparkles, Move, ChevronLeft, ChevronRight } from "@/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  snapAllToGrid, 
  alignHorizontal, 
  alignVertical, 
  distributeEvenly 
} from "@/utils/fieldPresets";
import type { FormTemplate } from "@/utils/templateManager";
import { autofillAllFromVault, getAutofillableFields, type PersonalVaultData } from "@/utils/vaultFieldMatcher";
import {
  preloadDistributionCalculator,
  cancelDistributionCalculator
} from "@/utils/routePreloader";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PanelSkeleton, ViewerSkeleton } from "./index/components/Skeletons";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [formData, setFormData] = useState<FormData>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldPositions, setFieldPositions] = useState<FieldPositions>({});
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showFieldsPanel, setShowFieldsPanel] = useState(true);
  const [showVaultPanel, setShowVaultPanel] = useState(false);
  const [currentPDFPage, setCurrentPDFPage] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [copiedFieldPositions, setCopiedFieldPositions] = useState<FieldPositions | null>(null);
  const [validationRules, setValidationRules] = useState<ValidationRules>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [vaultSheetOpen, setVaultSheetOpen] = useState(false);
  const { toast } = useToast();
  const { height } = useWindowSize(); // For mobile bottom sheet snap points
  const [mobileTab, setMobileTab] = useState<string>("fields"); // Mobile bottom sheet tab
  const hasUnsavedChanges = useRef(false);
  const pdfPanelRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: 'E' key to toggle edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Toggle edit mode with 'E' key
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsEditMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // toast is a stable function, doesn't need to be in dependencies

  // Toast notification when edit mode changes
  useEffect(() => {
    // Skip on initial mount
    if (isEditMode === false && !user) return;
    
    toast({
      title: isEditMode ? 'Edit Mode Enabled' : 'Edit Mode Disabled',
      description: isEditMode
        ? 'You can now reposition fields by dragging them or using arrow keys'
        : 'You can now fill form fields',
      duration: 2000,
    });
  }, [isEditMode]); // toast is a stable function, doesn't need to be in dependencies

  // Document persistence hook - handles auth, data loading, and autosave
  const { user, loading, documentId, handleLogout } = useDocumentPersistence({
    formData,
    fieldPositions,
    validationRules,
    hasUnsavedChanges,
    setFormData,
    setFieldPositions,
    setValidationRules,
    setVaultSheetOpen,
  });

  // Fetch vault data for AI Assistant context
  const { data: vaultData, isLoading: isVaultLoading } = useQuery({
    queryKey: ['vault-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        // Error occurred fetching vault data (silently handled)
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: true,
  });
  const typedVaultData = (vaultData as PersonalVaultData | null) ?? null;
  const autofillableCount = typedVaultData ? getAutofillableFields(typedVaultData).length : 0;
  const hasVaultData = Boolean(typedVaultData);

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
    vaultData: typedVaultData,
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
    vaultData: typedVaultData,
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

  const sharedFormViewerProps = {
    formData,
    updateField,
    currentFieldIndex,
    setCurrentFieldIndex,
    fieldPositions,
    updateFieldPosition,
    zoom: pdfZoom,
    fieldFontSize,
    highlightedField,
    validationErrors,
    vaultData: typedVaultData,
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5 w-full overflow-hidden">
      {/* Command Palette - Cmd+K */}
      <Suspense fallback={null}>
        <CommandPalette
          onToggleAI={() => setShowAIPanel(!showAIPanel)}
          onToggleFields={() => setShowFieldsPanel(!showFieldsPanel)}
          onToggleVault={() => setShowVaultPanel(!showVaultPanel)}
          onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
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
      />

      <main className="flex-1 flex flex-col container mx-auto px-4 py-6 overflow-hidden">
        <ControlToolbar
          showThumbnails={showThumbnails}
          onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
          showAIPanel={showAIPanel}
          onToggleAI={() => setShowAIPanel(!showAIPanel)}
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
          onToggleVault={() => setShowVaultPanel(!showVaultPanel)}
          showFieldsPanel={showFieldsPanel}
          onToggleFields={() => setShowFieldsPanel(!showFieldsPanel)}
          fieldFontSize={fieldFontSize}
          onDecreaseFontSize={() => setFieldFontSize((size) => Math.max(8, size - 1))}
          onIncreaseFontSize={() => setFieldFontSize((size) => Math.min(16, size + 1))}
          onResetFontSize={() => setFieldFontSize(12)}
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
              onToggleVisible={() => setShowAIPanel(!showAIPanel)}
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
