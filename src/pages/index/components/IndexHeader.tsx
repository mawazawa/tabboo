import { LogOut, Database } from "@/icons";
import type { FormType } from "@/types/WorkflowTypes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IndexHeaderProps {
  onLogout: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error" | "offline";
  currentFormType: FormType;
  onFormTypeChange: (newFormType: FormType) => void;
  onOpenGraph?: () => void;
}

export const IndexHeader = ({
  onLogout,
  saveStatus,
  currentFormType,
  onFormTypeChange,
  onOpenGraph,
}: IndexHeaderProps) => (
  <header className="border-b border-border/20 bg-background/95 backdrop-blur-sm z-50 flex-shrink-0">
    <div className="container mx-auto px-6 h-12 flex items-center justify-between">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight">SwiftFill</span>
        <span className="text-[10px] text-muted-foreground">FL-320</span>
      </div>

      {/* Center: Form selector */}
      <select
        value={currentFormType}
        onChange={(e) => onFormTypeChange(e.target.value as FormType)}
        className="bg-transparent border-0 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors outline-none"
      >
        <option value="FL-320">FL-320</option>
        <option value="DV-100">DV-100</option>
        <option value="DV-105">DV-105</option>
      </select>

      {/* Right: Status + Logout */}
      <div className="flex items-center gap-3">
        {/* God Mode Trigger */}
        {onOpenGraph && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={onOpenGraph}
              >
                <Database className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Knowledge Graph (God Mode)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Save status dot */}
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            saveStatus === 'saved' ? 'bg-green-500' :
            saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
            saveStatus === 'error' ? 'bg-red-500' :
            'bg-muted-foreground/30'
          }`}
          title={
            saveStatus === 'saved' ? 'All changes saved' :
            saveStatus === 'saving' ? 'Saving...' :
            saveStatus === 'error' ? 'Save error' :
            'Idle'
          }
        />
        <button
          onClick={onLogout}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </header>
);
