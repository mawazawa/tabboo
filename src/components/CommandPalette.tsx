import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Calculator,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  onToggleAI?: () => void;
  onToggleFields?: () => void;
  onToggleVault?: () => void;
  onToggleThumbnails?: () => void;
  onOpenSettings?: () => void;
  onAutofillAll?: () => void;
  onLogout?: () => void;
}

export const CommandPalette = ({
  onToggleAI,
  onToggleFields,
  onToggleVault,
  onToggleThumbnails,
  onOpenSettings,
  onAutofillAll,
  onLogout,
}: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Form Filler (FL-320)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/distribution-calculator"))}>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Distribution Calculator</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="View">
          {onToggleAI && (
            <CommandItem onSelect={() => runCommand(onToggleAI)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Toggle AI Chat</span>
            </CommandItem>
          )}
          {onToggleFields && (
            <CommandItem onSelect={() => runCommand(onToggleFields)}>
              <PanelRightClose className="mr-2 h-4 w-4" />
              <span>Toggle Fields Panel</span>
            </CommandItem>
          )}
          {onToggleVault && (
            <CommandItem onSelect={() => runCommand(onToggleVault)}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Toggle Personal Data Vault</span>
            </CommandItem>
          )}
          {onToggleThumbnails && (
            <CommandItem onSelect={() => runCommand(onToggleThumbnails)}>
              <PanelLeftClose className="mr-2 h-4 w-4" />
              <span>Toggle Thumbnails</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {onAutofillAll && (
            <CommandItem onSelect={() => runCommand(onAutofillAll)}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Autofill All Fields</span>
            </CommandItem>
          )}
          {onOpenSettings && (
            <CommandItem onSelect={() => runCommand(onOpenSettings)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Open Settings</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          {onLogout && (
            <CommandItem onSelect={() => runCommand(onLogout)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
