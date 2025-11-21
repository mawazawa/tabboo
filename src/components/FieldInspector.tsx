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
  Copy,
} from "@/icons";

// ============================================================================
// Custom Styles with Spring Physics
// ============================================================================

const inspectorStyles = `
  .field-inspector-spring-enter {
    animation: fieldEnter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .field-inspector-spring-exit {
    animation: fieldExit 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  @keyframes fieldEnter {
    0% {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fieldExit {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
  }

  .field-badge-glow {
    box-shadow:
      0 0 0 1px currentColor,
      0 0 8px -2px currentColor;
  }

  .field-input-glow:focus {
    box-shadow:
      0 0 0 1px #007acc,
      0 0 12px -4px #007acc;
  }

  .delete-progress-bar {
    background: linear-gradient(90deg,
      rgba(239, 68, 68, 0.3) 0%,
      rgba(239, 68, 68, 0.1) 100%
    );
  }

  .inspector-section {
    position: relative;
  }

  .inspector-section::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 0;
    background: #007acc;
    border-radius: 1px;
    transition: height 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .inspector-section:focus-within::before {
    height: 100%;
  }
`;

// Inject styles once
if (typeof document !== 'undefined') {
  const styleId = 'field-inspector-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = inspectorStyles;
    document.head.appendChild(style);
  }
}

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
  const [deleteProgress, setDeleteProgress] = React.useState(0);
  const deleteTimeoutRef = React.useRef<NodeJS.Timeout>();
  const deleteAnimationRef = React.useRef<number>();
  const prevFieldIdRef = React.useRef<string | null>(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [focusedControl, setFocusedControl] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState(false);
  const [animationKey, setAnimationKey] = React.useState(0);

  // Handle field transition animations
  React.useEffect(() => {
    if (selectedField?.id !== prevFieldIdRef.current) {
      setIsTransitioning(true);
      setAnimationKey(prev => prev + 1);
      const timer = setTimeout(() => setIsTransitioning(false), 150);
      prevFieldIdRef.current = selectedField?.id ?? null;
      return () => clearTimeout(timer);
    }
  }, [selectedField?.id]);

  // Copy field ID to clipboard
  const handleCopyId = async () => {
    if (!selectedField) return;
    try {
      await navigator.clipboard.writeText(selectedField.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Reset delete confirmation when field changes
  React.useEffect(() => {
    setConfirmDelete(false);
    setIsDeleting(false);
    setDeleteProgress(0);
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    if (deleteAnimationRef.current) {
      cancelAnimationFrame(deleteAnimationRef.current);
    }
  }, [selectedField?.id]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      if (deleteAnimationRef.current) {
        cancelAnimationFrame(deleteAnimationRef.current);
      }
    };
  }, []);

  // Animate delete progress
  React.useEffect(() => {
    if (confirmDelete) {
      const startTime = performance.now();
      const duration = 3000; // 3 seconds

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDeleteProgress(progress * 100);

        if (progress < 1) {
          deleteAnimationRef.current = requestAnimationFrame(animate);
        }
      };

      deleteAnimationRef.current = requestAnimationFrame(animate);

      return () => {
        if (deleteAnimationRef.current) {
          cancelAnimationFrame(deleteAnimationRef.current);
        }
      };
    } else {
      setDeleteProgress(0);
    }
  }, [confirmDelete]);

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
        key={animationKey}
        className={cn(
          "flex-1 overflow-y-auto px-4 py-4 space-y-5",
          "field-inspector-spring-enter"
        )}
      >
        {/* Field ID (read-only reference) */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[#808080] font-normal">
            Field ID
          </Label>
          <div
            className={cn(
              "h-9 px-3 flex items-center justify-between",
              "rounded-md text-xs font-mono",
              "bg-[#252525] border border-[#3c3c3c]",
              "text-[#808080]",
              "group/id"
            )}
          >
            <span className="truncate flex-1">{selectedField.id}</span>
            <button
              onClick={handleCopyId}
              className={cn(
                "ml-2 p-1 rounded",
                "opacity-0 group-hover/id:opacity-100",
                "hover:bg-[#3c3c3c]",
                "transition-all duration-150",
                copiedId && "text-emerald-400 opacity-100"
              )}
              title="Copy ID"
            >
              {copiedId ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Key ID */}
        <div className="space-y-1.5 inspector-section pl-3">
          <Label
            htmlFor="field-key"
            className={cn(
              "text-xs font-medium transition-colors duration-150",
              focusedControl === 'key' ? "text-[#4fc3f7]" : "text-[#cccccc]"
            )}
          >
            Key ID
            <span className="ml-1.5 text-[#808080] font-normal">
              (variable name)
            </span>
          </Label>
          <div className="relative">
            <Input
              id="field-key"
              value={selectedField.key}
              onChange={(e) => handleKeyChange(e.target.value)}
              onFocus={() => setFocusedControl('key')}
              onBlur={() => setFocusedControl(null)}
              placeholder="field_name"
              className={cn(
                "h-9 text-sm font-mono field-input-glow",
                "bg-[#252525] border-[#3c3c3c]",
                "text-[#d4d4d4] placeholder:text-[#4a4a4a]",
                "focus:border-[#007acc]",
                "hover:border-[#4a4a4a]",
                "transition-all duration-150"
              )}
            />
          </div>
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
        <div className="relative">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              "w-full h-9 px-3 rounded-md",
              "text-sm font-medium",
              "flex items-center justify-center gap-2",
              "transition-all duration-200",
              "overflow-hidden relative",
              confirmDelete
                ? [
                    "bg-red-500/20 border border-red-500/50",
                    "text-red-400",
                    "hover:bg-red-500/30",
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
            {/* Progress bar overlay for delete confirmation */}
            {confirmDelete && (
              <div
                className="absolute inset-0 bg-red-500/10 transition-all duration-100"
                style={{ width: `${100 - deleteProgress}%` }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <AlertTriangle className="h-4 w-4 animate-bounce" />
                  <span>Click to confirm ({Math.ceil((100 - deleteProgress) / 33.3)}s)</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Field</span>
                </>
              )}
            </span>
          </button>
        </div>
        {/* Keyboard shortcut hint */}
        <p className="mt-2 text-[10px] text-[#4a4a4a] text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-[#2d2d2d] border border-[#3c3c3c] text-[#808080]">⌫</kbd> to delete
        </p>
      </div>
    </div>
  );
}

export default FieldInspector;
