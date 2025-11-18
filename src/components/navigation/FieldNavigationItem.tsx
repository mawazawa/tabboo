import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
      className={`relative space-y-2 p-4 rounded-lg border transition-all duration-300 shadow-3point chamfered spring-hover cursor-pointer ${
        isActive
          ? 'border-primary bg-primary/5 shadow-3point-hover scale-[1.02]'
          : isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-3point-hover'
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
                onCopyFromVault(config);
              }}
              className="h-8 px-3 text-xs gap-1 shadow-3point chamfered spring-hover"
              title="Copy from vault"
            >
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          )}
          {isActive && (
            <span className="text-xs font-semibold text-primary px-2 py-1 rounded-md bg-primary/10 animate-in fade-in duration-200">
              Active
            </span>
          )}
          {isSelected && !isActive && (
            <span className="text-xs font-semibold text-blue-600 px-2 py-1 rounded-md bg-blue-500/10 animate-in fade-in duration-200">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Vault data preview */}
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
          className="field-input h-12 text-base border-hairline shadow-3point chamfered transition-all duration-200"
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
          className="field-input min-h-[100px] text-sm resize-none transition-all duration-200"
        />
      )}

      {/* Checkbox Field */}
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
          <label htmlFor={config.field} className="text-sm cursor-pointer">
            {config.label}
          </label>
        </div>
      )}
    </div>
  );
};
