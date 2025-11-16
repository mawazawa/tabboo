import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, Move, Search, X, AlertCircle, Settings, Package } from "@/icons";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ValidationRuleEditor } from "./ValidationRuleEditor";
import { FieldPresetsToolbar } from "./FieldPresetsToolbar";
import { FieldSearchBar } from "./FieldSearchBar";
import { FieldGroupManager } from "./FieldGroupManager";
import { TemplateManager } from "./TemplateManager";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FormData, FieldConfig, FieldPosition, ValidationRules, ValidationErrors } from "@/types/FormData";

interface Template {
  name: string;
  formData: FormData;
  fieldPositions: Record<string, FieldPosition>;
}

interface Props {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  fieldPositions: Record<string, FieldPosition>;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  selectedFields: string[];
  setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
  onSnapToGrid: (gridSize: number) => void;
  onAlignHorizontal: (alignment: 'left' | 'center' | 'right') => void;
  onAlignVertical: (alignment: 'top' | 'middle' | 'bottom') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onCopyPositions: () => void;
  onPastePositions: () => void;
  onTransformPositions: (transformation: { offsetX?: number; offsetY?: number; scale?: number }) => void;
  hasCopiedPositions: boolean;
  onFieldHover?: (fieldName: string | null) => void;
  validationRules?: ValidationRules;
  validationErrors?: ValidationErrors;
  onSaveValidationRules?: (fieldName: string, rules: ValidationRules[string]) => void;
  settingsSheetOpen: boolean;
  onSettingsSheetChange: (open: boolean) => void;
  onApplyTemplate: (template: Template) => void;
  onApplyGroup: (groupPositions: Record<string, FieldPosition>) => void;
}

const FIELD_CONFIG: FieldConfig[] = [
  // HEADER - Party/Attorney Information
  { field: 'partyName', label: 'Name', type: 'input', placeholder: 'Full name', vaultField: 'full_name' },
  { field: 'firmName', label: 'Firm Name', type: 'input', placeholder: 'Law firm name' },
  { field: 'streetAddress', label: 'Street Address', type: 'input', placeholder: 'Street address', vaultField: 'street_address' },
  { field: 'mailingAddress', label: 'Mailing Address', type: 'input', placeholder: 'P.O. Box or mailing address' },
  { field: 'city', label: 'City', type: 'input', placeholder: 'City', vaultField: 'city' },
  { field: 'state', label: 'State', type: 'input', placeholder: 'CA', vaultField: 'state' },
  { field: 'zipCode', label: 'ZIP Code', type: 'input', placeholder: 'ZIP code', vaultField: 'zip_code' },
  { field: 'telephoneNo', label: 'Telephone', type: 'input', placeholder: 'Phone number', vaultField: 'telephone_no' },
  { field: 'faxNo', label: 'Fax', type: 'input', placeholder: 'Fax number', vaultField: 'fax_no' },
  { field: 'email', label: 'Email', type: 'input', placeholder: 'Email address', vaultField: 'email_address' },
  { field: 'attorneyFor', label: 'Attorney For', type: 'input', placeholder: 'Self-Represented or attorney name', vaultField: 'attorney_name' },
  { field: 'stateBarNumber', label: 'State Bar Number', type: 'input', placeholder: 'State bar number' },

  // HEADER - Court Information
  { field: 'county', label: 'County', type: 'input', placeholder: 'County' },
  { field: 'courtStreetAddress', label: 'Court Street Address', type: 'input', placeholder: 'Court street address' },
  { field: 'courtMailingAddress', label: 'Court Mailing Address', type: 'input', placeholder: 'Court mailing address' },
  { field: 'courtCityAndZip', label: 'Court City and ZIP', type: 'input', placeholder: 'City and ZIP code' },
  { field: 'branchName', label: 'Branch Name', type: 'input', placeholder: 'Court branch name' },

  // HEADER - Case Information
  { field: 'petitioner', label: 'Petitioner', type: 'input', placeholder: 'Petitioner name' },
  { field: 'respondent', label: 'Respondent', type: 'input', placeholder: 'Respondent name' },
  { field: 'otherParentParty', label: 'Other Parent/Party', type: 'input', placeholder: 'Third party name' },
  { field: 'caseNumber', label: 'Case Number', type: 'input', placeholder: 'Case number' },

  // HEADER - Hearing Information
  { field: 'hearingDate', label: 'Hearing Date', type: 'input', placeholder: 'MM/DD/YYYY' },
  { field: 'hearingTime', label: 'Hearing Time', type: 'input', placeholder: 'HH:MM AM/PM' },
  { field: 'hearingDepartment', label: 'Department', type: 'input', placeholder: 'Department' },
  { field: 'hearingRoom', label: 'Room', type: 'input', placeholder: 'Room number' },

  // ITEM 1: Restraining Order Information
  { field: 'restrainingOrderNone', label: 'No restraining orders', type: 'checkbox' },
  { field: 'restrainingOrderActive', label: 'Restraining orders active', type: 'checkbox' },

  // ITEM 2: Child Custody/Visitation
  { field: 'childCustodyConsent', label: 'Consent to child custody', type: 'checkbox' },
  { field: 'visitationConsent', label: 'Consent to visitation', type: 'checkbox' },
  { field: 'childCustodyDoNotConsent', label: 'Do not consent to custody', type: 'checkbox' },
  { field: 'visitationDoNotConsent', label: 'Do not consent to visitation', type: 'checkbox' },
  { field: 'custodyAlternativeOrder', label: 'Alternative custody order', type: 'input', placeholder: 'Describe alternative order' },

  // ITEM 3: Child Support
  { field: 'childSupportFiledFL150', label: 'Filed FL-150 (child support)', type: 'checkbox' },
  { field: 'childSupportConsent', label: 'Consent to child support', type: 'checkbox' },
  { field: 'childSupportGuidelineConsent', label: 'Consent to guideline support', type: 'checkbox' },
  { field: 'childSupportDoNotConsent', label: 'Do not consent to child support', type: 'checkbox' },
  { field: 'childSupportAlternativeOrder', label: 'Alternative child support order', type: 'input', placeholder: 'Describe alternative order' },

  // ITEM 4: Spousal Support
  { field: 'spousalSupportFiledFL150', label: 'Filed FL-150 (spousal support)', type: 'checkbox' },
  { field: 'spousalSupportConsent', label: 'Consent to spousal support', type: 'checkbox' },
  { field: 'spousalSupportDoNotConsent', label: 'Do not consent to spousal support', type: 'checkbox' },
  { field: 'spousalSupportAlternativeOrder', label: 'Alternative spousal support order', type: 'input', placeholder: 'Describe alternative order' },

  // ITEM 5: Property Control
  { field: 'propertyControlConsent', label: 'Consent to property control', type: 'checkbox' },
  { field: 'propertyControlDoNotConsent', label: 'Do not consent to property control', type: 'checkbox' },
  { field: 'propertyControlAlternativeOrder', label: 'Alternative property order', type: 'input', placeholder: 'Describe alternative order' },

  // ITEM 6: Attorney's Fees and Costs
  { field: 'attorneyFeesFiledFL150', label: 'Filed FL-150 (attorney fees)', type: 'checkbox' },
  { field: 'attorneyFeesFiledFL158', label: 'Filed FL-158', type: 'checkbox' },
  { field: 'attorneyFeesConsent', label: 'Consent to attorney fees', type: 'checkbox' },
  { field: 'attorneyFeesDoNotConsent', label: 'Do not consent to attorney fees', type: 'checkbox' },
  { field: 'attorneyFeesAlternativeOrder', label: 'Alternative fees order', type: 'input', placeholder: 'Describe alternative order' },

  // ITEM 7: Domestic Violence Order
  { field: 'domesticViolenceConsent', label: 'Consent to DV order', type: 'checkbox' },
  { field: 'domesticViolenceDoNotConsent', label: 'Do not consent to DV order', type: 'checkbox' },
  { field: 'domesticViolenceAlternativeOrder', label: 'Alternative DV order', type: 'input', placeholder: 'Describe alternative order' },

  // ITEM 8: Other Orders Requested
  { field: 'otherOrdersConsent', label: 'Consent to other orders', type: 'checkbox' },
  { field: 'otherOrdersDoNotConsent', label: 'Do not consent to other orders', type: 'checkbox' },
  { field: 'otherOrdersAlternativeOrder', label: 'Other orders description', type: 'input', placeholder: 'Specify other orders' },

  // ITEM 9: Time for Service
  { field: 'timeForServiceConsent', label: 'Consent to service time', type: 'checkbox' },
  { field: 'timeForServiceDoNotConsent', label: 'Do not consent to service time', type: 'checkbox' },
  { field: 'timeForServiceAlternativeOrder', label: 'Alternative service time', type: 'input', placeholder: 'Describe alternative' },

  // ITEM 10: Facts to Support
  { field: 'facts', label: 'Facts to Support', type: 'textarea', placeholder: 'Enter facts (max 10 pages)' },
  { field: 'factsAttachment', label: 'Attachment 10 included', type: 'checkbox' },

  // SIGNATURE SECTION
  { field: 'declarationUnderPenalty', label: 'Declaration under penalty of perjury', type: 'checkbox' },
  { field: 'signatureDate', label: 'Date', type: 'input', placeholder: 'MM/DD/YYYY' },
  { field: 'printName', label: 'Type or Print Name', type: 'input', placeholder: 'Print your name', vaultField: 'full_name' },
  { field: 'signatureName', label: 'Signature of Declarant', type: 'input', placeholder: 'Sign your name', vaultField: 'full_name' },
];

export const FieldNavigationPanel = ({ 
  formData, 
  updateField, 
  currentFieldIndex, 
  setCurrentFieldIndex, 
  fieldPositions, 
  updateFieldPosition,
  selectedFields,
  setSelectedFields,
  onSnapToGrid,
  onAlignHorizontal,
  onAlignVertical,
  onDistribute,
  onCopyPositions,
  onPastePositions,
  onTransformPositions,
  hasCopiedPositions,
  onFieldHover,
  validationRules = {},
  validationErrors = {},
  onSaveValidationRules,
  settingsSheetOpen,
  onSettingsSheetChange,
  onApplyTemplate,
  onApplyGroup,
}: Props) => {
  const fieldRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null)[]>([]);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const activeFieldRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const positionInputRef = useRef<HTMLInputElement>(null);
  const [showPositionControl, setShowPositionControl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);

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
        // Error occurred fetching personal info (silently handled)
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
      // Attorney/Party Information
      partyName: { top: 15.8, left: 5 },
      streetAddress: { top: 19, left: 5 },
      city: { top: 22.5, left: 5 },
      state: { top: 22.5, left: 29.5 },
      zipCode: { top: 22.5, left: 38 },
      telephoneNo: { top: 25.8, left: 5 },
      faxNo: { top: 25.8, left: 23 },
      email: { top: 29.2, left: 5 },
      attorneyFor: { top: 32.5, left: 5 },
      attorneyBarNumber: { top: 32.5, left: 42 },

      // Case Information
      county: { top: 15.8, left: 55 },
      petitioner: { top: 22.5, left: 55 },
      respondent: { top: 26.5, left: 55 },
      caseNumber: { top: 32.5, left: 55 },

      // Hearing Information
      hearingDate: { top: 38, left: 20 },
      hearingTime: { top: 38, left: 37 },
      hearingDepartment: { top: 38, left: 51 },
      hearingRoom: { top: 38, left: 63 },

      // Child Information
      child1Name: { top: 41.5, left: 20 },
      child1BirthDate: { top: 41.5, left: 57 },
      child2Name: { top: 44.5, left: 20 },
      child2BirthDate: { top: 44.5, left: 57 },
      child3Name: { top: 47.5, left: 20 },
      child3BirthDate: { top: 47.5, left: 57 },

      // Order Types
      orderChildCustody: { top: 51, left: 5 },
      orderVisitation: { top: 54, left: 5 },
      orderChildSupport: { top: 57, left: 5 },
      orderSpousalSupport: { top: 60, left: 5 },
      orderAttorneyFees: { top: 63, left: 5 },
      orderPropertyControl: { top: 66, left: 5 },
      orderOther: { top: 69, left: 5 },
      orderOtherText: { top: 69, left: 25 },

      // Response Type
      noOrders: { top: 72.5, left: 5 },
      agreeOrders: { top: 75.5, left: 5 },
      consentCustody: { top: 78.5, left: 5 },
      consentVisitation: { top: 81.5, left: 5 },

      // Facts and Declaration
      facts: { top: 85, left: 5 },
      declarationUnderPenalty: { top: 93.5, left: 5 },

      // Signature
      signatureDate: { top: 96, left: 5 },
      signatureName: { top: 96, left: 30 },
      printName: { top: 96, left: 65 },
    };
    return defaults[field] || { top: 0, left: 0 };
  };

  const currentFieldName = FIELD_CONFIG[currentFieldIndex]?.field;
  const currentPosition = fieldPositions[currentFieldName] || getDefaultPosition(currentFieldName);

  /**
   * Adjust field position by moving it in the specified direction
   *
   * @param direction - Direction to move the field
   *   - 'up': Decrease Y coordinate (move field UP on PDF)
   *   - 'down': Increase Y coordinate (move field DOWN on PDF)
   *   - 'left': Decrease X coordinate (move field LEFT on PDF)
   *   - 'right': Increase X coordinate (move field RIGHT on PDF)
   * @param fieldName - Optional field name, defaults to current field
   */
  const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right', fieldName?: string) => {
    const targetField = fieldName || currentFieldName;
    const position = fieldPositions[targetField] || getDefaultPosition(targetField);
    const step = 1.0; // Step size in percentage points (1.0 = 1%)
    const newPosition = { ...position };

    switch (direction) {
      case 'up':
        // Move UP on PDF = decrease top position (Y coordinate)
        newPosition.top = Math.max(0, newPosition.top - step);
        break;
      case 'down':
        // Move DOWN on PDF = increase top position (Y coordinate)
        newPosition.top = Math.min(100, newPosition.top + step);
        break;
      case 'left':
        // Move LEFT on PDF = decrease left position (X coordinate)
        newPosition.left = Math.max(0, newPosition.left - step);
        break;
      case 'right':
        // Move RIGHT on PDF = increase left position (X coordinate)
        newPosition.left = Math.min(100, newPosition.left + step);
        break;
    }

    updateFieldPosition(targetField, newPosition);
  };

  // Track pressed arrow keys for visual feedback
  const [pressedKey, setPressedKey] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  // Handle keyboard shortcuts with optimized performance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Cmd/Ctrl+F to toggle search
      if (modKey && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
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

      // Arrow keys for positioning - work when a field is selected, unless actively typing
      const activeElement = document.activeElement as HTMLElement;
      const isActivelyTyping = activeElement && 
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
        activeElement.classList.contains('field-input'); // Only block if it's a form field input
      
      if (!isActivelyTyping && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        }[e.key] as 'up' | 'down' | 'left' | 'right';
        
        // Immediate visual feedback with requestAnimationFrame for optimal performance
        requestAnimationFrame(() => {
          setPressedKey(direction);
        });
        adjustPosition(direction);
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

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Immediate clear with requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
          setPressedKey(null);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentFieldIndex, showPositionControl, showSearch]);

  return (
    <Card className="h-full border-hairline shadow-3point chamfered flex flex-col overflow-hidden">
      {/* Compact Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">Field {currentFieldIndex + 1}/{FIELD_CONFIG.length}</h2>
              {searchQuery && (
                <p className="text-xs text-muted-foreground truncate">{filteredFields.length} results</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors px-1.5 py-0.5"
                onClick={() => setShowAISearch(!showAISearch)}
              >
                <Search className="h-3 w-3" strokeWidth={1.5} />
              </Badge>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors px-1.5 py-0.5">
                    <Package className="h-3 w-3" strokeWidth={1.5} />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-[min(500px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)]" align="end" side="left">
                  <FieldGroupManager
                    selectedFields={selectedFields}
                    fieldPositions={fieldPositions}
                    onApplyGroup={onApplyGroup}
                    triggerless={true}
                  />
                </PopoverContent>
              </Popover>

              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors px-1.5 py-0.5"
                onClick={() => onSettingsSheetChange(true)}
              >
                <Settings className="h-3 w-3" strokeWidth={1.5} />
              </Badge>
            </div>
          </div>

          <Sheet open={settingsSheetOpen} onOpenChange={onSettingsSheetChange}>
            <SheetContent side="right" className="w-[min(540px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)]">
              <SheetHeader>
                <SheetTitle>Form Settings</SheetTitle>
                <SheetDescription>Manage templates and form configurations</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <TemplateManager
                  currentFormId="FL-320"
                  currentFormName="Response to Request for Restraining Orders"
                  currentFieldPositions={fieldPositions}
                  onApplyTemplate={onApplyTemplate}
                  triggerless={true}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Compact Search Bars */}
          {showAISearch && (
            <FieldSearchBar 
              onFieldSearch={(query) => setSearchQuery(query)}
              onAIQuery={(query) => {
                toast({ title: "AI Query Sent", description: query });
                setShowAISearch(false);
              }}
              placeholder="Ask AI or search fields..."
            />
          )}

          {showSearch && (
            <div className="relative bg-background/60 backdrop-blur-2xl border border-border/30 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-7 px-0 text-sm"
                />
                {searchQuery && (
                  <Button size="sm" variant="ghost" onClick={() => setSearchQuery('')} className="h-5 w-5 p-0">
                    <X className="h-3 w-3" strokeWidth={2} />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Compact Navigation */}
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={goToPrevField}
              disabled={currentFieldIndex === 0}
              className="h-8 gap-1"
            >
              <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-xs">Prev</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={goToNextField}
              disabled={currentFieldIndex === FIELD_CONFIG.length - 1}
              className="h-8 gap-1"
            >
              <span className="text-xs">Next</span>
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div ref={scrollViewportRef} className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {/* Toolbar Section - Now in scrollable area */}
            <div className="space-y-2 pb-2 border-b border-border/50">
              <FieldPresetsToolbar
                selectedFields={selectedFields}
                onSnapToGrid={onSnapToGrid}
                onAlignHorizontal={onAlignHorizontal}
                onAlignVertical={onAlignVertical}
                onDistribute={onDistribute}
                onCopyPositions={onCopyPositions}
                onPastePositions={onPastePositions}
                onTransformPositions={onTransformPositions}
                hasCopiedPositions={hasCopiedPositions}
              />

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFields(FIELD_CONFIG.map(c => c.field))}
                  className="flex-1 text-xs h-7"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFields([])}
                  className="flex-1 text-xs h-7"
                  disabled={selectedFields.length === 0}
                >
                  Clear ({selectedFields.length})
                </Button>
              </div>

              {/* Active Field Control - Compact */}
              {currentFieldIndex >= 0 && currentFieldIndex < FIELD_CONFIG.length && (
                <div className="p-2 bg-muted/30 rounded-lg border space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold truncate">
                      {FIELD_CONFIG[currentFieldIndex]?.label}
                      {selectedFields.length > 0 && (
                        <span className="ml-1 text-[10px] text-muted-foreground">({selectedFields.length})</span>
                      )}
                    </h3>
                    <Popover open={showPositionControl} onOpenChange={setShowPositionControl}>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7 px-2 gap-1">
                          <Move className="h-3 w-3" strokeWidth={1.5} />
                          <span className="text-xs">Adjust</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[min(224px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-4" side="left" align="start">
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
                    {/* Arrow key controls in intuitive cross/diamond pattern */}
                    <div className="grid grid-cols-3 gap-1">
                      {/* Row 1: Up button centered */}
                      <div></div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustPosition('up')}
                        className={`h-8 px-2 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                          pressedKey === 'up' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                        }`}
                        title="Move field UP (↑)"
                      >
                        <ChevronUp className="h-4 w-4" strokeWidth={2} />
                      </Button>
                      <div></div>

                      {/* Row 2: Left and Right buttons */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustPosition('left')}
                        className={`h-8 px-2 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                          pressedKey === 'left' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                        }`}
                        title="Move field LEFT (←)"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                      </Button>
                      <div className="flex items-center justify-center text-xs text-muted-foreground">
                        {/* Center indicator showing this is a directional pad */}
                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustPosition('right')}
                        className={`h-8 px-2 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                          pressedKey === 'right' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                        }`}
                        title="Move field RIGHT (→)"
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={2} />
                      </Button>

                      {/* Row 3: Down button centered */}
                      <div></div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustPosition('down')}
                        className={`h-8 px-2 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                          pressedKey === 'down' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                        }`}
                        title="Move field DOWN (↓)"
                      >
                        <ChevronDown className="h-4 w-4" strokeWidth={2} />
                      </Button>
                      <div></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Use arrow keys or buttons to fine-tune position
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Quick Edit Input */}
              {FIELD_CONFIG[currentFieldIndex]?.type === 'input' && (
                <Input
                  value={formData[currentFieldName] as string || ''}
                  onChange={(e) => updateField(currentFieldName, e.target.value)}
                  placeholder={FIELD_CONFIG[currentFieldIndex]?.placeholder}
                  className="h-9 text-sm"
                />
              )}
              
              {FIELD_CONFIG[currentFieldIndex]?.type === 'textarea' && (
                <Textarea
                  value={formData[currentFieldName] as string || ''}
                  onChange={(e) => updateField(currentFieldName, e.target.value)}
                  placeholder={FIELD_CONFIG[currentFieldIndex]?.placeholder}
                  className="min-h-[60px] text-sm resize-none"
                />
              )}

              {FIELD_CONFIG[currentFieldIndex]?.type === 'checkbox' && (
                <div className="flex items-center space-x-2 py-1">
                  <Checkbox
                    checked={!!formData[currentFieldName]}
                    onCheckedChange={(checked) => updateField(currentFieldName, checked as boolean)}
                  />
                  <label className="text-sm">
                    {FIELD_CONFIG[currentFieldIndex]?.label}
                  </label>
                </div>
              )}
              
               <div className="text-xs text-muted-foreground">
                Position: X {currentPosition.left.toFixed(1)}% • Y {currentPosition.top.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

            {/* Field List */}
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
              const isSelected = selectedFields.includes(config.field);
              const fieldErrors = validationErrors[config.field] || [];
              const hasErrors = fieldErrors.length > 0;
              
              return (
                <div
                  key={config.field}
                  ref={isActive ? activeFieldRef : null}
                  className={`relative space-y-2 p-4 rounded-lg border transition-all duration-300 shadow-3point chamfered spring-hover cursor-pointer ${
                    isActive 
                      ? 'border-primary bg-primary/5 shadow-3point-hover scale-[1.02]' 
                      : isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-3point-hover'
                      : hasErrors
                      ? 'border-destructive bg-destructive/5'
                      : 'border-transparent hover:border-muted'
                  }`}
                  onClick={(e) => {
                    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                    const modKey = isMac ? e.metaKey : e.ctrlKey;
                    
                    if (modKey) {
                      // Multi-select mode
                      e.stopPropagation();
                      setSelectedFields(prev => 
                        prev.includes(config.field)
                          ? prev.filter(f => f !== config.field)
                          : [...prev, config.field]
                      );
                    } else {
                      // Normal navigation
                      setCurrentFieldIndex(originalIndex);
                    }
                  }}
                  onMouseEnter={() => onFieldHover?.(config.field)}
                  onMouseLeave={() => onFieldHover?.(null)}
                >
                  {/* Visual Highlighter Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-l-lg animate-pulse" />
                  )}
                  {/* Selection Indicator */}
                  {isSelected && !isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-500 to-blue-500/50 rounded-l-lg" />
                  )}
                  {/* Error Indicator */}
                  {hasErrors && !isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-destructive via-destructive to-destructive/50 rounded-l-lg" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Label 
                      htmlFor={config.field} 
                      className={`text-xs font-medium transition-colors duration-200 ${
                        isActive ? 'text-primary' : isSelected ? 'text-blue-600' : hasErrors ? 'text-destructive' : 'text-muted-foreground'
                      }`}
                    >
                      {originalIndex + 1}. {config.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      {onSaveValidationRules && (
                        <ValidationRuleEditor
                          fieldName={config.field}
                          currentRules={validationRules[config.field] || []}
                          onSave={onSaveValidationRules}
                          triggerless={false}
                        />
                      )}
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
                          <Copy className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      )}
                      {isActive && (
                        <span className="text-xs font-semibold text-primary px-2 py-1 rounded-md bg-primary/10 animate-in fade-in duration-200">Active</span>
                      )}
                      {isSelected && !isActive && (
                        <span className="text-xs font-semibold text-blue-600 px-2 py-1 rounded-md bg-blue-500/10 animate-in fade-in duration-200">Selected</span>
                      )}
                    </div>
                  </div>
                
                {/* Show vault data preview if available */}
                {config.vaultField && personalInfo && personalInfo[config.vaultField as keyof typeof personalInfo] && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 font-mono truncate">
                    Saved: {personalInfo[config.vaultField as keyof typeof personalInfo]}
                  </div>
                )}

                {/* Validation Errors */}
                {hasErrors && (
                  <div className="space-y-1">
                    {fieldErrors.map((error, idx) => (
                      <div key={idx} className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                  {config.type === 'input' && (
                    <Input
                      id={config.field}
                      ref={el => fieldRefs.current[originalIndex] = el}
                      value={formData[config.field] as string || ''}
                      onChange={(e) => updateField(config.field, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, originalIndex)}
                      onFocus={(e) => {
                        e.stopPropagation();
                        setCurrentFieldIndex(originalIndex);
                      }}
                      onClick={(e) => e.stopPropagation()}
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
                      onFocus={(e) => {
                        e.stopPropagation();
                        setCurrentFieldIndex(originalIndex);
                      }}
                      onClick={(e) => e.stopPropagation()}
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
