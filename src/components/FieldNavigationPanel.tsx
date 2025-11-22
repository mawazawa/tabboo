import { Card } from "@/components/ui/liquid-justice-temp";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FieldNavigationHeader } from "./navigation/FieldNavigationHeader";
import { FieldList } from "./navigation/FieldList";
import { CurrentFieldEditor } from "./navigation/CurrentFieldEditor";
import { FieldNavigationControls } from "./navigation/FieldNavigationControls";
import { FieldPresetsSection } from "./navigation/FieldPresetsSection";
import { FieldSearchSection } from "./navigation/FieldSearchSection";
import { useFieldNavigationPanel } from "./navigation/useFieldNavigationPanel";
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

export const FieldNavigationPanel = (props: Props) => {
  const {
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
  } = props;

  const {
    searchQuery,
    setSearchQuery,
    showSearch,
    showAISearch,
    setShowAISearch,
    filteredFields,
    pressedKey,
    currentPosition,
    personalInfo,
    searchInputRef,
    scrollViewportRef,
    activeFieldRef,
    LiveRegionComponent,
    adjustPosition,
    copyFromVault,
    goToNextField,
    goToPrevField,
    handleClearFields,
    handleAIQuery,
    handleSettingsOpen,
    handleSearchToggle,
    safeFieldName
  } = useFieldNavigationPanel({
    currentFieldIndex,
    setCurrentFieldIndex,
    updateField,
    fieldPositions,
    updateFieldPosition,
    onSettingsSheetChange
  });

  return (
    <Card className="h-full border shadow-sm flex flex-col overflow-hidden">
      <LiveRegionComponent />

      <FieldNavigationHeader
        currentFieldIndex={currentFieldIndex}
        totalFields={FL_320_FIELD_CONFIG.length}
        searchQuery={searchQuery}
        filteredFieldsCount={filteredFields.length}
        showAISearch={showAISearch}
        onSearchToggle={handleSearchToggle}
        onSettingsOpen={handleSettingsOpen}
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
          onAIQuery={handleAIQuery}
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
