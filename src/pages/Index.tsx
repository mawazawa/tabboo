import { FormViewer } from "@/components/FormViewer";
import { FieldNavigationPanel } from "@/components/FieldNavigationPanel";
import { AIAssistant } from "@/components/AIAssistant";
import { PersonalDataVault } from "@/components/PersonalDataVault";
import { FileText, MessageSquare, LogOut, Loader2, Calculator, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
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
  const { toast } = useToast();
  const hasUnsavedChanges = useRef(false);

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    hasUnsavedChanges.current = true;
  };

  const updateFieldPosition = (field: string, position: { top: number; left: number }) => {
    setFieldPositions(prev => ({ ...prev, [field]: position }));
    hasUnsavedChanges.current = true;
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b-2 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-medium">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <FileText className="w-6 h-6 text-primary-foreground" />
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
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                          >
                            <Calculator className="h-5 w-5 mt-0.5 text-primary" />
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
                            <FileText className="h-5 w-5 mt-0.5 text-primary" />
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

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowAIPanel(!showAIPanel)}
              >
                <MessageSquare className="h-4 w-4" />
                AI Assistant
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowFieldsPanel(!showFieldsPanel)}
              >
                <PanelRightClose className="h-4 w-4" />
                Fields
              </Button>
              <PersonalDataVault userId={user?.id || ''} />
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Resizable Panels */}
      <main className="container mx-auto px-4 py-6">
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-140px)] w-full">
          {/* Left: AI Assistant Panel (collapsible) */}
          {showAIPanel && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <div className="h-full pr-3">
                  <AIAssistant formContext={formData} />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center: Form Viewer with PDF */}
          <ResizablePanel defaultSize={showAIPanel ? 50 : 70} minSize={30}>
            <div className="h-full px-3">
              <FormViewer 
                formData={formData} 
                updateField={updateField}
                currentFieldIndex={currentFieldIndex}
                fieldPositions={fieldPositions}
                updateFieldPosition={updateFieldPosition}
              />
            </div>
          </ResizablePanel>

          {/* Right: Field Navigation Panel (collapsible) */}
          {showFieldsPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <div className="h-full pl-3">
                  <FieldNavigationPanel 
                    formData={formData} 
                    updateField={updateField}
                    currentFieldIndex={currentFieldIndex}
                    setCurrentFieldIndex={setCurrentFieldIndex}
                    fieldPositions={fieldPositions}
                    updateFieldPosition={updateFieldPosition}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;
