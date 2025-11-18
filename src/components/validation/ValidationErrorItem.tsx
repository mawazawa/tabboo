/**
 * ValidationErrorItem Component
 *
 * Displays a single validation error with expandable details,
 * suggested fix, and auto-fix button.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Sparkles } from '@/icons';
import { getSeverityIcon, getSeverityColor } from '@/lib/validation-helpers';
import type { ValidationError } from '@/types/PacketTypes';

interface Props {
  error: ValidationError;
  isExpanded: boolean;
  onToggle: () => void;
  onFix?: (error: ValidationError) => void;
}

export function ValidationErrorItem({ error, isExpanded, onToggle, onFix }: Props) {
  return (
    <Card className={`p-4 ${getSeverityColor(error.severity)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(error.severity)}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{error.message}</h4>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {error.formType && (
            <Badge variant="outline" className="mb-2">
              {error.formType}
              {error.field && ` - ${error.field}`}
            </Badge>
          )}

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {error.suggestion && (
                <div className="flex items-start gap-2 p-3 bg-white/50 rounded-md">
                  <Sparkles className="h-4 w-4 mt-0.5 text-primary" />
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Suggested Fix</div>
                    <div className="text-sm">{error.suggestion}</div>
                  </div>
                </div>
              )}

              {onFix && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onFix(error)}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Fix
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
