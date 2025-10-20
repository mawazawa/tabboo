import { FormViewer } from "@/components/FormViewer";
import { FieldNavigationPanel } from "@/components/FieldNavigationPanel";
import { AIAssistant } from "@/components/AIAssistant";
import { PersonalDataVault } from "@/components/PersonalDataVault";
import { FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [formData, setFormData] = useState<FormData>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Assistant
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>AI Form Assistant</SheetTitle>
                    <SheetDescription>
                      Get help filling out your FL-320 form
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 h-[calc(100vh-120px)]">
                    <AIAssistant />
                  </div>
                </SheetContent>
              </Sheet>
              <PersonalDataVault />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - DocuSign-style Layout */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 h-[calc(100vh-140px)]">
          {/* Left: Form Viewer with PDF */}
          <div className="min-h-[600px] lg:min-h-0">
            <FormViewer 
              formData={formData} 
              updateField={updateField}
              currentFieldIndex={currentFieldIndex}
            />
          </div>

          {/* Right: Narrow Field Navigation Panel */}
          <div className="min-h-[600px] lg:min-h-0">
            <FieldNavigationPanel 
              formData={formData} 
              updateField={updateField}
              currentFieldIndex={currentFieldIndex}
              setCurrentFieldIndex={setCurrentFieldIndex}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
