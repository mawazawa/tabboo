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
  <header className="border-b-2 bg-card/80 backdrop-blur-sm z-50 shadow-medium flex-shrink-0">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <FileText className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SwiftFill Pro
            </h1>
            <p className="text-sm text-muted-foreground">AI-Powered Legal Form Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <NavigationMenuLink asChild>
                      <button
                        onClick={onNavigateDistribution}
                        onMouseEnter={onPreloadDistribution}
                        onMouseLeave={onCancelDistribution}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                      >
                        <Calculator className="h-5 w-5 mt-0.5 text-primary" strokeWidth={1.5} />
                        <div>
                          <div className="font-medium mb-1">Distribution Calculator</div>
                          <p className="text-sm text-muted-foreground">
                            Calculate property division, validate Watts charges, and detect errors
                          </p>
                        </div>
                      </button>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <button
                        onClick={onNavigateHome}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                      >
                        <FileText className="h-5 w-5 mt-0.5 text-primary" strokeWidth={1.5} />
                        <div>
                          <div className="font-medium mb-1">Form Filler (FL-320)</div>
                          <p className="text-sm text-muted-foreground">
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
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 shadow-3point chamfered spring-hover">
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

