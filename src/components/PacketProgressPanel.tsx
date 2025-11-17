/**
 * Packet Progress Panel Component
 *
 * Displays visual progress of TRO packet completion with form status indicators,
 * completion percentages, and navigation capabilities. Can be used as a standalone
 * panel or integrated into larger layouts.
 *
 * @version 1.0
 * @date November 17, 2025
 * @author Agent 2 - Workflow Engine
 */

import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, FileText } from '@/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FormType,
  FormStatus,
  type PacketProgressPanelProps,
  FORM_ESTIMATED_TIME
} from '@/types/WorkflowTypes';
import { cn } from '@/lib/utils';

/**
 * Get color scheme for form status
 */
const getStatusColor = (status: FormStatus): string => {
  switch (status) {
    case FormStatus.COMPLETE:
    case FormStatus.VALIDATED:
      return 'text-green-500';
    case FormStatus.IN_PROGRESS:
      return 'text-primary';
    case FormStatus.ERROR:
      return 'text-destructive';
    case FormStatus.SKIPPED:
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

/**
 * Get icon for form status
 */
const getStatusIcon = (status: FormStatus) => {
  const iconClass = cn('w-5 h-5', getStatusColor(status));

  switch (status) {
    case FormStatus.COMPLETE:
    case FormStatus.VALIDATED:
      return <CheckCircle2 className={iconClass} />;
    case FormStatus.ERROR:
      return <AlertCircle className={iconClass} />;
    case FormStatus.IN_PROGRESS:
      return <FileText className={iconClass} />;
    default:
      return <Circle className={iconClass} />;
  }
};

/**
 * Get human-readable form name
 */
const getFormName = (formType: FormType): string => {
  const names: Record<FormType, string> = {
    [FormType.DV100]: 'Request for Restraining Order',
    [FormType.DV101]: 'Description of Abuse',
    [FormType.DV105]: 'Child Custody Orders',
    [FormType.DV109]: 'Notice of Hearing',
    [FormType.DV110]: 'Temporary Restraining Order',
    [FormType.DV120]: 'Response to Request',
    [FormType.CLETS001]: 'CLETS Information',
    [FormType.FL150]: 'Income & Expense Declaration',
    [FormType.FL320]: 'Responsive Declaration'
  };
  return names[formType] || formType;
};

/**
 * Compact form item for progress list
 */
const FormProgressItem: React.FC<{
  formType: FormType;
  status: FormStatus;
  isActive?: boolean;
  onSelect?: () => void;
  showEstimatedTime?: boolean;
}> = ({ formType, status, isActive, onSelect, showEstimatedTime }) => {
  const estimatedMinutes = FORM_ESTIMATED_TIME[formType] || 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-accent',
        isActive && 'bg-accent border border-primary'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {getStatusIcon(status)}
      </div>

      {/* Form Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {formType}
          </span>
          {status === FormStatus.SKIPPED && (
            <Badge variant="outline" className="text-xs flex-shrink-0">Skipped</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {getFormName(formType)}
        </p>
        {showEstimatedTime && estimatedMinutes > 0 && status !== FormStatus.COMPLETE && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>~{estimatedMinutes} min</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0">
        {status === FormStatus.COMPLETE && (
          <Badge variant="default" className="bg-green-500 text-xs">
            Done
          </Badge>
        )}
        {status === FormStatus.IN_PROGRESS && (
          <Badge variant="default" className="text-xs">
            Active
          </Badge>
        )}
      </div>
    </div>
  );
};

/**
 * Main Packet Progress Panel Component
 */
export const PacketProgressPanel: React.FC<PacketProgressPanelProps> = ({
  workflow,
  onFormSelect,
  compact = false,
  showEstimatedTime = true
}) => {
  if (!workflow) {
    return null;
  }

  // Calculate overall completion
  const formStatuses = Object.entries(workflow.formStatuses);
  const totalForms = formStatuses.filter(
    ([_, status]) => status !== FormStatus.SKIPPED
  ).length;

  const completedForms = formStatuses.filter(
    ([_, status]) => status === FormStatus.COMPLETE || status === FormStatus.VALIDATED
  ).length;

  const completionPercentage = totalForms > 0
    ? Math.round((completedForms / totalForms) * 100)
    : 0;

  // Calculate estimated time remaining
  const estimatedTimeRemaining = formStatuses
    .filter(([formType, status]) => {
      return status !== FormStatus.SKIPPED &&
             status !== FormStatus.COMPLETE &&
             status !== FormStatus.VALIDATED;
    })
    .reduce((total, [formType]) => {
      return total + (FORM_ESTIMATED_TIME[formType as FormType] || 0);
    }, 0);

  // Determine current form
  const currentFormType = Object.entries(workflow.formStatuses).find(
    ([_, status]) => status === FormStatus.IN_PROGRESS
  )?.[0] as FormType | undefined;

  // Compact view
  if (compact) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Progress</CardTitle>
            <Badge variant="secondary" className="text-lg font-bold">
              {completionPercentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={completionPercentage} className="h-2" />

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {formStatuses.map(([formType, status]) => (
              <FormProgressItem
                key={formType}
                formType={formType as FormType}
                status={status}
                isActive={formType === currentFormType}
                onSelect={() => onFormSelect?.(formType as FormType)}
                showEstimatedTime={false}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>TRO Packet Progress</CardTitle>
        <CardDescription>
          Track your progress through the restraining order packet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">
                {completionPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">
                {completedForms} of {totalForms} forms complete
              </div>
            </div>

            {showEstimatedTime && estimatedTimeRemaining > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {estimatedTimeRemaining} min remaining
                  </span>
                </div>
              </div>
            )}
          </div>

          <Progress value={completionPercentage} className="h-3" />
        </div>

        <Separator />

        {/* Forms List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm mb-3">Forms to Complete</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {formStatuses.map(([formType, status]) => (
              <FormProgressItem
                key={formType}
                formType={formType as FormType}
                status={status}
                isActive={formType === currentFormType}
                onSelect={() => onFormSelect?.(formType as FormType)}
                showEstimatedTime={showEstimatedTime}
              />
            ))}
          </div>
        </div>

        {/* Status Summary */}
        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {completedForms}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Circle className="w-4 h-4" />
              <span>Remaining</span>
            </div>
            <div className="text-2xl font-bold">
              {totalForms - completedForms}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {currentFormType && onFormSelect && (
          <>
            <Separator />
            <div className="space-y-2">
              <Button
                onClick={() => onFormSelect(currentFormType)}
                className="w-full"
              >
                Continue Working on {currentFormType}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PacketProgressPanel;
