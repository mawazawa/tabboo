import { Input, Button } from "@/components/ui/liquid-justice-temp";
import { Search, X } from "@/icons";

interface FieldSearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const FieldSearchInput = ({
  searchQuery,
  setSearchQuery,
  searchInputRef
}: FieldSearchInputProps) => {
  return (
    <div className="relative bg-background/60 backdrop-blur-2xl border border-border/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-7 px-0 text-sm"
        />
        {searchQuery && (
          <Button size="sm" variant="ghost" onClick={() => setSearchQuery('')} className="h-5 w-5 p-0">
            <X className="h-3 w-3" strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
};

