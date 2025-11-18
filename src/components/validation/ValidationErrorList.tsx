/**
 * ValidationErrorList Component
 *
 * Displays grouped validation errors by severity (error, warning, info).
 * Supports collapsible sections for warnings and info.
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
} from '@/icons';
import { ValidationErrorItem } from './ValidationErrorItem';
import type { ValidationError } from '@/types/PacketTypes';

interface Props {
  errorsBySeverity: {
    error: ValidationError[];
    warning: ValidationError[];
    info: ValidationError[];
  };
  expandedErrors: Set<string>;
  onToggleExpansion: (errorId: string) => void;
  onFixError?: (error: ValidationError) => void;
}

export function ValidationErrorList({
  errorsBySeverity,
  expandedErrors,
  onToggleExpansion,
  onFixError,
}: Props) {
  const hasErrors = Object.values(errorsBySeverity).some((errors) => errors.length > 0);

  if (!hasErrors) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-900">All Clear!</AlertTitle>
        <AlertDescription className="text-green-800">
          Your packet passed all validation checks. You're ready to assemble and file.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical Errors */}
      {errorsBySeverity.error.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-700 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Critical Errors ({errorsBySeverity.error.length})
          </h3>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {errorsBySeverity.error.map((error) => (
                <ValidationErrorItem
                  key={error.id}
                  error={error}
                  isExpanded={expandedErrors.has(error.id)}
                  onToggle={() => onToggleExpansion(error.id)}
                  onFix={onFixError}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Warnings */}
      {errorsBySeverity.warning.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Warnings ({errorsBySeverity.warning.length})
          </h3>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mb-2">
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Warnings
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {errorsBySeverity.warning.map((error) => (
                    <ValidationErrorItem
                      key={error.id}
                      error={error}
                      isExpanded={expandedErrors.has(error.id)}
                      onToggle={() => onToggleExpansion(error.id)}
                      onFix={onFixError}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Info */}
      {errorsBySeverity.info.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Suggestions ({errorsBySeverity.info.length})
          </h3>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mb-2">
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Suggestions
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {errorsBySeverity.info.map((error) => (
                    <ValidationErrorItem
                      key={error.id}
                      error={error}
                      isExpanded={expandedErrors.has(error.id)}
                      onToggle={() => onToggleExpansion(error.id)}
                      onFix={onFixError}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
