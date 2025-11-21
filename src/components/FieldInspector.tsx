/**
 * Field Inspector Sidebar
 *
 * A VS Code-inspired property panel for editing form field configurations.
 * Features premium dark mode aesthetics with Liquid Glass polish:
 * - Smooth spring animations on field transitions
 * - Subtle glassmorphic backgrounds
 * - Micro-interactions on all controls
 * - Keyboard-accessible with focus states
 * - Delete confirmation with visual feedback
 *
 * @author Claude Code
 * @since November 2025
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Check,
  Calendar,
  Trash2,
  AlertTriangle,
  Sparkles,
} from "@/icons";

// ============================================================================
// Types
// ============================================================================

export interface Field {
  id: string;
  key: string;
  type: 'text' | 'checkbox' | 'date';
  required: boolean;
}

export interface FieldInspectorProps {
  selectedField: Field | null;
  onUpdate: (id: string, updates: Partial<Field>) => void;
  onDelete: (id: string) => void;
  className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

interface FieldTypeBadgeProps {
  type: Field['type'];
}

function FieldTypeBadge({ type }: FieldTypeBadgeProps) {
  const config = {
    text: {
      icon: FileText,
      label: 'Text',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      glow: 'shadow-blue-500/20',
    },
    checkbox: {
      icon: Check,
      label: 'Checkbox',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      glow: 'shadow-emerald-500/20',
    },
    date: {
      icon: Calendar,
      label: 'Date',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      glow: 'shadow-purple-500/20',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
        "transition-all duration-300 ease-out",
        config.bg,
        config.color,
        `shadow-sm ${config.glow}`
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FieldInspector({
  selectedField,
  onUpdate,
  onDelete,
  className,
}: FieldInspectorProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const deleteTimeoutRef = React.useRef<NodeJS.Timeout>();
  const prevFieldIdRef = React.useRef<string | null>(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Handle field transition animations
  React.useEffect(() => {
    if (selectedField?.id !== prevFieldIdRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 150);
      prevFieldIdRef.current = selectedField?.id ?? null;
      return () => clearTimeout(timer);
    }
  }, [selectedField?.id]);

  // Reset delete confirmation when field changes
  React.useEffect(() => {
    setConfirmDelete(false);
    setIsDeleting(false);
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
  }, [selectedField?.id]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = () => {
    if (!selectedField) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-reset after 3 seconds
      deleteTimeoutRef.current = setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
      return;
    }

    // Execute delete with animation
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(selectedField.id);
      setIsDeleting(false);
      setConfirmDelete(false);
    }, 200);
  };

  const handleKeyChange = (value: string) => {
    if (!selectedField) return;
    // Sanitize: remove spaces, special chars (allow alphanumeric and underscore)
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
    onUpdate(selectedField.id, { key: sanitized });
  };

  // ============================================================================
  // Empty State
  // ============================================================================

  if (!selectedField) {
    return (
      <div
        className={cn(
          "field-inspector",
          "h-full flex flex-col",
          "bg-[#1e1e1e] border-l border-[#3c3c3c]",
          className
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#cccccc]">
            Inspector
          </h2>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div
            className={cn(
              "w-16 h-16 rounded-xl mb-4",
              "bg-gradient-to-br from-[#2d2d2d] to-[#252525]",
              "border border-[#3c3c3c]",
              "flex items-center justify-center",
              "shadow-lg shadow-black/20"
            )}
          >
            <Sparkles className="h-7 w-7 text-[#4a4a4a]" />
          </div>
          <p className="text-sm text-[#808080] text-center leading-relaxed">
            Select a field to
            <br />
            view its properties
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Active State
  // ============================================================================

  return (
    <div
      className={cn(
        "field-inspector",
        "h-full flex flex-col",
        "bg-[#1e1e1e] border-l border-[#3c3c3c]",
        isDeleting && "opacity-50 scale-98",
        "transition-all duration-200",
        className
      )}
    >
      {/* Header with field type badge */}
      <div className="px-4 py-3 border-b border-[#3c3c3c]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#cccccc]">
            Inspector
          </h2>
          <FieldTypeBadge type={selectedField.type} />
        </div>
      </div>

      {/* Property Form */}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 py-4 space-y-5",
          isTransitioning && "opacity-0 translate-y-1",
          "transition-all duration-150 ease-out"
        )}
      >
        {/* Field ID (read-only reference) */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[#808080] font-normal">
            Field ID
          </Label>
          <div
            className={cn(
              "h-9 px-3 flex items-center",
              "rounded-md text-xs font-mono",
              "bg-[#252525] border border-[#3c3c3c]",
              "text-[#808080]"
            )}
          >
            <span className="truncate">{selectedField.id}</span>
          </div>
        </div>

        {/* Key ID */}
        <div className="space-y-1.5">
          <Label
            htmlFor="field-key"
            className="text-xs text-[#cccccc] font-medium"
          >
            Key ID
            <span className="ml-1.5 text-[#808080] font-normal">
              (variable name)
            </span>
          </Label>
          <Input
            id="field-key"
            value={selectedField.key}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="field_name"
            className={cn(
              "h-9 text-sm font-mono",
              "bg-[#252525] border-[#3c3c3c]",
              "text-[#d4d4d4] placeholder:text-[#4a4a4a]",
              "focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]/30",
              "hover:border-[#4a4a4a]",
              "transition-colors duration-150"
            )}
          />
          <p className="text-[10px] text-[#6e6e6e] leading-tight">
            Used by AI to identify this field. Use snake_case.
          </p>
        </div>

        {/* Type Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[#cccccc] font-medium">
            Type
          </Label>
          <Select
            value={selectedField.type}
            onValueChange={(value: Field['type']) =>
              onUpdate(selectedField.id, { type: value })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 text-sm",
                "bg-[#252525] border-[#3c3c3c]",
                "text-[#d4d4d4]",
                "focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc]/30",
                "hover:border-[#4a4a4a]",
                "transition-colors duration-150",
                "[&>svg]:text-[#808080]"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={cn(
                "bg-[#252525] border-[#3c3c3c]",
                "shadow-xl shadow-black/40"
              )}
            >
              <SelectItem
                value="text"
                className={cn(
                  "text-sm text-[#d4d4d4]",
                  "focus:bg-[#04395e] focus:text-white",
                  "cursor-pointer"
                )}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  Text
                </span>
              </SelectItem>
              <SelectItem
                value="checkbox"
                className={cn(
                  "text-sm text-[#d4d4d4]",
                  "focus:bg-[#04395e] focus:text-white",
                  "cursor-pointer"
                )}
              >
                <span className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Checkbox
                </span>
              </SelectItem>
              <SelectItem
                value="date"
                className={cn(
                  "text-sm text-[#d4d4d4]",
                  "focus:bg-[#04395e] focus:text-white",
                  "cursor-pointer"
                )}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  Date
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Required Toggle */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[#cccccc] font-medium">
            Validation
          </Label>
          <div
            className={cn(
              "flex items-center justify-between",
              "h-9 px-3 rounded-md",
              "bg-[#252525] border border-[#3c3c3c]",
              "hover:border-[#4a4a4a]",
              "transition-colors duration-150"
            )}
          >
            <span className="text-sm text-[#d4d4d4]">Required</span>
            <Switch
              checked={selectedField.required}
              onCheckedChange={(checked) =>
                onUpdate(selectedField.id, { required: checked })
              }
              className={cn(
                "data-[state=checked]:bg-[#007acc]",
                "data-[state=unchecked]:bg-[#3c3c3c]"
              )}
            />
          </div>
        </div>
      </div>

      {/* Delete Action */}
      <div className="px-4 py-3 border-t border-[#3c3c3c]">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={cn(
            "w-full h-9 px-3 rounded-md",
            "text-sm font-medium",
            "flex items-center justify-center gap-2",
            "transition-all duration-200",
            confirmDelete
              ? [
                  "bg-red-500/20 border border-red-500/50",
                  "text-red-400",
                  "hover:bg-red-500/30",
                  "animate-pulse",
                ]
              : [
                  "bg-[#252525] border border-[#3c3c3c]",
                  "text-[#d4d4d4]",
                  "hover:bg-[#2d2d2d] hover:border-red-500/50 hover:text-red-400",
                ],
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-red-500/30"
          )}
        >
          {confirmDelete ? (
            <>
              <AlertTriangle className="h-4 w-4" />
              <span>Click again to confirm</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              <span>Delete Field</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default FieldInspector;
