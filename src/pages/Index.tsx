import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
import { FileText, MessageSquare, LogOut, Loader2, Calculator, PanelLeftClose, PanelRightClose, Shield, Settings, Sparkles } from "lucide-react";
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
import { useState, useEffect, useRef } from "react";

// Loading fallbacks for code-split components
const PanelSkeleton = () => (
  <div className="w-full h-full p-4 space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const ViewerSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="space-y-4 text-center">
      <Skeleton className="h-96 w-full max-w-2xl mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>
  </div>
);
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

interface FormData {
  partyName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  county?: string;
  petitioner?: string;
  respondent?: string;
  caseNumber?: string;
  facts?: string;
  signatureDate?: string;
  signatureName?: string;
  noOrders?: boolean;
  agreeOrders?: boolean;
  consentCustody?: boolean;
  consentVisitation?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldPositions, setFieldPositions] = useState<Record<string, { top: number; left: number }>>({});
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showFieldsPanel, setShowFieldsPanel] = useState(true);
  const [showVaultPanel, setShowVaultPanel] = useState(false);
  const [currentPDFPage, setCurrentPDFPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [thumbnailPanelWidth, setThumbnailPanelWidth] = useState(200);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [copiedFieldPositions, setCopiedFieldPositions] = useState<Record<string, { top: number; left: number }> | null>(null);
  const [validationRules, setValidationRules] = useState<Record<string, any[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, any[]>>({});
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [vaultSheetOpen, setVaultSheetOpen] = useState(false);
  const { toast } = useToast();
  const hasUnsavedChanges = useRef(false);

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
        console.error('Error fetching vault data:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: true,
  });

  const updateField = (field: string, value: string | boolean) => {
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
  };

  const handleAutofillAll = () => {
    if (!vaultData) {
      toast({ 
        title: "No vault data", 
        description: "Please fill out your Personal Data Vault first",
        variant: "destructive"
      });
      return;
    }
    
    const autofilled = autofillAllFromVault(vaultData as PersonalVaultData);
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
  };

  const updateFieldPosition = (field: string, position: { top: number; left: number }) => {
    setFieldPositions(prev => ({ ...prev, [field]: position }));
    hasUnsavedChanges.current = true;
  };

  // Preset handlers
  const handleSnapToGrid = (gridSize: number) => {
    const updated = snapAllToGrid(fieldPositions, selectedFields, gridSize);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Snapped to grid", description: `${selectedFields.length} field(s) aligned to ${gridSize}% grid` });
  };

  const handleAlignHorizontal = (alignment: 'left' | 'center' | 'right') => {
    const updated = alignHorizontal(fieldPositions, selectedFields, alignment);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Aligned horizontally", description: `${selectedFields.length} field(s) aligned ${alignment}` });
  };

  const handleAlignVertical = (alignment: 'top' | 'middle' | 'bottom') => {
    const updated = alignVertical(fieldPositions, selectedFields, alignment);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Aligned vertically", description: `${selectedFields.length} field(s) aligned ${alignment}` });
  };

  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    const updated = distributeEvenly(fieldPositions, selectedFields, direction);
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
    toast({ title: "Distributed evenly", description: `${selectedFields.length} field(s) spaced ${direction}ly` });
  };

  const handleCopyPositions = () => {
    if (selectedFields.length === 0) return;
    const copied: Record<string, { top: number; left: number }> = {};
    selectedFields.forEach(field => {
      if (fieldPositions[field]) {
        copied[field] = { ...fieldPositions[field] };
      }
    });
    setCopiedFieldPositions(copied);
    toast({ title: "Copied", description: `${selectedFields.length} field position(s) copied to clipboard` });
  };

  const handlePastePositions = () => {
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
  };

  const handleTransformPositions = (transformation: { offsetX?: number; offsetY?: number; scale?: number }) => {
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
  };

  const handleApplyGroup = (groupPositions: Record<string, { top: number; left: number }>) => {
    const updated = { ...fieldPositions, ...groupPositions };
    setFieldPositions(updated);
    hasUnsavedChanges.current = true;
  };

  const handleApplyTemplate = (template: FormTemplate) => {
    setFieldPositions(template.fields);
    hasUnsavedChanges.current = true;
    toast({ title: "Template applied", description: `Loaded ${Object.keys(template.fields).length} field positions` });
  };

  const handleSaveValidationRules = (fieldName: string, rules: any[]) => {
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
  };

  // Get current field positions for minimap indicators (supports multiple fields)
  const getCurrentFieldPositions = () => {
    const fieldConfigs = [
      { field: 'partyName', top: 15.8, left: 5 },
      { field: 'streetAddress', top: 19, left: 5 },
      { field: 'city', top: 22.5, left: 5 },
      { field: 'state', top: 22.5, left: 29.5 },
      { field: 'zipCode', top: 22.5, left: 38 },
      { field: 'telephoneNo', top: 25.8, left: 5 },
      { field: 'faxNo', top: 25.8, left: 23 },
      { field: 'email', top: 29.2, left: 5 },
      { field: 'attorneyFor', top: 32.5, left: 5 },
      { field: 'county', top: 15.8, left: 55 },
      { field: 'petitioner', top: 22.5, left: 55 },
      { field: 'respondent', top: 26.5, left: 55 },
      { field: 'caseNumber', top: 32.5, left: 55 },
      { field: 'noOrders', top: 43.5, left: 25.5 },
      { field: 'agreeOrders', top: 46.5, left: 25.5 },
      { field: 'consentCustody', top: 53, left: 25.5 },
      { field: 'consentVisitation', top: 56, left: 25.5 },
      { field: 'facts', top: 68, left: 5 },
      { field: 'signatureDate', top: 90, left: 5 },
      { field: 'signatureName', top: 90, left: 50 },
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
      const cachedData = queryClient.getQueryData(['legal-document', user.id, 'FL-320 Form']);
      
      if (cachedData) {
        const data = cachedData as any;
        setDocumentId(data.id);
        setFormData(data.content || {});
        const metadata = data.metadata as any;
        setFieldPositions(metadata?.fieldPositions || {});
        setValidationRules(metadata?.validationRules || {});
        return;
      }

      // If not cached, fetch from database
      const { data, error } = await supabase
        .from('legal_documents' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('title', 'FL-320 Form')
        .maybeSingle();

      if (data) {
        setDocumentId((data as any).id);
        setFormData(((data as any).content as any) || {});
        const metadata = (data as any).metadata as any;
        setFieldPositions(metadata?.fieldPositions || {});
        setValidationRules(metadata?.validationRules || {});
      } else if (!error) {
        // Create new document
        const { data: newDoc } = await supabase
          .from('legal_documents' as any)
          .insert({
            title: 'FL-320 Form',
            content: {},
            metadata: { fieldPositions: {}, validationRules: {} },
            user_id: user.id
          } as any)
          .select()
          .maybeSingle();

        if (newDoc) setDocumentId((newDoc as any).id);
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
        .from('legal_documents' as any)
        .update({
          content: formData,
          metadata: { fieldPositions, validationRules },
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', documentId);

      if (!error) {
        hasUnsavedChanges.current = false;
      }
    };

    const interval = setInterval(saveData, 5000);
    return () => clearInterval(interval);
  }, [formData, fieldPositions, documentId, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
      
      {/* Header */}
      <header className="border-b-2 bg-card/80 backdrop-blur-sm z-50 shadow-medium flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <FileText className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SwiftFill Pro
                </h1>
                <p className="text-sm text-muted-foreground">AI-Powered Legal Form Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <NavigationMenuLink asChild>
                          <button
                            onClick={() => navigate("/distribution-calculator")}
                            onMouseEnter={preloadDistributionCalculator}
                            onMouseLeave={cancelDistributionCalculator}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                          >
                            <Calculator className="h-5 w-5 mt-0.5 text-primary" strokeWidth={1.5} />
                            <div>
                              <div className="font-medium mb-1">Distribution Calculator</div>
                              <p className="text-sm text-muted-foreground">
                                Calculate property division, validate Watts charges, and detect errors
                              </p>
                            </div>
                          </button>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <button
                            onClick={() => navigate("/")}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                          >
                            <FileText className="h-5 w-5 mt-0.5 text-primary" strokeWidth={1.5} />
                            <div>
                              <div className="font-medium mb-1">Form Filler (FL-320)</div>
                              <p className="text-sm text-muted-foreground">
                                Fill out legal forms with AI assistance
                              </p>
                            </div>
                          </button>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 shadow-3point chamfered spring-hover">
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Logout
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign out of your account</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Resizable Panels */}
      <main className="flex-1 flex flex-col container mx-auto px-4 py-6 overflow-hidden">
        {/* Control Toolbar */}
        <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-card/80 backdrop-blur-sm rounded-lg border shadow-sm flex-shrink-0">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            {/* AI Assistant Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`gap-2 ${showAIPanel ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
                  AI Chat
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle AI Assistant panel for smart form filling help</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            {/* Autofill All Fields Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  onClick={handleAutofillAll}
                  disabled={isVaultLoading || !vaultData}
                  className="gap-2"
                >
                  {isVaultLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  Autofill All Fields
                  {vaultData && !isVaultLoading && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-primary-foreground/20 rounded-full">
                      {getAutofillableFields(vaultData as PersonalVaultData).length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Instantly fill all compatible fields from your Personal Data Vault</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            {/* Thumbnail Collapse */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="gap-2"
                >
                  <PanelLeftClose className={`h-4 w-4 transition-transform ${!showThumbnails ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                  {showThumbnails ? 'Hide' : 'Show'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showThumbnails ? 'Hide page thumbnails' : 'Show page thumbnails'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Center Section - Zoom Controls */}
          <div className="flex items-center gap-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPdfZoom(Math.max(0.5, pdfZoom - 0.1))}
                  disabled={pdfZoom <= 0.5}
                  className="h-8 w-8 p-0"
                >
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
                  onClick={() => {
                    // Calculate zoom to fit PDF to viewport
                    const viewportWidth = window.innerWidth - (showThumbnails ? thumbnailPanelWidth : 0) - (showFieldsPanel ? 400 : 0) - 100; // Account for panels and padding
                    const targetWidth = 850; // Default PDF width
                    const calculatedZoom = Math.min(2, Math.max(0.5, viewportWidth / targetWidth));
                    setPdfZoom(calculatedZoom);
                  }}
                  className="flex items-center gap-1 px-3 min-w-[120px] justify-center transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">
                    {pdfZoom === 1 ? 'Scale to Fit' : `${Math.round(pdfZoom * 100)}%`}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scale PDF to fit viewport perfectly</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPdfZoom(Math.min(2, pdfZoom + 0.1))}
                  disabled={pdfZoom >= 2}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-lg font-semibold">+</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in (maximum 200%)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Fields Panel Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFieldsPanel(!showFieldsPanel)}
                  className={`gap-2 ${showFieldsPanel && !showVaultPanel ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <PanelRightClose className="h-4 w-4" strokeWidth={1.5} />
                  Fields
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle form field controls panel</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            {/* Personal Data Vault Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVaultPanel(!showVaultPanel)}
                  className={`gap-2 ${showVaultPanel ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Shield className="h-4 w-4" strokeWidth={1.5} />
                  Vault
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Personal Data Vault - securely store your information</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1 w-full">
          {/* Center: Form Viewer with PDF + Thumbnail Sidebar */}
          <ResizablePanel 
            id="viewer-panel"
            order={1}
            defaultSize={75}
            minSize={30}
          >
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Resizable Thumbnail Sidebar */}
              <ResizablePanel 
                id="thumbnail-panel"
                order={1}
                defaultSize={25}
                minSize={15}
                maxSize={40}
                collapsible={true}
                collapsedSize={0}
                onResize={(size) => {
                  // Convert percentage to pixels (approximate)
                  const containerWidth = window.innerWidth * 0.75; // 75% of viewport
                  setThumbnailPanelWidth((size / 100) * containerWidth);
                }}
                className={showThumbnails ? "" : "hidden"}
              >
                <Suspense fallback={<PanelSkeleton />}>
                  <PDFThumbnailSidebar 
                    currentPage={currentPDFPage}
                    onPageClick={setCurrentPDFPage}
                    currentFieldPositions={getCurrentFieldPositions()}
                    showFieldIndicator={currentFieldIndex >= 0 || selectedFields.length > 0 || !!highlightedField}
                    panelWidth={thumbnailPanelWidth}
                  />
                </Suspense>
              </ResizablePanel>
              
              {showThumbnails && (
                <ResizableHandleMulti withHandle className="hover:bg-primary/30 transition-colors" />
              )}
              
              {/* PDF Viewer */}
              <ResizablePanel 
                id="pdf-panel"
                order={2}
                defaultSize={75}
                minSize={50}
              >
                <Suspense fallback={<ViewerSkeleton />}>
                  <FormViewer 
                    formData={formData} 
                    updateField={updateField}
                    currentFieldIndex={currentFieldIndex}
                    setCurrentFieldIndex={setCurrentFieldIndex}
                    fieldPositions={fieldPositions}
                    updateFieldPosition={updateFieldPosition}
                    zoom={pdfZoom}
                    highlightedField={highlightedField}
                    validationErrors={validationErrors}
                    vaultData={vaultData as PersonalVaultData}
                  />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Right: Field Navigation Panel OR Vault Panel (collapsible) */}
          <ResizableHandleMulti withHandle className="hover:bg-primary/30 transition-colors" />
          <ResizablePanel
            id="right-panel"
            order={2}
            defaultSize={25}
            minSize={20}
            maxSize={40}
            collapsible={true}
            collapsedSize={0}
            className={showFieldsPanel || showVaultPanel ? "" : "hidden"}
          >
            <div className="h-full pl-3">
              <Suspense fallback={<PanelSkeleton />}>
                {showVaultPanel ? (
                  <PersonalDataVaultPanel userId={user?.id || ''} />
                ) : (
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
                )}
              </Suspense>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Draggable AI Assistant */}
        <Suspense fallback={null}>
          <DraggableAIAssistant 
            formContext={formData}
            vaultData={vaultData}
            isVisible={showAIPanel}
            onToggleVisible={() => setShowAIPanel(!showAIPanel)}
          />
        </Suspense>

        {/* Offline Indicator */}
        <OfflineIndicator />
      </main>

      {/* Personal Data Vault Sheet */}
      <Sheet open={vaultSheetOpen} onOpenChange={setVaultSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
