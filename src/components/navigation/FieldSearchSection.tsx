import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FieldSearchBar } from "../FieldSearchBar";
import { FieldSearchInput } from "./FieldSearchInput";
import { TemplateManager } from "../TemplateManager";
import type { FormData, FieldPosition } from "@/types/FormData";
import type { FormTemplate } from "@/utils/templateManager";

interface FieldSearchSectionProps {
  showAISearch: boolean;
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowAISearch: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  settingsSheetOpen: boolean;
  onSettingsSheetChange: (open: boolean) => void;
  fieldPositions: Record<string, FieldPosition>;
  onApplyTemplate: (template: FormTemplate) => void;
  onAIQuery: (query: string) => void;
}

export const FieldSearchSection = ({
  showAISearch,
  showSearch,
  searchQuery,
  setSearchQuery,
  setShowAISearch,
  searchInputRef,
  settingsSheetOpen,
  onSettingsSheetChange,
  fieldPositions,
  onApplyTemplate,
  onAIQuery
}: FieldSearchSectionProps) => {
  return (
    <>
      <Sheet open={settingsSheetOpen} onOpenChange={onSettingsSheetChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Form Settings</SheetTitle>
            <SheetDescription>Manage templates and form configurations</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TemplateManager
              currentFormId="FL-320"
              currentFormName="Response to Request for Restraining Orders"
              currentFieldPositions={fieldPositions}
              onApplyTemplate={onApplyTemplate}
              triggerless={true}
            />
          </div>
        </SheetContent>
      </Sheet>

      {showAISearch && (
        <FieldSearchBar
          onFieldSearch={(query) => setSearchQuery(query)}
          onAIQuery={onAIQuery}
          placeholder="Ask AI or search fields..."
        />
      )}

      {showSearch && (
        <FieldSearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
        />
      )}
    </>
  );
};
