import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy } from "lucide-react";
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
  fieldPositions: Record<string, { top: number; left: number }>;
  updateFieldPosition: (field: string, position: { top: number; left: number }) => void;
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

export const FieldNavigationPanel = ({ formData, updateField, currentFieldIndex, setCurrentFieldIndex, fieldPositions, updateFieldPosition }: Props) => {
  const fieldRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null)[]>([]);
  const { toast } = useToast();
  const positionInputRef = useRef<HTMLInputElement>(null);

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

  // Get default position for a field
  const getDefaultPosition = (field: string) => {
    const defaults: Record<string, { top: number; left: number }> = {
      partyName: { top: 15.8, left: 5 },
      streetAddress: { top: 19, left: 5 },
      city: { top: 22.5, left: 5 },
      state: { top: 22.5, left: 29.5 },
      zipCode: { top: 22.5, left: 38 },
      telephoneNo: { top: 25.8, left: 5 },
      faxNo: { top: 25.8, left: 23 },
      email: { top: 29.2, left: 5 },
      attorneyFor: { top: 32.5, left: 5 },
      county: { top: 15.8, left: 55 },
      petitioner: { top: 22.5, left: 55 },
      respondent: { top: 26.5, left: 55 },
      caseNumber: { top: 32.5, left: 55 },
      noOrders: { top: 43.5, left: 25.5 },
      agreeOrders: { top: 46.5, left: 25.5 },
      consentCustody: { top: 53, left: 25.5 },
      consentVisitation: { top: 56, left: 25.5 },
      facts: { top: 68, left: 5 },
      signatureDate: { top: 90, left: 5 },
      signatureName: { top: 90, left: 50 },
    };
    return defaults[field] || { top: 0, left: 0 };
  };

  const currentFieldName = FIELD_CONFIG[currentFieldIndex]?.field;
  const currentPosition = fieldPositions[currentFieldName] || getDefaultPosition(currentFieldName);

  const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 0.1;
    const newPosition = { ...currentPosition };
    
    switch (direction) {
      case 'up':
        newPosition.top = Math.max(0, newPosition.top - step);
        break;
      case 'down':
        newPosition.top = Math.min(100, newPosition.top + step);
        break;
      case 'left':
        newPosition.left = Math.max(0, newPosition.left - step);
        break;
      case 'right':
        newPosition.left = Math.min(100, newPosition.left + step);
        break;
    }
    
    updateFieldPosition(currentFieldName, newPosition);
  };

  // Handle keyboard arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === positionInputRef.current ||
          !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const direction = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
          }[e.key] as 'up' | 'down' | 'left' | 'right';
          
          adjustPosition(direction);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFieldIndex, fieldPositions]);

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

        {/* Position Controls */}
        <div className="mt-4 p-3 bg-background rounded-lg border">
          <h3 className="text-xs font-semibold mb-2">Position</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-xs text-muted-foreground">X (Left %)</label>
              <Input
                ref={positionInputRef}
                type="number"
                step="0.1"
                value={currentPosition.left.toFixed(1)}
                onChange={(e) => updateFieldPosition(currentFieldName, { ...currentPosition, left: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Y (Top %)</label>
              <Input
                type="number"
                step="0.1"
                value={currentPosition.top.toFixed(1)}
                onChange={(e) => updateFieldPosition(currentFieldName, { ...currentPosition, top: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustPosition('up')}
              className="h-8 px-2"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <div></div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustPosition('left')}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustPosition('down')}
              className="h-8 px-2"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustPosition('right')}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use arrow keys or buttons
          </p>
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
