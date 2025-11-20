import { useRef } from "react";
import { Input, Button, Label } from "@/components/ui/liquid-justice-temp";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, AlertCircle } from "@/icons";
import { ValidationRuleEditor } from "@/components/ValidationRuleEditor";
import type { FieldConfig, FormData, ValidationRules, ValidationErrors } from "@/types/FormData";

interface FieldNavigationItemProps {
  config: FieldConfig;
  originalIndex: number;
  isActive: boolean;
  isSelected: boolean;
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  setCurrentFieldIndex: (index: number) => void;
  setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
  onFieldHover?: (fieldName: string | null) => void;
  validationRules?: ValidationRules;
  validationErrors?: ValidationErrors;
  onSaveValidationRules?: (fieldName: string, rules: ValidationRules[string]) => void;
  personalInfo?: Record<string, unknown> | null;
  onCopyFromVault: (config: FieldConfig) => void;
  activeFieldRef?: React.RefObject<HTMLDivElement>;
}

export const FieldNavigationItem = ({
  config,
  originalIndex,
  isActive,
  isSelected,
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
  activeFieldRef,
}: FieldNavigationItemProps) => {
  const fieldRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null)[]>([]);
  const fieldErrors = validationErrors[config.field] || [];
  const hasErrors = fieldErrors.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        setCurrentFieldIndex(Math.max(0, index - 1));
      } else {
        setCurrentFieldIndex(index + 1);
      }
    }
  };

  const handleItemClick = (e: React.MouseEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey) {
      e.stopPropagation();
      setSelectedFields(prev =>
        prev.includes(config.field)
          ? prev.filter(f => f !== config.field)
          : [...prev, config.field]
      );
    } else {
      setCurrentFieldIndex(originalIndex);
    }
  };

  return (
    <div
      ref={isActive ? activeFieldRef : null}
      className={`relative space-y-1 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
        isActive
          ? 'border-primary bg-primary/5 shadow-sm scale-[1.01]'
          : isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : hasErrors
          ? 'border-destructive bg-destructive/5'
          : 'border-transparent hover:border-muted'
      }`}
      onClick={handleItemClick}
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

      <div className="flex items-center justify-between gap-1">
        <Label
          htmlFor={config.field}
          className={`text-[11px] font-medium transition-colors duration-200 ${
            isActive ? 'text-primary' : isSelected ? 'text-blue-600' : hasErrors ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {originalIndex + 1}. {config.label}
        </Label>
        <div className="flex items-center gap-1">
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
                onCopyFromVault(config);
              }}
              className="h-6 px-1.5 text-xs gap-0.5"
              title="Copy from vault"
            >
              <Copy className="h-3 w-3" strokeWidth={1.5} />
            </Button>
          )}
          {isActive && (
            <span className="text-[10px] font-medium text-primary px-1.5 py-0.5 rounded-sm bg-primary/10 animate-in fade-in duration-200">
              Active
            </span>
          )}
          {isSelected && !isActive && (
            <span className="text-[10px] font-medium text-blue-600 px-1.5 py-0.5 rounded-sm bg-blue-500/10 animate-in fade-in duration-200">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Vault data preview */}
      {config.vaultField && personalInfo && personalInfo[config.vaultField as keyof typeof personalInfo] && (
        <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-sm px-1.5 py-0.5 font-mono truncate">
          Saved: {personalInfo[config.vaultField as keyof typeof personalInfo]}
        </div>
      )}

      {/* Validation Errors */}
      {hasErrors && (
        <div className="space-y-0.5">
          {fieldErrors.map((error, idx) => (
            <div key={idx} className="text-[10px] text-destructive bg-destructive/10 rounded-sm px-1.5 py-0.5 flex items-start gap-0.5">
              <AlertCircle className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
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
          className="field-input h-9 text-sm transition-all duration-200"
          maxLength={config.field === 'state' ? 2 : undefined}
        />
      )}

      {/* Textarea Field */}
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
          className="field-input min-h-[72px] text-xs resize-none transition-all duration-200"
        />
      )}

      {/* Checkbox Field */}
      {config.type === 'checkbox' && (
        <div className="flex items-center space-x-1.5">
          <Checkbox
            id={config.field}
            ref={el => fieldRefs.current[originalIndex] = el as unknown as HTMLButtonElement}
            checked={!!formData[config.field]}
            onCheckedChange={(checked) => updateField(config.field, checked as boolean)}
            onKeyDown={(e) => handleKeyDown(e, originalIndex)}
            onFocus={() => setCurrentFieldIndex(originalIndex)}
          />
          <label htmlFor={config.field} className="text-xs cursor-pointer">
            {config.label}
          </label>
        </div>
      )}
    </div>
  );
};
