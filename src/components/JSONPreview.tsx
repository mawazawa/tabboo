/**
 * JSON Preview Component
 *
 * A read-only JSON code block with VS Code-inspired styling:
 * - Syntax highlighting for keys, values, and types
 * - Line numbers like a proper code editor
 * - Copy to clipboard with animated feedback
 * - Smooth scrolling for large datasets
 * - Responsive font sizing
 *
 * @author Claude Code
 * @since November 2025
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, FileJson } from "@/icons";

// ============================================================================
// Types
// ============================================================================

export interface Field {
  id: string;
  key: string;
  type: 'text' | 'checkbox' | 'date';
  required: boolean;
}

export interface JSONPreviewProps {
  fields: Field[];
  className?: string;
  maxHeight?: string;
  title?: string;
}

// ============================================================================
// Syntax Highlighter
// ============================================================================

interface SyntaxHighlightedLineProps {
  content: string;
  lineNumber: number;
}

function SyntaxHighlightedLine({ content, lineNumber }: SyntaxHighlightedLineProps) {
  // Parse and highlight JSON syntax
  const highlightJSON = (line: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    // Match patterns in order of precedence
    const patterns = [
      // Keys (property names)
      { regex: /"([^"]+)"(?=\s*:)/, className: "text-[#9cdcfe]" },
      // String values
      { regex: /"([^"]*)"/, className: "text-[#ce9178]" },
      // Booleans
      { regex: /\b(true|false)\b/, className: "text-[#569cd6]" },
      // Numbers
      { regex: /\b(\d+)\b/, className: "text-[#b5cea8]" },
      // Null
      { regex: /\bnull\b/, className: "text-[#569cd6]" },
      // Brackets and braces
      { regex: /[\[\]{}]/, className: "text-[#ffd700]" },
      // Punctuation
      { regex: /[,:]/, className: "text-[#808080]" },
    ];

    while (remaining.length > 0) {
      let matched = false;

      for (const { regex, className } of patterns) {
        const match = remaining.match(regex);
        if (match && match.index !== undefined) {
          // Add any text before the match
          if (match.index > 0) {
            parts.push(
              <span key={`${lineNumber}-pre-${keyIndex++}`}>
                {remaining.slice(0, match.index)}
              </span>
            );
          }

          // Add the highlighted match
          parts.push(
            <span key={`${lineNumber}-match-${keyIndex++}`} className={className}>
              {match[0]}
            </span>
          );

          remaining = remaining.slice(match.index + match[0].length);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // No pattern matched, take the first character
        parts.push(
          <span key={`${lineNumber}-char-${keyIndex++}`}>
            {remaining[0]}
          </span>
        );
        remaining = remaining.slice(1);
      }
    }

    return parts;
  };

  return (
    <div className="table-row group/line">
      {/* Line number */}
      <span
        className={cn(
          "table-cell pr-4 text-right select-none",
          "text-[#6e6e6e] text-xs",
          "group-hover/line:text-[#808080]",
          "transition-colors duration-150"
        )}
        style={{ minWidth: "2.5rem" }}
      >
        {lineNumber}
      </span>
      {/* Code content */}
      <span className="table-cell whitespace-pre">
        {highlightJSON(content)}
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function JSONPreview({
  fields,
  className,
  maxHeight = "400px",
  title = "Schema Preview",
}: JSONPreviewProps) {
  const [copied, setCopied] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Format JSON with 2-space indentation
  const jsonString = React.useMemo(() => {
    return JSON.stringify(fields, null, 2);
  }, [fields]);

  // Split into lines for line numbers
  const lines = React.useMemo(() => {
    return jsonString.split('\n');
  }, [jsonString]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);

      // Reset after 2 seconds
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn(
        "json-preview",
        "flex flex-col",
        "bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg",
        "overflow-hidden",
        "shadow-lg shadow-black/20",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between",
          "px-4 py-2.5",
          "bg-[#252525] border-b border-[#3c3c3c]"
        )}
      >
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-[#808080]" />
          <span className="text-xs font-medium text-[#cccccc]">
            {title}
          </span>
          <span className="text-[10px] text-[#6e6e6e] font-mono">
            ({fields.length} {fields.length === 1 ? 'field' : 'fields'})
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md",
            "text-xs font-medium",
            "transition-all duration-200",
            copied
              ? [
                  "bg-emerald-500/20 text-emerald-400",
                  "border border-emerald-500/30",
                ]
              : [
                  "bg-[#2d2d2d] text-[#cccccc]",
                  "border border-[#3c3c3c]",
                  "hover:bg-[#363636] hover:border-[#4a4a4a]",
                  isHovering ? "opacity-100" : "opacity-70",
                ],
            "focus:outline-none focus:ring-2 focus:ring-[#007acc]/30"
          )}
        >
          <span
            className={cn(
              "relative h-3.5 w-3.5",
              "transition-transform duration-200",
              copied && "scale-110"
            )}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </span>
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* Code block */}
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <div
          className={cn(
            "p-4",
            "font-mono text-sm leading-relaxed",
            "text-[#d4d4d4]"
          )}
        >
          {fields.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-lg mb-3",
                  "bg-[#252525] border border-[#3c3c3c]",
                  "flex items-center justify-center"
                )}
              >
                <FileJson className="h-5 w-5 text-[#4a4a4a]" />
              </div>
              <p className="text-xs text-[#6e6e6e]">
                No fields defined yet
              </p>
            </div>
          ) : (
            // Syntax highlighted code
            <div className="table">
              {lines.map((line, index) => (
                <SyntaxHighlightedLine
                  key={index}
                  content={line}
                  lineNumber={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      {fields.length > 0 && (
        <div
          className={cn(
            "flex items-center gap-4 px-4 py-2",
            "bg-[#252525] border-t border-[#3c3c3c]",
            "text-[10px] text-[#6e6e6e]"
          )}
        >
          <span>
            {fields.filter((f) => f.required).length} required
          </span>
          <span className="text-[#3c3c3c]">|</span>
          <span>
            {fields.filter((f) => f.type === 'text').length} text
          </span>
          <span>
            {fields.filter((f) => f.type === 'checkbox').length} checkbox
          </span>
          <span>
            {fields.filter((f) => f.type === 'date').length} date
          </span>
        </div>
      )}
    </div>
  );
}

export default JSONPreview;
