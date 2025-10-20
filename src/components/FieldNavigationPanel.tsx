import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

interface FieldConfig {
  field: keyof FormData;
  label: string;
  type: 'input' | 'textarea' | 'checkbox';
  placeholder?: string;
  vaultField?: string; // Maps to personal_info column
}

interface Props {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
}

const FIELD_CONFIG: FieldConfig[] = [
  { field: 'partyName', label: 'Name', type: 'input', placeholder: 'Full name', vaultField: 'full_name' },
  { field: 'streetAddress', label: 'Street Address', type: 'input', placeholder: 'Street address', vaultField: 'street_address' },
  { field: 'city', label: 'City', type: 'input', placeholder: 'City', vaultField: 'city' },
  { field: 'state', label: 'State', type: 'input', placeholder: 'CA', vaultField: 'state' },
  { field: 'zipCode', label: 'ZIP Code', type: 'input', placeholder: 'ZIP code', vaultField: 'zip_code' },
  { field: 'telephoneNo', label: 'Telephone', type: 'input', placeholder: 'Phone number', vaultField: 'telephone_no' },
  { field: 'faxNo', label: 'Fax', type: 'input', placeholder: 'Fax number', vaultField: 'fax_no' },
  { field: 'email', label: 'Email', type: 'input', placeholder: 'Email address', vaultField: 'email_address' },
  { field: 'attorneyFor', label: 'Attorney For', type: 'input', placeholder: 'Attorney for', vaultField: 'attorney_name' },
  { field: 'county', label: 'County', type: 'input', placeholder: 'County' },
  { field: 'petitioner', label: 'Petitioner', type: 'input', placeholder: 'Petitioner name' },
  { field: 'respondent', label: 'Respondent', type: 'input', placeholder: 'Respondent name' },
  { field: 'caseNumber', label: 'Case Number', type: 'input', placeholder: 'Case number' },
  { field: 'noOrders', label: 'No orders requested', type: 'checkbox' },
  { field: 'agreeOrders', label: 'Agree to orders', type: 'checkbox' },
  { field: 'consentCustody', label: 'Consent to custody', type: 'checkbox' },
  { field: 'consentVisitation', label: 'Consent to visitation', type: 'checkbox' },
  { field: 'facts', label: 'Facts', type: 'textarea', placeholder: 'Enter facts and details' },
  { field: 'signatureDate', label: 'Date', type: 'input', placeholder: 'Date' },
  { field: 'signatureName', label: 'Signature Name', type: 'input', placeholder: 'Your name', vaultField: 'full_name' },
];

export const FieldNavigationPanel = ({ formData, updateField, currentFieldIndex, setCurrentFieldIndex }: Props) => {
  const fieldRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null)[]>([]);
  const { toast } = useToast();

  // Fetch personal info from vault
  const { data: personalInfo } = useQuery({
    queryKey: ['personal-info'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching personal info:', error);
        return null;
      }
      
      return data;
    },
  });

  useEffect(() => {
    // Focus the current field when index changes
    const currentRef = fieldRefs.current[currentFieldIndex];
    if (currentRef) {
      currentRef.focus();
      currentRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentFieldIndex]);

  const copyFromVault = (config: FieldConfig) => {
    if (!config.vaultField || !personalInfo) return;
    
    const vaultValue = personalInfo[config.vaultField as keyof typeof personalInfo];
    if (vaultValue) {
      updateField(config.field, vaultValue);
      toast({
        title: "Copied from vault",
        description: `${config.label} filled with saved data`,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab - go to previous field
        setCurrentFieldIndex(Math.max(0, index - 1));
      } else {
        // Tab - go to next field
        setCurrentFieldIndex(Math.min(FIELD_CONFIG.length - 1, index + 1));
      }
    }
  };

  const goToNextField = () => {
    setCurrentFieldIndex(Math.min(FIELD_CONFIG.length - 1, currentFieldIndex + 1));
  };

  const goToPrevField = () => {
    setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));
  };

  return (
    <Card className="h-full border-2 shadow-medium flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Form Fields</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Use Tab to navigate • {currentFieldIndex + 1} of {FIELD_CONFIG.length}
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={goToPrevField}
            disabled={currentFieldIndex === 0}
            className="flex-1"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={goToNextField}
            disabled={currentFieldIndex === FIELD_CONFIG.length - 1}
            className="flex-1"
          >
            Next
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {FIELD_CONFIG.map((config, index) => {
            const isActive = index === currentFieldIndex;
            
            return (
              <div
                key={config.field}
                className={`space-y-2 p-3 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-transparent hover:border-muted'
                }`}
                onClick={() => setCurrentFieldIndex(index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <Label 
                    htmlFor={config.field} 
                    className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {index + 1}. {config.label}
                  </Label>
                  <div className="flex items-center gap-2">
                    {config.vaultField && personalInfo && personalInfo[config.vaultField as keyof typeof personalInfo] && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyFromVault(config);
                        }}
                        className="h-6 px-2 text-xs gap-1"
                        title="Copy from vault"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    )}
                    {isActive && (
                      <span className="text-xs font-semibold text-primary">Active</span>
                    )}
                  </div>
                </div>
                
                {/* Show vault data preview if available */}
                {config.vaultField && personalInfo && personalInfo[config.vaultField as keyof typeof personalInfo] && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 font-mono truncate">
                    Saved: {personalInfo[config.vaultField as keyof typeof personalInfo]}
                  </div>
                )}

                {config.type === 'input' && (
                  <Input
                    id={config.field}
                    ref={el => fieldRefs.current[index] = el}
                    value={formData[config.field] as string || ''}
                    onChange={(e) => updateField(config.field, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={() => setCurrentFieldIndex(index)}
                    placeholder={config.placeholder}
                    className="h-9 text-sm"
                    maxLength={config.field === 'state' ? 2 : undefined}
                  />
                )}

                {config.type === 'textarea' && (
                  <Textarea
                    id={config.field}
                    ref={el => fieldRefs.current[index] = el as HTMLTextAreaElement}
                    value={formData[config.field] as string || ''}
                    onChange={(e) => updateField(config.field, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={() => setCurrentFieldIndex(index)}
                    placeholder={config.placeholder}
                    className="min-h-[100px] text-sm resize-none"
                  />
                )}

                {config.type === 'checkbox' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={config.field}
                      ref={el => fieldRefs.current[index] = el as unknown as HTMLButtonElement}
                      checked={!!formData[config.field]}
                      onCheckedChange={(checked) => updateField(config.field, checked as boolean)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={() => setCurrentFieldIndex(index)}
                    />
                    <label 
                      htmlFor={config.field} 
                      className="text-sm cursor-pointer"
                    >
                      {config.label}
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};
