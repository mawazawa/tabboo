import { lazy, Suspense } from "react";
import { AdaptiveLayout } from "@/components/layout/AdaptiveLayout";
import { MobileBottomSheet } from "@/components/layout/MobileBottomSheet";
import { useWindowSize } from "@/hooks/use-adaptive-layout";
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
  cancelDistributionCalculator,
  preloadCriticalRoutes 
} from "@/utils/routePreloader";
import { prefetchUserData } from "@/utils/dataPrefetcher";
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
import type { FormData, User, ValidationRules, ValidationErrors, FieldPositions, ValidationRule } from "@/types/FormData";
import type { Database } from "@/integrations/supabase/types";

type LegalDocument = Database['public']['Tables']['legal_documents']['Row'];

interface LegalDocumentMetadata {
  fieldPositions?: FieldPositions;
  validationRules?: ValidationRules;
}

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldPositions, setFieldPositions] = useState<FieldPositions>({});
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showFieldsPanel, setShowFieldsPanel] = useState(true);
  const [showVaultPanel, setShowVaultPanel] = useState(false);
  const [currentPDFPage, setCurrentPDFPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fieldFontSize, setFieldFontSize] = useState(12); // Default 12pt (PDF form standard)
  const [thumbnailPanelWidth, setThumbnailPanelWidth] = useState(200);
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

  const updateField = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    hasUnsavedChanges.current = true;

    // Validate field if it has rules
    if (validationRules[field]) {
      const { validateField } = require('@/utils/fieldValidator');
      const errors = validateField(field, value, validationRules[field]);
      setValidationErrors(prev => ({
        ...prev,
        [field]: errors
      }));
    }
  }, [validationRules]);

  const handleAutofillAll = useCallback(() => {
    if (!typedVaultData) {
      toast({
        title: "No vault data",
        description: "Please fill out your Personal Data Vault first",
        variant: "destructive"
      });
      return;
    }

    const autofilled = autofillAllFromVault(typedVaultData);
    const fieldsCount = Object.keys(autofilled).length;

    if (fieldsCount === 0) {
      toast({
        title: "Nothing to autofill",
        description: "No matching fields found for your vault data",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({ ...prev, ...autofilled }));
    hasUnsavedChanges.current = true;
    toast({
      title: "Success!",
      description: `Autofilled ${fieldsCount} field(s)`,
    });
  }, [typedVaultData, toast]);

  const updateFieldPosition = useCallback((field: string, position: { top: number; left: number }) => {
    setFieldPositions(prev => ({ ...prev, [field]: position }));
    hasUnsavedChanges.current = true;
  }, []);

  // Preset handlers
  const handleSnapToGrid = useCallback((gridSize: number) => {
    const fieldNames = selectedFields.length > 0 ? selectedFields : Object.keys(fieldPositions);
    const updated = snapAllToGrid(fieldPositions, fieldNames, gridSize);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Snapped to grid", description: `${fieldNames.length} field(s) aligned to ${gridSize}% grid` });
  }, [fieldPositions, selectedFields, toast]);

  const handleAlignHorizontal = useCallback((alignment: 'left' | 'center' | 'right') => {
    const updated = alignHorizontal(fieldPositions, selectedFields, alignment);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Aligned horizontally", description: `${selectedFields.length} field(s) aligned ${alignment}` });
  }, [fieldPositions, selectedFields, toast]);

  const handleAlignVertical = useCallback((alignment: 'top' | 'middle' | 'bottom') => {
    const updated = alignVertical(fieldPositions, selectedFields, alignment);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Aligned vertically", description: `${selectedFields.length} field(s) aligned ${alignment}` });
  }, [fieldPositions, selectedFields, toast]);

  const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
    const updated = distributeEvenly(fieldPositions, selectedFields, direction);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Distributed evenly", description: `${selectedFields.length} field(s) spaced ${direction}ly` });
  }, [fieldPositions, selectedFields, toast]);

  const handleCopyPositions = useCallback(() => {
    if (selectedFields.length === 0) return;
    const copied: Record<string, { top: number; left: number }> = {};
    selectedFields.forEach(field => {
      if (fieldPositions[field]) {
        copied[field] = { ...fieldPositions[field] };
      }
    });
    setCopiedFieldPositions(copied);
    toast({ title: "Copied", description: `${selectedFields.length} field position(s) copied to clipboard` });
  }, [selectedFields, fieldPositions, toast]);

  const handlePastePositions = useCallback(() => {
    if (!copiedFieldPositions || selectedFields.length === 0) return;

    const copiedFields = Object.keys(copiedFieldPositions);
    if (copiedFields.length === 0) return;

    const updated = { ...fieldPositions };

    // If pasting to same number of fields, apply directly with slight offset
    if (selectedFields.length === copiedFields.length) {
      selectedFields.forEach((targetField, index) => {
        const sourceField = copiedFields[index];
        if (copiedFieldPositions[sourceField]) {
          updated[targetField] = {
            top: copiedFieldPositions[sourceField].top + 2, // 2% offset to avoid exact overlap
            left: copiedFieldPositions[sourceField].left + 2
          };
        }
      });
    } else {
      // If different number, apply first copied position to all selected
      const firstCopiedPosition = copiedFieldPositions[copiedFields[0]];
      selectedFields.forEach((field, index) => {
        updated[field] = {
          top: firstCopiedPosition.top + (index * 2), // Stack with 2% offset
          left: firstCopiedPosition.left + (index * 2)
        };
      });
    }

    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Pasted", description: `Applied positions to ${selectedFields.length} field(s)` });
  }, [copiedFieldPositions, selectedFields, fieldPositions, toast]);

  const handleTransformPositions = useCallback((transformation: { offsetX?: number; offsetY?: number; scale?: number }) => {
    if (selectedFields.length === 0) return;

    const updated = { ...fieldPositions };
    selectedFields.forEach(field => {
      if (updated[field]) {
        const pos = updated[field];
        updated[field] = {
          top: transformation.scale ? pos.top * transformation.scale : pos.top + (transformation.offsetY || 0),
          left: transformation.scale ? pos.left * transformation.scale : pos.left + (transformation.offsetX || 0)
        };
      }
    });

    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Transformed", description: `Applied transformation to ${selectedFields.length} field(s)` });
  }, [selectedFields, fieldPositions, toast]);

  const handleApplyGroup = useCallback((groupPositions: Record<string, { top: number; left: number }>) => {
    const updated = { ...fieldPositions, ...groupPositions };
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
  }, [fieldPositions]);

  const handleApplyTemplate = useCallback((template: FormTemplate) => {
    setFieldPositions(template.fields);
    hasUnsavedChanges.current = true;
    toast({ title: "Template applied", description: `Loaded ${Object.keys(template.fields).length} field positions` });
  }, [toast]);

  const handleSaveValidationRules = useCallback((fieldName: string, rules: ValidationRule[]) => {
    setValidationRules(prev => ({
      ...prev,
      [fieldName]: rules
    }));
    hasUnsavedChanges.current = true;

    // Re-validate the field immediately with new rules
    const { validateField } = require('@/utils/fieldValidator');
    const errors = validateField(fieldName, formData[fieldName], rules);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: errors
    }));
  }, [formData]);

  // Get current field positions for minimap indicators (supports multiple fields)
  const getCurrentFieldPositions = () => {
    const fieldConfigs = [
      { field: 'partyName', top: 8, left: 5 },
      { field: 'firmName', top: 10, left: 5 },
      { field: 'streetAddress', top: 12, left: 5 },
      { field: 'mailingAddress', top: 14, left: 5 },
      { field: 'city', top: 16, left: 5 },
      { field: 'state', top: 16, left: 26 },
      { field: 'zipCode', top: 16, left: 34 },
      { field: 'telephoneNo', top: 18, left: 5 },
      { field: 'faxNo', top: 18, left: 23 },
      { field: 'email', top: 20, left: 5 },
      { field: 'attorneyFor', top: 22, left: 5 },
      { field: 'stateBarNumber', top: 22, left: 36 },
      { field: 'county', top: 8, left: 50 },
      { field: 'petitioner', top: 20, left: 77 },
      { field: 'respondent', top: 22, left: 77 },
      { field: 'otherParentParty', top: 24, left: 77 },
      { field: 'caseNumber', top: 27, left: 77 },
      { field: 'restrainingOrderNone', top: 36, left: 5 },
      { field: 'restrainingOrderActive', top: 38, left: 5 },
      { field: 'childCustodyConsent', top: 42, left: 5 },
      { field: 'visitationConsent', top: 44, left: 5 },
      { field: 'childCustodyDoNotConsent', top: 46, left: 7 },
      { field: 'visitationDoNotConsent', top: 46, left: 25 },
      { field: 'facts', top: 54, left: 5 },
      { field: 'signatureDate', top: 91, left: 5 },
      { field: 'printName', top: 93, left: 5 },
      { field: 'signatureName', top: 95, left: 5 },
    ];

    const positions: { top: number; left: number }[] = [];
    
    // Add current field
    const currentFieldName = fieldConfigs[currentFieldIndex]?.field;
    if (currentFieldName) {
      positions.push(fieldPositions[currentFieldName] || fieldConfigs[currentFieldIndex]);
    }
    
    // Add selected fields
    selectedFields.forEach(fieldName => {
      const config = fieldConfigs.find(f => f.field === fieldName);
      if (config) {
        positions.push(fieldPositions[fieldName] || { top: config.top, left: config.left });
      }
    });
    
    // Add highlighted field
    if (highlightedField) {
      const config = fieldConfigs.find(f => f.field === highlightedField);
      if (config && !positions.some(p => p === (fieldPositions[highlightedField] || { top: config.top, left: config.left }))) {
        positions.push(fieldPositions[highlightedField] || { top: config.top, left: config.left });
      }
    }

    return positions;
  };

  // Check authentication and prefetch data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        // Prefetch user data immediately for faster perceived performance
        prefetchUserData(queryClient, session.user);
        // Preload critical routes when idle
        preloadCriticalRoutes();
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        // Prefetch user data on auth state change
        prefetchUserData(queryClient, session.user);
        // Preload critical routes when idle
        preloadCriticalRoutes();
      } else {
        navigate("/auth");
      }
    });

    // Listen for vault sheet open event from command palette
    const handleOpenVaultSheet = () => {
      setVaultSheetOpen(true);
    };
    window.addEventListener('open-vault-sheet', handleOpenVaultSheet);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('open-vault-sheet', handleOpenVaultSheet);
    };
  }, [navigate, queryClient]);

  // Load existing data when user is authenticated (use cached data if available)
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Try to get cached data first
      const cachedData = queryClient.getQueryData<LegalDocument>(['legal-document', user.id, 'FL-320 Form']);

      if (cachedData) {
        setDocumentId(cachedData.id);
        setFormData((cachedData.content as FormData) || {});
        const metadata = cachedData.metadata as LegalDocumentMetadata | null;
        setFieldPositions(metadata?.fieldPositions || {});
        setValidationRules(metadata?.validationRules || {});
        return;
      }

      // If not cached, fetch from database
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', 'FL-320 Form')
        .maybeSingle();

      if (data) {
        setDocumentId(data.id);
        setFormData((data.content as FormData) || {});
        const metadata = data.metadata as LegalDocumentMetadata | null;
        setFieldPositions(metadata?.fieldPositions || {});
        setValidationRules(metadata?.validationRules || {});
      } else if (!error) {
        // Create new document
        const { data: newDoc } = await supabase
          .from('legal_documents')
          .insert({
            title: 'FL-320 Form',
            content: {},
            metadata: { fieldPositions: {}, validationRules: {} },
            user_id: user.id
          })
          .select()
          .maybeSingle();

        if (newDoc) setDocumentId(newDoc.id);
      }
    };

    loadData();
  }, [user, queryClient]);

  // Autosave every 5 seconds
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      if (!documentId || !hasUnsavedChanges.current) return;

      const { error } = await supabase
        .from('legal_documents')
        .update({
          content: formData,
          metadata: { fieldPositions, validationRules },
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (!error) {
        hasUnsavedChanges.current = false;
      }
    };

    const interval = setInterval(saveData, 5000);
    return () => clearInterval(interval);
  }, [formData, fieldPositions, documentId, user]);

  // Warn user before leaving with unsaved changes (prevents data loss)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = ''; // Modern browsers show generic "Leave site?" message
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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

  const handleZoomOut = useCallback(() => {
    setPdfZoom((prev) => Math.max(0.5, prev - 0.1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setPdfZoom((prev) => Math.min(2, prev + 0.1));
  }, []);

  const handleFitToPage = useCallback(() => {
    const updateZoom = (width: number) => {
      const targetWidth = 850;
      const calculatedZoom = Math.min(2, Math.max(0.5, width / targetWidth));
      setPdfZoom(calculatedZoom);
    };

    if (pdfPanelRef.current) {
      updateZoom(pdfPanelRef.current.clientWidth - 48);
      return;
    }

    const pdfPanel = document.getElementById("pdf-panel");
    if (pdfPanel) {
      updateZoom(pdfPanel.clientWidth - 48);
      return;
    }

    setPdfZoom(1);
  }, []);

  const handleEditToggle = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const hasVaultData = Boolean(typedVaultData);

  const handleThumbnailResize = useCallback((size: number) => {
    const containerWidth = window.innerWidth * 0.75;
    setThumbnailPanelWidth((size / 100) * containerWidth);
  }, []);

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

      {/* Main Content with Resizable Panels */}
      <main className="flex-1 flex flex-col container mx-auto px-4 py-6 overflow-hidden">
        {/* Control Toolbar */}
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
          onDecreaseFontSize={() => setFieldFontSize(Math.max(8, fieldFontSize - 1))}
          onIncreaseFontSize={() => setFieldFontSize(Math.min(16, fieldFontSize + 1))}
          onResetFontSize={() => setFieldFontSize(12)}
        />

        {/* Mobile PDF Viewer (full screen, no panels) */}
        <MobileFormViewerSection
          FormViewer={FormViewer}
          sharedFormViewerProps={sharedFormViewerProps}
          fallback={<ViewerSkeleton />}
        />

        {/* Desktop Layout (hidden on mobile) */}
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
          onThumbnailResize={(size) => {
            const containerWidth = window.innerWidth * 0.75;
            setThumbnailPanelWidth((size / 100) * containerWidth);
          }}
          currentPDFPage={currentPDFPage}
          onPageClick={setCurrentPDFPage}
          getCurrentFieldPositions={getCurrentFieldPositions}
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

        {/* Draggable AI Assistant (desktop only, on mobile it's in bottom sheet) */}
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

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Mobile Bottom Sheet (visible only on mobile) */}
        <div className="md:hidden">
          <MobileBottomSheet
            snapPoints={[80, Math.min(400, height * 0.5), height - 100]}
            defaultSnapIndex={0}
            showHandle={true}
          >
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
                      {/* AI Assistant in mobile view */}
                      <DraggableAIAssistant
                        formContext={formData}
                        vaultData={vaultData}
                        isVisible={true}
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
