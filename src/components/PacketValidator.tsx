/**
 * PacketValidator Component
 *
 * Validates TRO packet completeness and correctness before assembly/export.
 * Shows validation errors, warnings, and suggestions with clear fixes.
 */

import { Card } from '@/components/ui/card';
import { FileCheck } from '@/icons';
import { useState } from 'react';
import {
  ValidationStatusHeader,
  ValidationErrorList,
} from '@/components/validation';
import type {
  TROPacket,
  PacketValidationResult,
  ValidationError,
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

  // Group errors by severity
  const errorsBySeverity = {
    error: validationResult?.errors.filter((e) => e.severity === 'error') || [],
    warning: validationResult?.errors.filter((e) => e.severity === 'warning') || [],
    info: validationResult?.errors.filter((e) => e.severity === 'info') || [],
  };

  return (
    <Card className={`p-6 ${className}`}>
      <ValidationStatusHeader
        validationResult={validationResult}
        completionPercentage={packet.completionPercentage}
        onValidate={onValidate}
      />

      {/* Detailed Errors */}
      {validationResult && (
        <div className="space-y-4">
          <ValidationErrorList
            errorsBySeverity={errorsBySeverity}
            expandedErrors={expandedErrors}
            onToggleExpansion={toggleErrorExpansion}
            onFixError={onFixError}
          />
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
