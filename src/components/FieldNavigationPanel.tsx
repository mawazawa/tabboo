import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, Move, Search, X } from "lucide-react";
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
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const activeFieldRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const positionInputRef = useRef<HTMLInputElement>(null);
  const [showPositionControl, setShowPositionControl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  // Filter fields based on search query
  const filteredFields = FIELD_CONFIG.filter(config => 
    config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Smooth scroll to active field within ScrollArea viewport only
  useEffect(() => {
    if (activeFieldRef.current && scrollViewportRef.current) {
      const fieldElement = activeFieldRef.current;
      const viewportElement = scrollViewportRef.current;
      
      // Find the actual scrollable viewport (ScrollArea renders a viewport inside)
      const scrollableViewport = viewportElement.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || viewportElement;
      
      // Get the field's position relative to the scrollable container
      const fieldRect = fieldElement.getBoundingClientRect();
      const viewportRect = scrollableViewport.getBoundingClientRect();
      
      // Calculate the scroll position to center the field
      const fieldCenter = fieldRect.top + fieldRect.height / 2;
      const viewportCenter = viewportRect.top + viewportRect.height / 2;
      const scrollOffset = fieldCenter - viewportCenter;
      
      // Smooth scroll within the viewport only
      scrollableViewport.scrollBy({
        top: scrollOffset,
        behavior: 'smooth'
      });
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
      
      // Cmd/Ctrl+F to toggle search
      if (modKey && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
        // Focus search input after a brief delay
        setTimeout(() => searchInputRef.current?.focus(), 100);
        return;
      }

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

      // Escape to close controls
      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery('');
        } else if (showPositionControl) {
          setShowPositionControl(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFieldIndex, fieldPositions, showPositionControl, showSearch]);

  return (
    <Card className="h-full border-hairline shadow-3point chamfered flex flex-col overflow-hidden">
      {/* Sticky Header - Fixed Interaction Surface */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-sm">Form Field Controls</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Field {currentFieldIndex + 1} of {FIELD_CONFIG.length}
                {searchQuery && ` • ${filteredFields.length} results`}
              </p>
              <div className="text-[10px] text-muted-foreground mt-2 space-y-0.5">
                <div>⌘F • Search fields</div>
                <div>⌘K • Toggle positioning</div>
                <div>Tab • Next field</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowSearch(!showSearch);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="h-8 w-8 p-0 shrink-0"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Glassmorphic Search Bar */}
          {showSearch && (
            <div className="relative animate-in slide-in-from-top-2 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl blur-xl" />
              <div className="relative bg-background/60 backdrop-blur-2xl border border-border/30 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-0 text-sm placeholder:text-muted-foreground/60"
                  />
                  {searchQuery && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSearchQuery('')}
                      className="h-6 w-6 p-0 shrink-0 hover:bg-muted/50"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

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
      </div>

      {/* Scrollable Content Area - Independent Scroll Container */}
      <div 
        ref={scrollViewportRef}
        className="flex-1 relative overflow-hidden"
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
          {filteredFields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">No fields found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredFields.map((config) => {
              const originalIndex = FIELD_CONFIG.findIndex(f => f.field === config.field);
              const isActive = originalIndex === currentFieldIndex;
              
              return (
                <div
                  key={config.field}
                  ref={isActive ? activeFieldRef : null}
                  className={`relative space-y-2 p-4 rounded-lg border-hairline transition-all duration-300 shadow-3point chamfered spring-hover ${
                    isActive 
                      ? 'border-primary bg-primary/5 shadow-3point-hover scale-[1.02]' 
                      : 'border-transparent hover:border-muted'
                  }`}
                  onClick={() => setCurrentFieldIndex(originalIndex)}
                >
                  {/* Visual Highlighter Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-l-lg animate-pulse" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Label 
                      htmlFor={config.field} 
                      className={`text-xs font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {originalIndex + 1}. {config.label}
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
                        <span className="text-xs font-semibold text-primary px-2 py-1 rounded-md bg-primary/10 animate-in fade-in duration-200">Active</span>
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
                      ref={el => fieldRefs.current[originalIndex] = el}
                      value={formData[config.field] as string || ''}
                      onChange={(e) => updateField(config.field, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex)}
                      onFocus={() => setCurrentFieldIndex(originalIndex)}
                      placeholder={config.placeholder}
                      className="h-12 text-base border-hairline shadow-3point chamfered transition-all duration-200"
                      maxLength={config.field === 'state' ? 2 : undefined}
                    />
                  )}

                  {config.type === 'textarea' && (
                    <Textarea
                      id={config.field}
                      ref={el => fieldRefs.current[originalIndex] = el as HTMLTextAreaElement}
                      value={formData[config.field] as string || ''}
                      onChange={(e) => updateField(config.field, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex)}
                      onFocus={() => setCurrentFieldIndex(originalIndex)}
                      placeholder={config.placeholder}
                      className="min-h-[100px] text-sm resize-none transition-all duration-200"
                    />
                  )}

                  {config.type === 'checkbox' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={config.field}
                        ref={el => fieldRefs.current[originalIndex] = el as unknown as HTMLButtonElement}
                        checked={!!formData[config.field]}
                        onCheckedChange={(checked) => updateField(config.field, checked as boolean)}
                        onKeyDown={(e) => handleKeyDown(e, originalIndex)}
                        onFocus={() => setCurrentFieldIndex(originalIndex)}
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
            })
          )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
