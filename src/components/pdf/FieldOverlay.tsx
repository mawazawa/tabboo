import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from '@/icons';
import type { FormData, FieldPosition, ValidationErrors, PersonalVaultData } from '@/types/FormData';

interface FieldOverlayProps {
  field: string;
  type: 'input' | 'textarea' | 'checkbox';
  placeholder?: string;
  width?: string;
  height?: string;
  position: FieldPosition;
  zoom: number;
  fieldFontSize: number;
  formData: FormData;
  isEditMode: boolean;
  isCurrentField: boolean;
  isDragging: boolean;
  highlightedField: string | null;
  validationErrors?: ValidationErrors;
  vaultData?: PersonalVaultData | null;
  canAutofillField: boolean;
  hasValue: boolean;
  updateField: (field: string, value: string | boolean) => void;
  adjustPosition: (direction: 'up' | 'down' | 'left' | 'right', field: string) => void;
  handleFieldClick: (field: string, e: React.MouseEvent) => void;
  handleAutofillField: (field: string, e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export function FieldOverlay({
  field,
  type,
  placeholder,
  width,
  height,
  position,
  zoom,
  fieldFontSize,
  formData,
  isEditMode,
  isCurrentField,
  isDragging,
  highlightedField,
  validationErrors = {},
  canAutofillField,
  hasValue,
  updateField,
  adjustPosition,
  handleFieldClick,
  handleAutofillField,
  onPointerDown,
}: FieldOverlayProps) {
  // Determine which directions are available for movement
  const canMoveUp = position.top > 1;
  const canMoveDown = position.top < 94;
  const canMoveLeft = position.left > 1;
  const canMoveRight = position.left < 94;

  return (
    <div
      data-field={field}
      className={`field-container group absolute z-20 ${isEditMode ? 'select-none touch-none' : ''} ${
        isDragging
          ? 'cursor-grabbing z-50 ring-2 ring-primary shadow-lg scale-105'
          : isEditMode
          ? 'cursor-move ring-2 ring-primary/70'
          : 'cursor-pointer'
      } ${
        highlightedField === field
          ? 'ring-2 ring-accent shadow-lg animate-pulse'
          : isCurrentField
          ? 'ring-2 ring-primary shadow-md bg-primary/5'
          : 'ring-1 ring-border/50 hover:ring-primary/50'
      } rounded-lg bg-background/80 backdrop-blur-sm p-2 transition-all duration-200`}
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        width: width || 'auto',
        height: height || 'auto',
        pointerEvents: 'auto',
        // Expand clickable area with negative margin
        margin: '-8px',
        // Scale with zoom
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
      onClick={(e) => handleFieldClick(field, e)}
      {...(onPointerDown ? { onPointerDown } : {})}
    >
      {/* Visual Direction Indicators */}
      {isEditMode && (
        <>
          {/* Up Arrow Indicator */}
          {canMoveUp && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none">
              <ArrowUp className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
            </div>
          )}

          {/* Down Arrow Indicator */}
          {canMoveDown && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
              <ArrowDown className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
            </div>
          )}

          {/* Left Arrow Indicator */}
          {canMoveLeft && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-10 pointer-events-none">
              <ArrowLeft className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
            </div>
          )}

          {/* Right Arrow Indicator */}
          {canMoveRight && (
            <div className="absolute top-1/2 -translate-y-1/2 -right-10 pointer-events-none">
              <ArrowRight className="h-5 w-5 text-primary animate-pulse drop-shadow-lg" strokeWidth={2.5} />
            </div>
          )}
        </>
      )}

      {/* Simplified Field Controls */}
      {isCurrentField && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-between gap-2">
          <div className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
            {placeholder || field}
            {canAutofillField && !hasValue && (
              <Sparkles className="inline h-3 w-3 ml-1 animate-pulse" />
            )}
          </div>
          {isEditMode && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                disabled={!canMoveUp}
                aria-label="Move field up"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustPosition('up', field);
                }}
              >
                <ChevronUp className="h-3 w-3" />
                <span className="sr-only">Move field up</span>
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                disabled={!canMoveDown}
                aria-label="Move field down"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustPosition('down', field);
                }}
              >
                <ChevronDown className="h-3 w-3" />
                <span className="sr-only">Move field down</span>
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                disabled={!canMoveLeft}
                aria-label="Move field left"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustPosition('left', field);
                }}
              >
                <ChevronLeft className="h-3 w-3" />
                <span className="sr-only">Move field left</span>
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                disabled={!canMoveRight}
                aria-label="Move field right"
                onClick={(e) => {
                  e.stopPropagation();
                  adjustPosition('right', field);
                }}
              >
                <ChevronRight className="h-3 w-3" />
                <span className="sr-only">Move field right</span>
              </Button>
            </div>
          )}
        </div>
      )}
      {isCurrentField && (
        <>
          {canAutofillField && !hasValue && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -top-2 -right-10 h-7 w-7 rounded-full"
                  aria-label="Autofill field from vault"
                  onClick={(e) => handleAutofillField(field, e)}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">Autofill from vault</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Autofill from vault</p>
              </TooltipContent>
            </Tooltip>
          )}
        </>
      )}

      {/* Field Input Elements */}
      {type === 'input' && (
        <Input
          data-field={field}
          value={(formData[field as keyof FormData] as string) || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          disabled={isEditMode}
          style={{
            fontSize: `${fieldFontSize}pt`,
            height: `${fieldFontSize * 2}px`,
          }}
          className={`field-input font-mono ${
            isEditMode
              ? 'bg-muted/50 border-muted cursor-move pointer-events-none'
              : validationErrors?.[field]?.length
              ? 'bg-destructive/10 border-destructive'
              : isCurrentField
              ? 'bg-primary/5 border-primary'
              : 'bg-background border-border'
          }`}
        />
      )}
      {type === 'textarea' && (
        <Textarea
          data-field={field}
          value={(formData[field as keyof FormData] as string) || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          disabled={isEditMode}
          style={{
            fontSize: `${fieldFontSize}pt`,
            minHeight: `${fieldFontSize * 4}px`,
          }}
          className={`field-input font-mono resize-none ${
            isEditMode
              ? 'bg-muted/50 border-muted cursor-move pointer-events-none'
              : validationErrors?.[field]?.length
              ? 'bg-destructive/10 border-destructive'
              : isCurrentField
              ? 'bg-primary/5 border-primary'
              : 'bg-background border-border'
          }`}
        />
      )}
      {type === 'checkbox' && (
        <Checkbox
          data-field={field}
          checked={!!formData[field as keyof FormData]}
          onCheckedChange={(checked) => !isEditMode && updateField(field, checked as boolean)}
          disabled={isEditMode}
          className={`h-5 w-5 border-2 transition-all duration-200 ${
            isEditMode
              ? 'bg-muted/50 border-muted cursor-move pointer-events-none'
              : isCurrentField
              ? 'bg-primary/10 border-primary shadow-lg ring-2 ring-primary/20 scale-110'
              : 'bg-background border-border hover:border-primary/70 hover:bg-primary/5 hover:scale-110 hover:shadow-md active:scale-105 cursor-pointer'
          }`}
          aria-label={placeholder || field}
        />
      )}
    </div>
  );
}
