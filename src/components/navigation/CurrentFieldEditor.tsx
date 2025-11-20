import { Input } from "@/components/ui/liquid-justice-temp";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldPositionControls } from "./FieldPositionControls";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";
import type { FormData, FieldPosition } from "@/types/FormData";

interface CurrentFieldEditorProps {
  currentFieldIndex: number;
  currentFieldName: string;
  currentPosition: FieldPosition;
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  adjustPosition: (direction: 'up' | 'down' | 'left' | 'right') => void;
  selectedFields: string[];
  pressedKey?: 'up' | 'down' | 'left' | 'right' | null;
}

export const CurrentFieldEditor = ({
  currentFieldIndex,
  currentFieldName,
  currentPosition,
  formData,
  updateField,
  updateFieldPosition,
  adjustPosition,
  selectedFields,
  pressedKey
}: CurrentFieldEditorProps) => {
  if (currentFieldIndex < 0 || currentFieldIndex >= FL_320_FIELD_CONFIG.length) {
    return null;
  }

  const config = FL_320_FIELD_CONFIG[currentFieldIndex];

  return (
    <div className="p-1.5 bg-muted/20 rounded-md border border-border/50 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold truncate">
          {config?.label}
          {selectedFields.length > 0 && (
            <span className="ml-1 text-[10px] text-muted-foreground">({selectedFields.length})</span>
          )}
        </h3>
        <FieldPositionControls
          currentFieldName={currentFieldName}
          currentPosition={currentPosition}
          updateFieldPosition={updateFieldPosition}
          adjustPosition={adjustPosition}
          pressedKey={pressedKey}
        />
      </div>

      {config?.type === 'input' && (
        <Input
          value={formData[currentFieldName] as string || ''}
          onChange={(e) => updateField(currentFieldName, e.target.value)}
          placeholder={config?.placeholder}
          className="h-9 text-sm"
        />
      )}

      {config?.type === 'textarea' && (
        <Textarea
          value={formData[currentFieldName] as string || ''}
          onChange={(e) => updateField(currentFieldName, e.target.value)}
          placeholder={config?.placeholder}
          className="min-h-[60px] text-sm resize-none"
        />
      )}

      {config?.type === 'checkbox' && (
        <div className="flex items-center space-x-2 py-1">
          <Checkbox
            checked={!!formData[currentFieldName]}
            onCheckedChange={(checked) => updateField(currentFieldName, checked as boolean)}
          />
          <label className="text-sm">{config?.label}</label>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Position: X {currentPosition.left.toFixed(1)}% • Y {currentPosition.top.toFixed(1)}%
      </div>
    </div>
  );
};

