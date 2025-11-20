import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/liquid-justice-temp";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Trash2 } from "@/icons";
import { FL_320_FIELD_CONFIG } from "@/config/field-config";
import { getOverallFormCompletionPercentage, getOverallFormCompletionCount } from "@/config/field-groups";
import type { FormData } from "@/types/FormData";

interface FieldNavigationControlsProps {
  currentFieldIndex: number;
  formData: FormData;
  goToPrevField: () => void;
  goToNextField: () => void;
  handleClearFields: () => void;
}

export const FieldNavigationControls = ({
  currentFieldIndex,
  formData,
  goToPrevField,
  goToNextField,
  handleClearFields
}: FieldNavigationControlsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        <Button size="sm" variant="outline" onClick={goToPrevField} disabled={currentFieldIndex === 0} className="h-7 gap-0.5 text-xs">
          <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          Prev
        </Button>
        <Button size="sm" variant="outline" onClick={goToNextField} disabled={currentFieldIndex === FL_320_FIELD_CONFIG.length - 1} className="h-7 gap-0.5 text-xs">
          Next
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-1 py-2 cursor-help">
            <Progress
              value={getOverallFormCompletionPercentage(formData)}
              className="h-1 bg-muted"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {(() => {
              const { completedFields, totalFields } = getOverallFormCompletionCount(formData);
              return `${completedFields} of ${totalFields} fields completed`;
            })()}
          </p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFields}
            className="w-full h-6 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
            Clear All
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Clear all form fields</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

