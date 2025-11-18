import { Calculator, FileText, LogOut } from "@/icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";

interface IndexHeaderProps {
  onNavigateDistribution: () => void;
  onNavigateHome: () => void;
  onPreloadDistribution: () => void;
  onCancelDistribution: () => void;
  onLogout: () => void;
  // Auto-save indicator props
  saveStatus: "idle" | "saving" | "saved" | "error" | "offline";
  lastSaved: Date | null;
  saveError?: string;
}

export const IndexHeader = ({
  onNavigateDistribution,
  onNavigateHome,
  onPreloadDistribution,
  onCancelDistribution,
  onLogout,
  saveStatus,
  lastSaved,
  saveError,
}: IndexHeaderProps) => (
  <header className="border-b border-border/40 bg-card/85 backdrop-blur-xl z-50 shadow-[0_1px_2px_hsl(220_13%_13%/0.05),inset_0_1px_0_hsl(0_0%_100%/0.4)] flex-shrink-0 transition-all duration-300">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[inset_0_1px_0_hsl(0_0%_100%/0.3)] transition-all duration-300 hover:bg-primary/15">
            <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              SwiftFill Pro
            </h1>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">AI-Powered Legal Forms</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-1.5 p-2 w-[360px]">
                    <NavigationMenuLink asChild>
                      <button
                        onClick={onNavigateDistribution}
                        onMouseEnter={onPreloadDistribution}
                        onMouseLeave={onCancelDistribution}
                        className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-accent transition-colors text-left"
                      >
                        <Calculator className="h-4 w-4 mt-0.5 text-primary" strokeWidth={1.5} />
                        <div>
                          <div className="font-medium text-sm mb-0.5">Distribution Calculator</div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            Calculate property division, validate Watts charges
                          </p>
                        </div>
                      </button>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <button
                        onClick={onNavigateHome}
                        className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-accent transition-colors text-left"
                      >
                        <FileText className="h-4 w-4 mt-0.5 text-primary" strokeWidth={1.5} />
                        <div>
                          <div className="font-medium text-sm mb-0.5">Form Filler (FL-320)</div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            Fill out legal forms with AI assistance
                          </p>
                        </div>
                      </button>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auto-save Status Indicator */}
          <AutoSaveIndicator
            status={saveStatus}
            lastSaved={lastSaved}
            errorMessage={saveError}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5 h-9">
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Logout
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  </header>
);

