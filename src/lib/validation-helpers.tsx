/**
 * Validation Helper Functions
 *
 * Pure utility functions for validation UI components.
 * Provides icon mapping, badge variants, colors, and status messages.
 */

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
} from '@/icons';
import type { ValidationStatus, ValidationSeverity } from '@/types/PacketTypes';

/**
 * Get status icon component for overall validation status
 */
export const getStatusIcon = (status: ValidationStatus) => {
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

/**
 * Get severity icon component for individual validation errors
 */
export const getSeverityIcon = (severity: ValidationSeverity) => {
  switch (severity) {
    case 'error':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case 'info':
      return <AlertCircle className="h-5 w-5 text-blue-600" />;
  }
};

/**
 * Get badge variant for severity level
 */
export const getSeverityBadgeVariant = (
  severity: ValidationSeverity
): 'destructive' | 'default' | 'secondary' => {
  const variants: Record<ValidationSeverity, 'destructive' | 'default' | 'secondary'> = {
    error: 'destructive',
    warning: 'default',
    info: 'secondary',
  };
  return variants[severity];
};

/**
 * Get text color class for validation status
 */
export const getStatusColor = (status: ValidationStatus): string => {
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

/**
 * Get status message for validation status
 */
export const getStatusMessage = (status: ValidationStatus): string => {
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

/**
 * Get card color classes for severity level
 */
export const getSeverityColor = (severity: ValidationSeverity): string => {
  switch (severity) {
    case 'error':
      return 'border-red-200 bg-red-50';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50';
    case 'info':
      return 'border-blue-200 bg-blue-50';
  }
};
