import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, Move } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const positionInputRef = useRef<HTMLInputElement>(null);
  const [showPositionControl, setShowPositionControl] = useState(false);

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
    // Smooth scroll to current field when index changes
    const currentRef = fieldRefs.current[currentFieldIndex];
    if (currentRef && scrollContainerRef.current) {
      currentRef.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      // Focus after a brief delay to ensure scroll completes
      setTimeout(() => currentRef.focus(), 150);
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

  const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right', fieldName?: string) => {
    const targetField = fieldName || currentFieldName;
    const position = fieldPositions[targetField] || getDefaultPosition(targetField);
    const step = 0.1;
    const newPosition = { ...position };
    
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
    
    updateFieldPosition(targetField, newPosition);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Cmd/Ctrl+K to toggle positioning control
      if (modKey && e.key === 'k') {
        e.preventDefault();
        setShowPositionControl(prev => !prev);
        return;
      }

      // Tab to move to next field, Shift+Tab to move to previous field
      if (e.key === 'Tab' && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        if (e.shiftKey) {
          setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));
        } else {
          setCurrentFieldIndex(Math.min(FIELD_CONFIG.length - 1, currentFieldIndex + 1));
        }
        return;
      }

      // Arrow keys for positioning (when not typing in input/textarea)
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

      // Escape to close positioning control
      if (e.key === 'Escape') {
        setShowPositionControl(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFieldIndex, fieldPositions, showPositionControl]);

  return (
    <Card className="h-full border-hairline shadow-3point chamfered flex flex-col">
      <div className="p-4 border-b-hairline bg-muted/30 space-y-3">
        <div>
          <h2 className="font-semibold text-sm">Form Field Controls</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Field {currentFieldIndex + 1} of {FIELD_CONFIG.length}
          </p>
          <div className="text-[10px] text-muted-foreground mt-2 space-y-0.5">
            <div>⌘K • Toggle positioning</div>
            <div>Tab • Next field</div>
            <div>Arrows • Adjust position</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            onClick={goToPrevField}
            disabled={currentFieldIndex === 0}
            className="flex-1 shadow-3point chamfered spring-hover border-hairline"
          >
            <ChevronUp className="h-5 w-5 mr-1" strokeWidth={0.5} />
            Previous
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={goToNextField}
            disabled={currentFieldIndex === FIELD_CONFIG.length - 1}
            className="flex-1 shadow-3point chamfered spring-hover border-hairline"
          >
            Next
            <ChevronDown className="h-5 w-5 ml-1" strokeWidth={0.5} />
          </Button>
        </div>

        {/* Unified Positioning Control */}
        {currentFieldIndex >= 0 && currentFieldIndex < FIELD_CONFIG.length && (
          <div className="p-3 bg-background rounded-lg border-hairline shadow-3point chamfered">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">
                {FIELD_CONFIG[currentFieldIndex]?.label}
              </h3>
              <Popover open={showPositionControl} onOpenChange={setShowPositionControl}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 gap-2 shadow-3point chamfered spring-hover"
                  >
                    <Move className="h-4 w-4" strokeWidth={0.5} />
                    Adjust
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4 shadow-3point chamfered border-hairline" side="left" align="start">
                  <h4 className="text-sm font-semibold mb-3">Position Adjustment</h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground">X %</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={currentPosition.left.toFixed(1)}
                        onChange={(e) => updateFieldPosition(currentFieldName, { 
                          ...currentPosition, 
                          left: parseFloat(e.target.value) || 0 
                        })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Y %</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={currentPosition.top.toFixed(1)}
                        onChange={(e) => updateFieldPosition(currentFieldName, { 
                          ...currentPosition, 
                          top: parseFloat(e.target.value) || 0 
                        })}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustPosition('up')}
                      className="h-7 px-1"
                    >
                      <ChevronUp className="h-3 w-3" strokeWidth={0.5} />
                    </Button>
                    <div></div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustPosition('left')}
                      className="h-7 px-1"
                    >
                      <ChevronLeft className="h-3 w-3" strokeWidth={0.5} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustPosition('down')}
                      className="h-7 px-1"
                    >
                      <ChevronDown className="h-3 w-3" strokeWidth={0.5} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustPosition('right')}
                      className="h-7 px-1"
                    >
                      <ChevronRight className="h-3 w-3" strokeWidth={0.5} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Use arrow keys or buttons to fine-tune position
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="text-xs text-muted-foreground">
              Position: X {currentPosition.left.toFixed(1)}% • Y {currentPosition.top.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollContainerRef} className="p-4 space-y-3">
          {FIELD_CONFIG.map((config, index) => {
            const isActive = index === currentFieldIndex;
            
            return (
              <div
                key={config.field}
                className={`space-y-2 p-4 rounded-lg border-hairline transition-all shadow-3point chamfered spring-hover ${
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-3point-hover' 
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
                        className="h-8 px-3 text-xs gap-1 shadow-3point chamfered spring-hover"
                        title="Copy from vault"
                      >
                        <Copy className="h-4 w-4" strokeWidth={0.5} />
                      </Button>
                    )}
                    {isActive && (
                      <span className="text-xs font-semibold text-primary px-2 py-1 rounded-md bg-primary/10">Active</span>
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
                    className="h-12 text-base border-hairline shadow-3point chamfered"
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
