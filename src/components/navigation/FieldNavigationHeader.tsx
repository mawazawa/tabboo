import { Badge, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/liquid-justice-temp";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Settings, Package, Trash2 } from "@/icons";
import { FieldGroupManager } from "@/components/FieldGroupManager";
import type { FieldPosition } from "@/types/FormData";

interface FieldNavigationHeaderProps {
  currentFieldIndex: number;
  totalFields: number;
  searchQuery: string;
  filteredFieldsCount: number;
  showAISearch: boolean;
  onSearchToggle: () => void;
  onSettingsOpen: () => void;
  onClearFields: () => void;
  selectedFields: string[];
  fieldPositions: Record<string, FieldPosition>;
  onApplyGroup: (groupPositions: Record<string, FieldPosition>) => void;
}

export const FieldNavigationHeader = ({
  currentFieldIndex,
  totalFields,
  searchQuery,
  filteredFieldsCount,
  showAISearch,
  onSearchToggle,
  onSettingsOpen,
  onClearFields,
  selectedFields,
  fieldPositions,
  onApplyGroup,
}: FieldNavigationHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="px-2 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-sm truncate">
              Field {currentFieldIndex + 1}/{totalFields}
            </h2>
            {searchQuery && (
              <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                {filteredFieldsCount} results
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-all hover:scale-110 px-1.5 py-0.5"
                  onClick={onSearchToggle}
                  aria-label="Search fields"
                >
                  <Search className="h-3 w-3" strokeWidth={1.5} />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">Search Fields</p>
                <p className="text-xs text-muted-foreground">Find specific form fields</p>
              </TooltipContent>
            </Tooltip>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-all hover:scale-110 px-1.5 py-0.5"
                      aria-label="Field groups"
                    >
                      <Package className="h-3 w-3" strokeWidth={1.5} />
                    </Badge>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Field Groups</p>
                  <p className="text-xs text-muted-foreground">Organize related fields</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-[500px]" align="end">
                <FieldGroupManager
                  selectedFields={selectedFields}
                  fieldPositions={fieldPositions}
                  onApplyGroup={onApplyGroup}
                  triggerless={true}
                />
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-all hover:scale-110 px-1.5 py-0.5"
                  onClick={onSettingsOpen}
                  aria-label="Form settings"
                >
                  <Settings className="h-3 w-3" strokeWidth={1.5} />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-medium">Form Settings</p>
                <p className="text-xs text-muted-foreground">Manage templates</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="destructive"
                  className="cursor-pointer hover:bg-destructive/90 transition-all hover:scale-110 px-1.5 py-0.5"
                  onClick={onClearFields}
                  aria-label="Clear all form fields"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium mb-1">Clear Form Fields</p>
                <p className="text-xs text-muted-foreground">⚠️ Delete all form data (cannot be undone)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
