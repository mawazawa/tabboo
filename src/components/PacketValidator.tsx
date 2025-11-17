/**
 * PacketValidator Component
 *
 * Validates TRO packet completeness and correctness before assembly/export.
 * Shows validation errors, warnings, and suggestions with clear fixes.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  FileX,
  Sparkles,
} from '@/icons';
import { useState } from 'react';
import type {
  TROPacket,
  PacketValidationResult,
  ValidationError,
  ValidationSeverity,
  ValidationStatus,
  FormType,
} from '@/types/PacketTypes';

interface Props {
  packet: TROPacket;
  validationResult?: PacketValidationResult;
  onValidate: () => void;
  onFixError?: (error: ValidationError) => void;
  className?: string;
}

export function PacketValidator({
  packet,
  validationResult,
  onValidate,
  onFixError,
  className = '',
}: Props) {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const toggleErrorExpansion = (errorId: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(errorId)) {
        next.delete(errorId);
      } else {
        next.add(errorId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: ValidationSeverity) => {
    const variants: Record<ValidationSeverity, 'destructive' | 'default' | 'secondary'> = {
      error: 'destructive',
      warning: 'default',
      info: 'secondary',
    };

    return (
      <Badge variant={variants[severity]} className="ml-2">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case 'valid':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusMessage = (status: ValidationStatus) => {
    switch (status) {
      case 'valid':
        return 'Packet is complete and ready to file';
      case 'warning':
        return 'Packet can be filed but has warnings';
      case 'error':
        return 'Packet has errors and cannot be filed';
      default:
        return 'Validation not yet performed';
    }
  };

  // Group errors by severity
  const errorsBySeverity = {
    error: validationResult?.errors.filter((e) => e.severity === 'error') || [],
    warning: validationResult?.errors.filter((e) => e.severity === 'warning') || [],
    info: validationResult?.errors.filter((e) => e.severity === 'info') || [],
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {validationResult && getStatusIcon(validationResult.status)}
          <div>
            <h2 className="text-2xl font-bold mb-1">Packet Validation</h2>
            <p className="text-sm text-muted-foreground">
              {validationResult
                ? validationResult.summary
                : 'Check your packet for completeness and court compliance'}
            </p>
          </div>
        </div>
        <Button onClick={onValidate} variant="default" size="lg">
          <FileCheck className="h-4 w-4 mr-2" />
          Validate Packet
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Validation Status */}
      {validationResult && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Alert className={validationResult.canFile ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {validationResult.canFile ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertTitle className={validationResult.canFile ? 'text-green-900' : 'text-red-900'}>
                {validationResult.canFile ? 'Ready to File' : 'Cannot File Yet'}
              </AlertTitle>
            </div>
            <AlertDescription className={validationResult.canFile ? 'text-green-800' : 'text-red-800'}>
              {getStatusMessage(validationResult.status)}
            </AlertDescription>
          </Alert>

          {/* Completion Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Packet Completion</span>
              <span className="text-muted-foreground">{packet.completionPercentage}%</span>
            </div>
            <Progress value={packet.completionPercentage} className="h-2" />
          </div>

          {/* Error Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-700">{validationResult.errorCount.error}</div>
                <div className="text-sm text-red-600 mt-1">Errors</div>
              </div>
            </Card>
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-700">{validationResult.errorCount.warning}</div>
                <div className="text-sm text-yellow-600 mt-1">Warnings</div>
              </div>
            </Card>
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">{validationResult.errorCount.info}</div>
                <div className="text-sm text-blue-600 mt-1">Info</div>
              </div>
            </Card>
          </div>

          {/* Forms Validated */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Forms Validated</h3>
            <div className="flex flex-wrap gap-2">
              {validationResult.formsValidated.map((formType) => (
                <Badge key={formType} variant="secondary">
                  {formType}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Detailed Errors */}
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
                      <ValidationErrorCard
                        key={error.id}
                        error={error}
                        isExpanded={expandedErrors.has(error.id)}
                        onToggle={() => toggleErrorExpansion(error.id)}
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
                          <ValidationErrorCard
                            key={error.id}
                            error={error}
                            isExpanded={expandedErrors.has(error.id)}
                            onToggle={() => toggleErrorExpansion(error.id)}
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
                          <ValidationErrorCard
                            key={error.id}
                            error={error}
                            isExpanded={expandedErrors.has(error.id)}
                            onToggle={() => toggleErrorExpansion(error.id)}
                            onFix={onFixError}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* No Errors */}
            {validationResult.errors.length === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-900">All Clear!</AlertTitle>
                <AlertDescription className="text-green-800">
                  Your packet passed all validation checks. You're ready to assemble and file.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Pre-Validation State */}
      {!validationResult && (
        <div className="text-center py-12">
          <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Validation Performed Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Click "Validate Packet" to check your forms for completeness and court compliance.
          </p>
        </div>
      )}
    </Card>
  );
}

/**
 * Individual validation error card
 */
interface ValidationErrorCardProps {
  error: ValidationError;
  isExpanded: boolean;
  onToggle: () => void;
  onFix?: (error: ValidationError) => void;
}

function ValidationErrorCard({ error, isExpanded, onToggle, onFix }: ValidationErrorCardProps) {
  const getSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

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
