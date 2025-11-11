import { FormViewer } from "@/components/FormViewer";
import { FieldNavigationPanel } from "@/components/FieldNavigationPanel";
import { DraggableAIAssistant } from "@/components/DraggableAIAssistant";
import { PersonalDataVault } from "@/components/PersonalDataVault";
import { PersonalDataVaultPanel } from "@/components/PersonalDataVaultPanel";
import { PDFThumbnailSidebar } from "@/components/PDFThumbnailSidebar";
import { FieldSearchBar } from "@/components/FieldSearchBar";
import { TemplateManager } from "@/components/TemplateManager";
import { FileText, MessageSquare, LogOut, Loader2, Calculator, PanelLeftClose, PanelRightClose, Shield } from "lucide-react";
import { 
  snapAllToGrid, 
  alignHorizontal, 
  alignVertical, 
  distributeEvenly 
} from "@/utils/fieldPresets";
import type { FormTemplate } from "@/utils/templateManager";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
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
  const [thumbnailPanelWidth, setThumbnailPanelWidth] = useState(256);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { toast } = useToast();
  const hasUnsavedChanges = useRef(false);

  // Fetch vault data for AI Assistant context
  const { data: vaultData } = useQuery({
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
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    hasUnsavedChanges.current = true;
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

  const handleApplyTemplate = (template: FormTemplate) => {
    setFieldPositions(template.fields);
    hasUnsavedChanges.current = true;
    toast({ title: "Template applied", description: `Loaded ${Object.keys(template.fields).length} field positions` });
  };

  // Get current field position for minimap indicator
  const getCurrentFieldPosition = () => {
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

    const currentFieldName = fieldConfigs[currentFieldIndex]?.field;
    if (!currentFieldName) return null;

    return fieldPositions[currentFieldName] || fieldConfigs[currentFieldIndex];
  };

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load existing data when user is authenticated
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {

      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', 'FL-320 Form')
        .maybeSingle();

      if (data) {
        setDocumentId(data.id);
        setFormData((data.content as any) || {});
        const metadata = data.metadata as any;
        setFieldPositions(metadata?.fieldPositions || {});
      } else if (!error) {
        // Create new document
        const { data: newDoc } = await supabase
          .from('legal_documents')
          .insert({
            title: 'FL-320 Form',
            content: {} as any,
            metadata: { fieldPositions: {} } as any,
            user_id: user.id
          })
          .select()
          .maybeSingle();

        if (newDoc) setDocumentId(newDoc.id);
      }
    };

    loadData();
  }, [user]);

  // Autosave every 5 seconds
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      if (!documentId || !hasUnsavedChanges.current) return;

      const { error } = await supabase
        .from('legal_documents')
        .update({
          content: formData as any,
          metadata: { fieldPositions } as any,
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" strokeWidth={0.5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 w-full">
      {/* Header */}
      <header className="border-b-2 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-medium">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <FileText className="w-6 h-6 text-primary-foreground" strokeWidth={0.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SwiftFill Pro
                </h1>
                <p className="text-sm text-muted-foreground">AI-Powered Legal Form Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <NavigationMenuLink asChild>
                          <button
                            onClick={() => navigate("/distribution-calculator")}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                          >
                            <Calculator className="h-5 w-5 mt-0.5 text-primary" strokeWidth={0.5} />
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
                            <FileText className="h-5 w-5 mt-0.5 text-primary" strokeWidth={0.5} />
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

              {/* Search/AI Input */}
              <FieldSearchBar 
                onFieldSearch={(query) => setFieldSearchQuery(query)}
                onAIQuery={(query) => {
                  setShowAIPanel(true);
                  // TODO: Send query to AI assistant
                  toast({
                    title: "AI Query",
                    description: `Sending to AI: ${query}`,
                  });
                }}
              />

              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" strokeWidth={0.5} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Resizable Panels */}
      <main className="container mx-auto px-4 py-6">
        {/* Control Toolbar */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-card/80 backdrop-blur-sm rounded-lg border shadow-sm">
          {/* Thumbnail Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="gap-2"
            title={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
          >
            <PanelLeftClose className={`h-4 w-4 transition-transform ${!showThumbnails ? 'rotate-180' : ''}`} strokeWidth={0.5} />
            {showThumbnails ? 'Hide' : 'Show'}
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* AI Assistant Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`gap-2 ${showAIPanel ? 'bg-primary/10 text-primary' : ''}`}
            title="Toggle AI Assistant"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={0.5} />
            AI Chat
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPdfZoom(Math.max(0.5, pdfZoom - 0.1))}
              disabled={pdfZoom <= 0.5}
              title="Zoom out"
              className="h-8 w-8 p-0"
            >
              <span className="text-lg font-semibold">−</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPdfZoom(1)}
              title="Fit to page"
              className="flex items-center gap-1 px-3 min-w-[100px] justify-center hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={0.5} />
              <span className="text-sm font-medium">{Math.round(pdfZoom * 100)}%</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPdfZoom(Math.min(2, pdfZoom + 0.1))}
              disabled={pdfZoom >= 2}
              title="Zoom in"
              className="h-8 w-8 p-0"
            >
              <span className="text-lg font-semibold">+</span>
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Fields Panel Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFieldsPanel(!showFieldsPanel)}
            className={`gap-2 ${showFieldsPanel && !showVaultPanel ? 'bg-primary/10 text-primary' : ''}`}
            title="Toggle Fields Panel"
          >
            <PanelRightClose className="h-4 w-4" strokeWidth={0.5} />
            Fields
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Personal Data Vault Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVaultPanel(!showVaultPanel)}
            className={`gap-2 ${showVaultPanel ? 'bg-primary/10 text-primary' : ''}`}
            title="Toggle Personal Data Vault"
          >
            <Shield className="h-4 w-4" strokeWidth={0.5} />
            Vault
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Template Manager */}
          <TemplateManager
            currentFormId="FL-320"
            currentFormName="Response to Request for Restraining Orders"
            currentFieldPositions={fieldPositions}
            onApplyTemplate={handleApplyTemplate}
          />
        </div>

        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-220px)] w-full">
          {/* Center: Form Viewer with PDF + Thumbnail Sidebar */}
          <ResizablePanel defaultSize={75} minSize={30}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Resizable Thumbnail Sidebar */}
              {showThumbnails && (
                <>
                  <ResizablePanel 
                    defaultSize={30} 
                    minSize={20} 
                    maxSize={40}
                    onResize={(size) => {
                      // Convert percentage to pixels (approximate)
                      const containerWidth = window.innerWidth * 0.75; // 75% of viewport
                      setThumbnailPanelWidth((size / 100) * containerWidth);
                    }}
                  >
                    <PDFThumbnailSidebar 
                      currentPage={currentPDFPage}
                      onPageClick={setCurrentPDFPage}
                      currentFieldPosition={getCurrentFieldPosition()}
                      showFieldIndicator={currentFieldIndex >= 0}
                      panelWidth={thumbnailPanelWidth}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle className="hover:bg-primary/30 transition-colors" />
                </>
              )}
              
              {/* PDF Viewer */}
              <ResizablePanel defaultSize={showThumbnails ? 70 : 100} minSize={50}>
                <FormViewer 
                  formData={formData} 
                  updateField={updateField}
                  currentFieldIndex={currentFieldIndex}
                  setCurrentFieldIndex={setCurrentFieldIndex}
                  fieldPositions={fieldPositions}
                  updateFieldPosition={updateFieldPosition}
                  zoom={pdfZoom}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Right: Field Navigation Panel OR Vault Panel (collapsible) */}
          {(showFieldsPanel || showVaultPanel) && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <div className="h-full pl-3">
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
                    />
                  )}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* Draggable AI Assistant */}
        <DraggableAIAssistant 
          formContext={formData}
          vaultData={vaultData}
          isVisible={showAIPanel}
          onToggleVisible={() => setShowAIPanel(!showAIPanel)}
        />
      </main>
    </div>
  );
};

export default Index;
