import { useState } from "react";
import { Button, Input } from "@/components/ui/liquid-justice-temp";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "@/icons";
import type { FieldPosition } from "@/types/FormData";

interface FieldPositionControlsProps {
  currentFieldName: string;
  currentPosition: FieldPosition;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  adjustPosition: (direction: 'up' | 'down' | 'left' | 'right') => void;
  pressedKey?: 'up' | 'down' | 'left' | 'right' | null;
}

export const FieldPositionControls = ({
  currentFieldName,
  currentPosition,
  updateFieldPosition,
  adjustPosition,
  pressedKey = null
}: FieldPositionControlsProps) => {
  const [showPositionControl, setShowPositionControl] = useState(false);

  return (
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
  );
};

