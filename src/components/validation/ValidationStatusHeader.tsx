/**
 * ValidationStatusHeader Component
 *
 * Displays overall validation status with icon, title, and summary.
 * Shows validation button and completion progress.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, FileCheck } from '@/icons';
import { getStatusIcon, getStatusMessage } from '@/lib/validation-helpers';
import type { PacketValidationResult, FormType } from '@/types/PacketTypes';

interface Props {
  validationResult?: PacketValidationResult;
  completionPercentage: number;
  onValidate: () => void;
}

export function ValidationStatusHeader({
  validationResult,
  completionPercentage,
  onValidate,
}: Props) {
  return (
    <>
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
              <span className="text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
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
              {validationResult.formsValidated.map((formType: FormType) => (
                <Badge key={formType} variant="secondary">
                  {formType}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />
        </div>
      )}
    </>
  );
}
