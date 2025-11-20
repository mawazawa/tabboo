import { LiquidGlassAccordion } from "@/components/ui/liquid-justice-temp";
import { FieldNavigationItem } from "./FieldNavigationItem";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";
import { FL_320_FIELD_GROUPS, getGroupCompletionPercentage, getGroupCompletionBadge } from "@/config/field-groups";
import { User, Scale, FileText, Calendar, Shield, Calculator, Package, Lock, MoreHorizontal, MessageSquare, Search } from "@/icons";
import type { FormData, FieldConfig, ValidationRules, ValidationErrors } from "@/types/FormData";

interface FieldListProps {
  searchQuery: string;
  filteredFields: FieldConfig[];
  currentFieldIndex: number;
  selectedFields: string[];
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  setCurrentFieldIndex: (index: number) => void;
  setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
  onFieldHover?: (fieldName: string | null) => void;
  validationRules?: ValidationRules;
  validationErrors?: ValidationErrors;
  onSaveValidationRules?: (fieldName: string, rules: ValidationRules[string]) => void;
  personalInfo: any;
  onCopyFromVault: (field: string) => void;
  activeFieldRef?: React.RefObject<HTMLDivElement>;
}

export const FieldList = ({
  searchQuery,
  filteredFields,
  currentFieldIndex,
  selectedFields,
  formData,
  updateField,
  setCurrentFieldIndex,
  setSelectedFields,
  onFieldHover,
  validationRules = {},
  validationErrors = {},
  onSaveValidationRules,
  personalInfo,
  onCopyFromVault,
  activeFieldRef
}: FieldListProps) => {
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

  if (filteredFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground/30 mb-3" strokeWidth={1} />
        <p className="text-sm text-muted-foreground">No fields found</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
      </div>
    );
  }

  if (searchQuery) {
    return (
      <>
        {filteredFields.map((config) => {
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
              onCopyFromVault={onCopyFromVault}
              activeFieldRef={isActive ? activeFieldRef : undefined}
            />
          );
        })}
      </>
    );
  }

  return (
    <>
      {FL_320_FIELD_GROUPS.map((group) => {
        const icon = group.icon ? iconMap[group.icon] : null;
        const completionPercentage = getGroupCompletionPercentage(group.id, formData);
        const badge = getGroupCompletionBadge(group.id, formData);

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
                    onCopyFromVault={onCopyFromVault}
                    activeFieldRef={isActive ? activeFieldRef : undefined}
                  />
                );
              })}
            </div>
          </LiquidGlassAccordion>
        );
      })}
    </>
  );
};

