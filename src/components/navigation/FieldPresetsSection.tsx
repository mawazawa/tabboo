import { Button } from "@/components/ui/liquid-justice-temp";
import { FieldPresetsToolbar } from "../FieldPresetsToolbar";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";

interface FieldPresetsSectionProps {
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
}

export const FieldPresetsSection = ({
  selectedFields,
  setSelectedFields,
  onSnapToGrid,
  onAlignHorizontal,
  onAlignVertical,
  onDistribute,
  onCopyPositions,
  onPastePositions,
  onTransformPositions,
  hasCopiedPositions
}: FieldPresetsSectionProps) => {
  return (
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
    </div>
  );
};

