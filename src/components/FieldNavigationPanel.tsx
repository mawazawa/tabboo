import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Move, Search, X, Trash2, User, Scale, FileText, Calendar, Shield, Calculator, Package, Lock, MoreHorizontal, MessageSquare } from "@/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLiveRegion } from "@/hooks/use-live-region";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldPresetsToolbar } from "./FieldPresetsToolbar";
import { FieldSearchBar } from "./FieldSearchBar";
import { TemplateManager } from "./TemplateManager";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FieldNavigationHeader } from "./navigation/FieldNavigationHeader";
import { FieldNavigationItem } from "./navigation/FieldNavigationItem";
import { LiquidGlassAccordion } from "@/components/ui/liquid-glass-accordion";
import { LiquidSlider } from "@/components/ui/liquid-slider";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";
import { FL_320_FIELD_GROUPS, getGroupCompletionPercentage, getGroupCompletionBadge, getOverallFormCompletionPercentage, getOverallFormCompletionCount } from "@/config/field-groups";
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
  const { announce, LiveRegionComponent } = useLiveRegion({ clearAfter: 1500 });
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const activeFieldRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showPositionControl, setShowPositionControl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [pressedKey, setPressedKey] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

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

      if (error && error.code !== 'PGRST116') return null;
      return data;
    },
  });

  // Filter fields based on search query
  const filteredFields = FL_320_FIELD_CONFIG.filter(config =>
    config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Announce current field to screen readers
  useEffect(() => {
    const currentField = FL_320_FIELD_CONFIG[currentFieldIndex];
    if (currentField) {
      announce(`Field ${currentFieldIndex + 1} of ${FL_320_FIELD_CONFIG.length}: ${currentField.label}`);
    }
  }, [currentFieldIndex, announce]);

  // Smooth scroll to active field
  useEffect(() => {
    if (activeFieldRef.current && scrollViewportRef.current) {
      const fieldElement = activeFieldRef.current;
      const viewportElement = scrollViewportRef.current;
      const scrollableViewport = viewportElement.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || viewportElement;

      const fieldRect = fieldElement.getBoundingClientRect();
      const viewportRect = scrollableViewport.getBoundingClientRect();
      const fieldCenter = fieldRect.top + fieldRect.height / 2;
      const viewportCenter = viewportRect.top + viewportRect.height / 2;
      const scrollOffset = fieldCenter - viewportCenter;

      scrollableViewport.scrollBy({ top: scrollOffset, behavior: 'smooth' });
    }
  }, [currentFieldIndex]);

  const copyFromVault = useCallback((config: FieldConfig) => {
    if (!config.vaultField || !personalInfo) return;
    const vaultValue = personalInfo[config.vaultField as keyof typeof personalInfo];
    if (vaultValue) {
      updateField(config.field, vaultValue);
      toast({ title: "Copied from vault", description: `${config.label} filled with saved data` });
    }
  }, [personalInfo, updateField, toast]);

  const goToNextField = () => setCurrentFieldIndex(Math.min(FL_320_FIELD_CONFIG.length - 1, currentFieldIndex + 1));
  const goToPrevField = () => setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));

  const getDefaultPosition = (field: string): { top: number; left: number } => {
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
      // Add remaining default positions as needed
    };
    return defaults[field] || { top: 0, left: 0 };
  };

  const currentFieldName = FL_320_FIELD_CONFIG[currentFieldIndex]?.field;
  const currentPosition = fieldPositions[currentFieldName] || getDefaultPosition(currentFieldName);

  const adjustPosition = (direction: 'up' | 'down' | 'left' | 'right', fieldName?: string) => {
    const targetField = fieldName || currentFieldName;
    const position = fieldPositions[targetField] || getDefaultPosition(targetField);
    const step = 1.0;
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

  const adjustPositionCallback = useCallback(adjustPosition, [fieldPositions, updateFieldPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 100);
        return;
      }

      if (modKey && e.key === 'k') {
        e.preventDefault();
        setShowPositionControl(prev => !prev);
        return;
      }

      if (e.key === 'Tab' && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        if (e.shiftKey) {
          setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));
        } else {
          setCurrentFieldIndex(Math.min(FL_320_FIELD_CONFIG.length - 1, currentFieldIndex + 1));
        }
        return;
      }

      const activeElement = document.activeElement as HTMLElement;
      const isActivelyTyping = activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
        activeElement.classList.contains('field-input');

      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
      const shouldMoveField = isArrowKey && (e.altKey || !isActivelyTyping);

      if (shouldMoveField) {
        e.preventDefault();
        if (currentFieldIndex === -1 || !FL_320_FIELD_CONFIG[currentFieldIndex]) {
          setCurrentFieldIndex(0);
          return;
        }

        const direction = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        }[e.key] as 'up' | 'down' | 'left' | 'right';

        requestAnimationFrame(() => setPressedKey(direction));
        adjustPositionCallback(direction);
      }

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
        requestAnimationFrame(() => setPressedKey(null));
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentFieldIndex, showPositionControl, showSearch, adjustPositionCallback]);

  const handleClearFields = () => {
    if (confirm('Are you sure you want to clear all form fields? This action cannot be undone.')) {
      FL_320_FIELD_CONFIG.forEach(config => updateField(config.field, config.type === 'checkbox' ? false : ''));
      toast({ title: "Form cleared", description: "All form fields have been reset", variant: "default" });
    }
  };

  return (
    <Card className="h-full border shadow-sm flex flex-col overflow-hidden">
      <LiveRegionComponent />

      <FieldNavigationHeader
        currentFieldIndex={currentFieldIndex}
        totalFields={FL_320_FIELD_CONFIG.length}
        searchQuery={searchQuery}
        filteredFieldsCount={filteredFields.length}
        showAISearch={showAISearch}
        onSearchToggle={() => setShowAISearch(!showAISearch)}
        onSettingsOpen={() => onSettingsSheetChange(true)}
        onClearFields={handleClearFields}
        selectedFields={selectedFields}
        fieldPositions={fieldPositions}
        onApplyGroup={onApplyGroup}
      />

      <div className="px-2 py-1.5 space-y-1.5 border-b border-border/50">
        <Sheet open={settingsSheetOpen} onOpenChange={onSettingsSheetChange}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
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

        <div className="grid grid-cols-2 gap-1">
          <Button size="sm" variant="outline" onClick={goToPrevField} disabled={currentFieldIndex === 0} className="h-7 gap-0.5 text-xs">
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
            Prev
          </Button>
          <Button size="sm" variant="outline" onClick={goToNextField} disabled={currentFieldIndex === FL_320_FIELD_CONFIG.length - 1} className="h-7 gap-0.5 text-xs">
            Next
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Form Completion Progress Slider */}
        <div className="px-1 py-2">
          <LiquidSlider
            label="Form Completion"
            variant="progress"
            value={getOverallFormCompletionPercentage(formData)}
            disabled={true}
            showValue={true}
            valueText={(() => {
              const { completedFields, totalFields } = getOverallFormCompletionCount(formData);
              const percentage = getOverallFormCompletionPercentage(formData);
              return `${completedFields}/${totalFields} fields (${percentage}%)`;
            })()}
          />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFields}
              className="w-full h-6 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              Clear All
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Clear all form fields</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div ref={scrollViewportRef} className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 py-1.5 space-y-1.5">
            <div className="space-y-1 pb-1.5 border-b border-border/50">
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

              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setSelectedFields(FL_320_FIELD_CONFIG.map(c => c.field))} className="flex-1 text-xs h-6">
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedFields([])} className="flex-1 text-xs h-6" disabled={selectedFields.length === 0}>
                  Clear ({selectedFields.length})
                </Button>
              </div>

              {currentFieldIndex >= 0 && currentFieldIndex < FL_320_FIELD_CONFIG.length && (
                <div className="p-1.5 bg-muted/20 rounded-md border border-border/50 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold truncate">
                      {FL_320_FIELD_CONFIG[currentFieldIndex]?.label}
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
                      <PopoverContent className="w-56 p-2" side="left" align="start">
                        <h4 className="text-xs font-medium mb-2">Position Adjustment</h4>
                        <div className="grid grid-cols-2 gap-1 mb-2">
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
                            className={`h-7 px-1.5 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                              pressedKey === 'up' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                            }`}
                          >
                            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                          <div></div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustPosition('left')}
                            className={`h-7 px-1.5 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                              pressedKey === 'left' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                            }`}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                          <div className="flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustPosition('right')}
                            className={`h-7 px-1.5 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                              pressedKey === 'right' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                            }`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                          <div></div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustPosition('down')}
                            className={`h-7 px-1.5 transition-all duration-75 hover:bg-primary/20 hover:border-primary ${
                              pressedKey === 'down' ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-95' : ''
                            }`}
                          >
                            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                          <div></div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Use arrow keys or buttons to fine-tune position
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {FL_320_FIELD_CONFIG[currentFieldIndex]?.type === 'input' && (
                    <Input
                      value={formData[currentFieldName] as string || ''}
                      onChange={(e) => updateField(currentFieldName, e.target.value)}
                      placeholder={FL_320_FIELD_CONFIG[currentFieldIndex]?.placeholder}
                      className="h-9 text-sm"
                    />
                  )}

                  {FL_320_FIELD_CONFIG[currentFieldIndex]?.type === 'textarea' && (
                    <Textarea
                      value={formData[currentFieldName] as string || ''}
                      onChange={(e) => updateField(currentFieldName, e.target.value)}
                      placeholder={FL_320_FIELD_CONFIG[currentFieldIndex]?.placeholder}
                      className="min-h-[60px] text-sm resize-none"
                    />
                  )}

                  {FL_320_FIELD_CONFIG[currentFieldIndex]?.type === 'checkbox' && (
                    <div className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={!!formData[currentFieldName]}
                        onCheckedChange={(checked) => updateField(currentFieldName, checked as boolean)}
                      />
                      <label className="text-sm">
                        {FL_320_FIELD_CONFIG[currentFieldIndex]?.label}
                      </label>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Position: X {currentPosition.left.toFixed(1)}% • Y {currentPosition.top.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {filteredFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-3" strokeWidth={1} />
                <p className="text-sm text-muted-foreground">No fields found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            ) : searchQuery ? (
              // When searching, show flat list of filtered fields
              filteredFields.map((config) => {
                const originalIndex = FL_320_FIELD_CONFIG.findIndex(f => f.field === config.field);
                const isActive = originalIndex === currentFieldIndex;
                const isSelected = selectedFields.includes(config.field);

                return (
                  <FieldNavigationItem
                    key={config.field}
                    config={config}
                    originalIndex={originalIndex}
                    isActive={isActive}
                    isSelected={isSelected}
                    formData={formData}
                    updateField={updateField}
                    setCurrentFieldIndex={setCurrentFieldIndex}
                    setSelectedFields={setSelectedFields}
                    onFieldHover={onFieldHover}
                    validationRules={validationRules}
                    validationErrors={validationErrors}
                    onSaveValidationRules={onSaveValidationRules}
                    personalInfo={personalInfo}
                    onCopyFromVault={copyFromVault}
                    activeFieldRef={isActive ? activeFieldRef : undefined}
                  />
                );
              })
            ) : (
              // When not searching, show grouped accordion view
              FL_320_FIELD_GROUPS.map((group) => {
                // Get icon component by name
                const iconMap: Record<string, React.ReactNode> = {
                  User: <User className="h-4 w-4" />,
                  Scale: <Scale className="h-4 w-4" />,
                  FileText: <FileText className="h-4 w-4" />,
                  Calendar: <Calendar className="h-4 w-4" />,
                  Shield: <Shield className="h-4 w-4" />,
                  Calculator: <Calculator className="h-4 w-4" />,
                  Package: <Package className="h-4 w-4" />,
                  Lock: <Lock className="h-4 w-4" />,
                  MoreHorizontal: <MoreHorizontal className="h-4 w-4" />,
                  MessageSquare: <MessageSquare className="h-4 w-4" />,
                };

                const icon = group.icon ? iconMap[group.icon] : null;
                const completionPercentage = getGroupCompletionPercentage(group.id, formData);
                const badge = getGroupCompletionBadge(group.id, formData);

                // Get fields for this group
                const groupFields = group.fields
                  .map(fieldName => FL_320_FIELD_CONFIG.find(f => f.field === fieldName))
                  .filter((config): config is FieldConfig => config !== undefined);

                return (
                  <LiquidGlassAccordion
                    key={group.id}
                    summary={group.title}
                    icon={icon}
                    badge={badge}
                    completionPercentage={completionPercentage}
                    variant="field-group"
                    name="fl-320-sections"
                    width="100%"
                    noIntro
                    defaultOpen={group.defaultOpen}
                  >
                    <div className="space-y-1.5">
                      {groupFields.map((config) => {
                        const originalIndex = FL_320_FIELD_CONFIG.findIndex(f => f.field === config.field);
                        const isActive = originalIndex === currentFieldIndex;
                        const isSelected = selectedFields.includes(config.field);

                        return (
                          <FieldNavigationItem
                            key={config.field}
                            config={config}
                            originalIndex={originalIndex}
                            isActive={isActive}
                            isSelected={isSelected}
                            formData={formData}
                            updateField={updateField}
                            setCurrentFieldIndex={setCurrentFieldIndex}
                            setSelectedFields={setSelectedFields}
                            onFieldHover={onFieldHover}
                            validationRules={validationRules}
                            validationErrors={validationErrors}
                            onSaveValidationRules={onSaveValidationRules}
                            personalInfo={personalInfo}
                            onCopyFromVault={copyFromVault}
                            activeFieldRef={isActive ? activeFieldRef : undefined}
                          />
                        );
                      })}
                    </div>
                  </LiquidGlassAccordion>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
