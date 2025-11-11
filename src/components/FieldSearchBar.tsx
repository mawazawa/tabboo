import { useState, useEffect } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onFieldSearch: (query: string) => void;
  onAIQuery: (query: string) => void;
  placeholder?: string;
}

export const FieldSearchBar = ({ 
  onFieldSearch, 
  onAIQuery,
  placeholder = "Search fields or ask AI..." 
}: Props) => {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<'search' | 'ai'>('search');

  // Real-time search mode
  useEffect(() => {
    if (mode === 'search') {
      onFieldSearch(value);
    }
  }, [value, mode, onFieldSearch]);

  const handleAISubmit = () => {
    if (!value.trim()) return;
    onAIQuery(value);
    setValue("");
    setMode('search');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleAISubmit();
    }
  };

  return (
    <div className="relative flex items-center flex-1 max-w-md">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" strokeWidth={0.5} />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-20 bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/50"
      />
      <Button
        size="sm"
        variant="default"
        className="absolute right-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-3point chamfered font-medium"
        onClick={handleAISubmit}
        disabled={!value.trim()}
      >
        <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-xs font-semibold">Ask AI</span>
      </Button>
    </div>
  );
};
