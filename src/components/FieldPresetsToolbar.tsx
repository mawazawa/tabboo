import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Grid3x3, MoveHorizontal, MoveVertical, Copy, Clipboard, ArrowUpDown } from '@/icons';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface FieldPresetsToolbarProps {
  selectedFields: string[];
  onSnapToGrid: (gridSize: number) => void;
  onAlignHorizontal: (alignment: 'left' | 'center' | 'right') => void;
  onAlignVertical: (alignment: 'top' | 'middle' | 'bottom') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onCopyPositions: () => void;
  onPastePositions: () => void;
  onTransformPositions: (transformation: { offsetX?: number; offsetY?: number; scale?: number }) => void;
  hasCopiedPositions: boolean;
}

export const FieldPresetsToolbar = ({
  selectedFields,
  onSnapToGrid,
  onAlignHorizontal,
  onAlignVertical,
  onDistribute,
  onCopyPositions,
  onPastePositions,
  onTransformPositions,
  hasCopiedPositions,
}: FieldPresetsToolbarProps) => {
  const hasSelection = selectedFields.length > 0;
  const hasMultiple = selectedFields.length > 1;
  const hasThreeOrMore = selectedFields.length >= 3;

  const handleAction = (
    action: () => void,
    requiresMultiple: boolean = false,
    requiresThree: boolean = false
  ) => {
    if (!hasSelection) {
      toast.error('Select at least one field first');
      return;
    }
    if (requiresThree && !hasThreeOrMore) {
      toast.error('Select at least 3 fields for distribution');
      return;
    }
    if (requiresMultiple && !hasMultiple) {
      toast.error('Select at least 2 fields for alignment');
      return;
    }
    action();
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-lg overflow-x-auto min-w-0 flex-wrap">
        {/* Snap to Grid */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSnapToGrid(5)}
              className="h-7 w-7 p-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Snap to Grid (5%)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        {/* Horizontal Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMultiple}
              onClick={() => handleAction(() => onAlignHorizontal('left'), true)}
              className="h-7 w-7 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMultiple}
              onClick={() => handleAction(() => onAlignHorizontal('center'), true)}
              className="h-7 w-7 p-0"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMultiple}
              onClick={() => handleAction(() => onAlignHorizontal('right'), true)}
              className="h-7 w-7 p-0"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        {/* Vertical Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMultiple}
              onClick={() => handleAction(() => onAlignVertical('top'), true)}
              className="h-7 w-7 p-0"
            >
              <AlignVerticalJustifyStart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMultiple}
              onClick={() => handleAction(() => onAlignVertical('middle'), true)}
              className="h-7 w-7 p-0"
            >
              <AlignVerticalJustifyCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Middle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMultiple}
              onClick={() => handleAction(() => onAlignVertical('bottom'), true)}
              className="h-7 w-7 p-0"
            >
              <AlignVerticalJustifyEnd className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Bottom</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        {/* Distribution */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasThreeOrMore}
              onClick={() => handleAction(() => onDistribute('horizontal'), false, true)}
              className="h-7 w-7 p-0"
            >
              <MoveHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Distribute Horizontally</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasThreeOrMore}
              onClick={() => handleAction(() => onDistribute('vertical'), false, true)}
              className="h-7 w-7 p-0"
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Distribute Vertically</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        {/* Copy/Paste Operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasSelection}
              onClick={() => handleAction(() => onCopyPositions())}
              className="h-7 w-7 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy Positions</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasSelection || !hasCopiedPositions}
              onClick={() => handleAction(() => onPastePositions())}
              className="h-7 w-7 p-0"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Paste Positions</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        {/* Transform Operations */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasSelection}
                  className="h-7 w-7 p-0"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Transform</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAction(() => onTransformPositions({ offsetX: 5, offsetY: 0 }))}>
              Move Right (+5%)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(() => onTransformPositions({ offsetX: -5, offsetY: 0 }))}>
              Move Left (-5%)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(() => onTransformPositions({ offsetX: 0, offsetY: 5 }))}>
              Move Down (+5%)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(() => onTransformPositions({ offsetX: 0, offsetY: -5 }))}>
              Move Up (-5%)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
  );
};
