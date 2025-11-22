import { Card, Button, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/liquid-justice-temp";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Trash2 } from "@/icons";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiveRegion } from "@/hooks/use-live-region";
import { FieldNavigationHeader } from "./navigation/FieldNavigationHeader";
import { FieldList } from "./navigation/FieldList";
import { CurrentFieldEditor } from "./navigation/CurrentFieldEditor";
import { FieldNavigationControls } from "./navigation/FieldNavigationControls";
import { FieldPresetsSection } from "./navigation/FieldPresetsSection";
import { FieldSearchSection } from "./navigation/FieldSearchSection";
import { useFieldNavigationKeyboard } from "@/hooks/use-field-navigation-keyboard";
import { useFieldPosition } from "@/hooks/use-field-position";
import { usePersonalVault } from "@/hooks/use-personal-vault";
import { useFieldScroll } from "@/hooks/use-field-scroll";
import { useVaultCopy } from "@/hooks/use-vault-copy";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";
import type { FormData, FieldPosition, ValidationRules, ValidationErrors, ValidationRule } from "@/types/FormData";
import type { FormTemplate } from "@/utils/templateManager";

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
  onSaveValidationRules?: (fieldName: string, rules: ValidationRule[]) => void;
  settingsSheetOpen: boolean;
  onSettingsSheetChange: (open: boolean) => void;
  onApplyTemplate: (template: FormTemplate) => void;
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showPositionControl, setShowPositionControl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);

  // Custom hooks
  const { data: personalInfo } = usePersonalVault();
  const { scrollViewportRef, activeFieldRef } = useFieldScroll(currentFieldIndex);
  
  // Guard against invalid currentFieldIndex to prevent undefined currentFieldName
  const isValidIndex = currentFieldIndex >= 0 && currentFieldIndex < FL_320_FIELD_CONFIG.length;
  const currentFieldName = isValidIndex ? FL_320_FIELD_CONFIG[currentFieldIndex]?.field : undefined;
  const safeFieldName = currentFieldName || '';
  const { currentPosition, adjustPosition } = useFieldPosition(safeFieldName, fieldPositions, updateFieldPosition);
  const { copyFromVault } = useVaultCopy(personalInfo, updateField);

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

  const goToNextField = () => setCurrentFieldIndex(Math.min(FL_320_FIELD_CONFIG.length - 1, currentFieldIndex + 1));
  const goToPrevField = () => setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1));

  const { pressedKey } = useFieldNavigationKeyboard({
    currentFieldIndex,
    setCurrentFieldIndex,
    adjustPosition,
    showSearch,
    setShowSearch,
    showPositionControl,
    setShowPositionControl,
    searchInputRef
  });

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
        <FieldSearchSection
          showAISearch={showAISearch}
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowAISearch={setShowAISearch}
          searchInputRef={searchInputRef}
          settingsSheetOpen={settingsSheetOpen}
          onSettingsSheetChange={onSettingsSheetChange}
          fieldPositions={fieldPositions}
          onApplyTemplate={onApplyTemplate}
          onAIQuery={(query) => {
            toast({ title: "AI Query Sent", description: query });
            setShowAISearch(false);
          }}
        />

        <FieldNavigationControls
          currentFieldIndex={currentFieldIndex}
          formData={formData}
          goToPrevField={goToPrevField}
          goToNextField={goToNextField}
          handleClearFields={handleClearFields}
        />
      </div>

      <div ref={scrollViewportRef} className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 py-1.5 space-y-1.5">
            <FieldPresetsSection
              selectedFields={selectedFields}
              setSelectedFields={setSelectedFields}
              onSnapToGrid={onSnapToGrid}
              onAlignHorizontal={onAlignHorizontal}
              onAlignVertical={onAlignVertical}
              onDistribute={onDistribute}
              onCopyPositions={onCopyPositions}
              onPastePositions={onPastePositions}
              onTransformPositions={onTransformPositions}
              hasCopiedPositions={hasCopiedPositions}
            />

            <CurrentFieldEditor
              currentFieldIndex={currentFieldIndex}
              currentFieldName={safeFieldName}
              currentPosition={currentPosition}
              formData={formData}
              updateField={updateField}
              updateFieldPosition={updateFieldPosition}
              adjustPosition={adjustPosition}
              selectedFields={selectedFields}
              pressedKey={pressedKey}
            />

            <FieldList
              searchQuery={searchQuery}
              filteredFields={filteredFields}
              currentFieldIndex={currentFieldIndex}
              selectedFields={selectedFields}
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
              activeFieldRef={activeFieldRef}
            />
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
