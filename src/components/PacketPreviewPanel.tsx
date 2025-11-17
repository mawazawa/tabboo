/**
 * PacketPreviewPanel Component
 *
 * Displays a visual preview of the TRO packet structure showing all included forms,
 * their order, page ranges, and completion status.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Circle,
  FileText,
  Eye,
  Download,
  Printer,
  Package,
  GripVertical,
  ChevronRight,
  AlertCircle,
} from '@/icons';
import type {
  TROPacket,
  PacketForm,
  FormCategory,
  FormType,
} from '@/types/PacketTypes';

interface Props {
  packet: TROPacket;
  onPreviewForm?: (formType: FormType) => void;
  onAssemble?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  className?: string;
}

export function PacketPreviewPanel({
  packet,
  onPreviewForm,
  onAssemble,
  onExport,
  onPrint,
  className = '',
}: Props) {
  const getCategoryLabel = (category: FormCategory): string => {
    switch (category) {
      case 'primary':
        return 'Primary Form';
      case 'attachment':
        return 'Attachment';
      case 'supporting':
        return 'Supporting Document';
      case 'confidential':
        return 'Confidential';
      case 'court_issued':
        return 'Court-Issued';
      case 'response':
        return 'Response Form';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category: FormCategory): string => {
    switch (category) {
      case 'primary':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'attachment':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'supporting':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confidential':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'court_issued':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'response':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const totalRequired = packet.forms.filter(f => f.isRequired).length;
  const completedRequired = packet.forms.filter(f => f.isRequired && f.isComplete).length;

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Packet Preview
          </h2>
          <p className="text-sm text-muted-foreground">
            {packet.metadata.packetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
        <div className="flex gap-2">
          {onAssemble && (
            <Button onClick={onAssemble} variant="default" size="lg">
              <Package className="h-4 w-4 mr-2" />
              Assemble
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Packet Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-muted/50">
          <div className="text-center">
            <div className="text-2xl font-bold">{packet.forms.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Forms</div>
          </div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{totalRequired}</div>
            <div className="text-xs text-blue-600 mt-1">Required</div>
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{completedRequired}</div>
            <div className="text-xs text-green-600 mt-1">Completed</div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{packet.totalPages}</div>
            <div className="text-xs text-purple-600 mt-1">Total Pages</div>
          </div>
        </Card>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Completion</span>
          <span className={`text-sm font-semibold ${getCompletionColor(packet.completionPercentage)}`}>
            {packet.completionPercentage}%
          </span>
        </div>
        <Progress value={packet.completionPercentage} className="h-3" />
      </div>

      <Separator className="mb-6" />

      {/* Form List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Forms in Packet</h3>
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {packet.forms.map((form, index) => (
              <FormPreviewCard
                key={form.formType}
                form={form}
                index={index}
                onPreview={onPreviewForm}
              />
            ))}

            {packet.forms.length === 0 && (
              <Card className="p-8 text-center border-dashed">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h4 className="font-semibold mb-1">No Forms Added Yet</h4>
                <p className="text-sm text-muted-foreground">
                  Add forms to your packet to see them here
                </p>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      {packet.forms.length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="flex gap-3">
            {onExport && (
              <Button onClick={onExport} variant="default" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            )}
            {onPrint && (
              <Button onClick={onPrint} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
          </div>
        </>
      )}

      {/* Assembly Status */}
      {packet.assemblyStatus !== 'not_started' && (
        <>
          <Separator className="my-6" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Assembly Status</span>
              <Badge
                variant={packet.assemblyStatus === 'completed' ? 'default' : 'secondary'}
              >
                {packet.assemblyStatus.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
            {packet.assembledAt && (
              <p className="text-xs text-muted-foreground">
                Last assembled: {new Date(packet.assembledAt).toLocaleString()}
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

/**
 * Individual form preview card
 */
interface FormPreviewCardProps {
  form: PacketForm;
  index: number;
  onPreview?: (formType: FormType) => void;
}

function FormPreviewCard({ form, index, onPreview }: FormPreviewCardProps) {
  const getCategoryColor = (category: FormCategory): string => {
    switch (category) {
      case 'primary':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'attachment':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'supporting':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confidential':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'court_issued':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'response':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryLabel = (category: FormCategory): string => {
    switch (category) {
      case 'primary':
        return 'Primary';
      case 'attachment':
        return 'Attachment';
      case 'supporting':
        return 'Supporting';
      case 'confidential':
        return 'Confidential';
      case 'court_issued':
        return 'Court-Issued';
      case 'response':
        return 'Response';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Order Indicator */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Form Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-sm mb-1">{form.displayName}</h4>
              <p className="text-xs text-muted-foreground">{form.formType}</p>
            </div>
            <div className="flex items-center gap-2">
              {form.isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={getCategoryColor(form.category)}>
              {getCategoryLabel(form.category)}
            </Badge>
            {form.isRequired && (
              <Badge variant="destructive" className="text-xs">
                REQUIRED
              </Badge>
            )}
            {form.pageCount && (
              <Badge variant="secondary" className="text-xs">
                {form.pageCount} page{form.pageCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {form.startPage && form.endPage && (
              <Badge variant="outline" className="text-xs">
                Pages {form.startPage}-{form.endPage}
              </Badge>
            )}
          </div>

          {/* Completion Progress */}
          {form.completionPercentage !== undefined && (
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{form.completionPercentage}%</span>
              </div>
              <Progress value={form.completionPercentage} className="h-1.5" />
            </div>
          )}

          {/* Validation Errors */}
          {form.validationErrors && form.validationErrors.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700">
                {form.validationErrors.length} validation error{form.validationErrors.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Actions */}
          {onPreview && (
            <Button
              onClick={() => onPreview(form.formType)}
              variant="ghost"
              size="sm"
              className="w-full mt-2"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Form
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          )}

          {/* Last Modified */}
          {form.lastModified && (
            <p className="text-xs text-muted-foreground mt-2">
              Last modified: {new Date(form.lastModified).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
