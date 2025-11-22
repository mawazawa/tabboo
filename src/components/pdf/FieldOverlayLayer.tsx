import React from 'react';
import { FieldPosition, FormData, PersonalVaultData, ValidationErrors } from "@/types/FormData";
import { cn } from "@/lib/utils";

interface FieldOverlayLayerProps {
  pageOverlays: any[];
  fieldPositions: Record<string, FieldPosition>;
  formData: FormData;
  currentFieldIndex: number;
  fieldNameToIndex: Record<string, number>;
  highlightedField: string | null;
  validationErrors: ValidationErrors;
  fieldFontSize: number;
  vaultData: PersonalVaultData | null;
  isEditMode: boolean;
  updateField: (field: string, value: string | boolean) => void;
  handleFieldClick: (field: string, e: React.MouseEvent) => void;
  handleAutofillField: (field: string, e: React.MouseEvent) => void;
}

export const FieldOverlayLayer: React.FC<FieldOverlayLayerProps> = ({
  pageOverlays,
  fieldPositions,
  formData,
  currentFieldIndex,
  fieldNameToIndex,
  highlightedField,
  validationErrors,
  fieldFontSize,
  vaultData,
  isEditMode,
  updateField,
  handleFieldClick,
  handleAutofillField
}) => {
  if (!pageOverlays || pageOverlays.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pageOverlays.map((field) => {
        const position = fieldPositions[field.field] || { top: parseFloat(field.top), left: parseFloat(field.left) };
        const isSelected = currentFieldIndex === fieldNameToIndex[field.field];
        const isHighlighted = highlightedField === field.field;
        const hasError = !!validationErrors[field.field];
        const vaultValue = vaultData ? vaultData[field.field as keyof PersonalVaultData] : null;
        const canAutofill = vaultData && vaultValue && !formData[field.field as keyof FormData];

        return (
          <div
            key={field.field}
            className={cn(
              "absolute transition-all duration-200 pointer-events-auto field-container",
              isSelected ? "z-30" : "z-10",
              isEditMode ? "cursor-move" : "cursor-text",
              isHighlighted && "ring-2 ring-yellow-400 ring-offset-2",
              hasError && "ring-2 ring-destructive ring-offset-2"
            )}
            style={{
              top: `${position.top}%`,
              left: `${position.left}%`,
              width: field.width ? `${field.width}%` : 'auto',
              height: field.height ? `${field.height}%` : 'auto',
            }}
            onClick={(e) => handleFieldClick(field.field, e)}
          >
            {field.type === 'checkbox' ? (
              <div 
                className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center bg-white/80 hover:bg-white",
                  formData[field.field as keyof FormData] ? "border-primary bg-primary/10" : "border-input",
                  isSelected && "ring-2 ring-ring ring-offset-1 border-primary"
                )}
                role="checkbox"
                aria-checked={!!formData[field.field as keyof FormData]}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    updateField(field.field, !formData[field.field as keyof FormData]);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateField(field.field, !formData[field.field as keyof FormData]);
                }}
              >
                {formData[field.field as keyof FormData] && <span className="text-primary font-bold">✓</span>}
              </div>
            ) : (
              <div className="relative group">
                {canAutofill && (
                  <button
                    onClick={(e) => handleAutofillField(field.field, e)}
                    className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
                    type="button"
                  >
                    Autofill from Vault
                  </button>
                )}
                <input
                  type="text"
                  className={cn(
                    "field-input w-full bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:ring-0 p-0 text-foreground/90 transition-colors",
                    "bg-white/40 focus:bg-white/90",
                    hasError && "border-destructive/50 bg-destructive/10"
                  )}
                  style={{ 
                    fontSize: `${fieldFontSize}px`,
                    height: field.height ? '100%' : undefined
                  }}
                  value={(formData[field.field as keyof FormData] as string) || ''}
                  onChange={(e) => updateField(field.field, e.target.value)}
                  readOnly={isEditMode}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

