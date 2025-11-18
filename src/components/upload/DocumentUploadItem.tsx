/**
 * DocumentUploadItem
 *
 * Individual document item with upload/extraction status.
 * Shows progress, status icons, and actions.
 *
 * Single Responsibility: Display single document status and actions
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  X
} from '@/icons';
import { type DocumentType } from '@/lib/mistral-ocr-client';

interface DocumentUploadItemProps {
  id: string;
  fileName: string;
  documentType: DocumentType;
  status: 'uploading' | 'extracting' | 'completed' | 'failed';
  progress: number;
  extractedData?: any;
  error?: string;
  onRemove: (id: string) => void;
  onPreview: (id: string) => void;
}

const getDocumentTypeIcon = (type: DocumentType) => {
  switch (type) {
    case 'drivers_license':
      return '🪪';
    case 'passport':
      return '🛂';
    case 'court_form':
      return '⚖️';
    case 'legal_document':
      return '📄';
    case 'utility_bill':
      return '💡';
    case 'opposing_counsel_filing':
      return '👨‍⚖️';
    default:
      return '📋';
  }
};

export const DocumentUploadItem = ({
  id,
  fileName,
  documentType,
  status,
  progress,
  extractedData,
  error,
  onRemove,
  onPreview,
}: DocumentUploadItemProps) => {
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'extracting':
        return 'Extracting data...';
      case 'completed':
        return `Extracted ${extractedData ? Object.keys(extractedData).length : 0} fields`;
      case 'failed':
        return error || 'Failed';
      default:
        return '';
    }
  };

  return (
    <Card
      className={`p-3 shadow-3point chamfered transition-all ${
        status === 'completed'
          ? 'border-primary/30 bg-primary/5'
          : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-xl">
          {getDocumentTypeIcon(documentType)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate">
              {fileName}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-2">
            {status === 'extracting' && (
              <Loader2 className="h-3 w-3 animate-spin text-primary" strokeWidth={1.5} />
            )}
            {status === 'completed' && (
              <CheckCircle className="h-3 w-3 text-green-500" strokeWidth={1.5} />
            )}
            {status === 'failed' && (
              <AlertCircle className="h-3 w-3 text-red-500" strokeWidth={1.5} />
            )}
            <span className="text-xs text-muted-foreground">
              {getStatusText()}
            </span>
          </div>

          {/* Progress Bar */}
          {status !== 'completed' && status !== 'failed' && (
            <Progress value={progress} className="h-1" />
          )}

          {/* Actions */}
          {status === 'completed' && extractedData && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(id)}
                className="h-7 text-xs gap-1"
              >
                <Eye className="h-3 w-3" strokeWidth={1.5} />
                Preview
              </Button>
              <Badge variant="secondary" className="text-xs">
                {Math.round(extractedData.confidence * 100)}% confidence
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
