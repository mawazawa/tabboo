/**
 * DocumentDropZone
 *
 * Drag-and-drop upload area for document upload.
 * Handles file drag events and input selection.
 *
 * Single Responsibility: File upload UI only
 */

import { Badge } from '@/components/ui/badge';
import { Upload } from '@/icons';

interface DocumentDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const getDocumentTypeIcon = (type: string) => {
  switch (type) {
    case 'drivers_license':
      return '🪪';
    case 'court_form':
      return '⚖️';
    case 'legal_document':
      return '📄';
    default:
      return '📋';
  }
};

export const DocumentDropZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
}: DocumentDropZoneProps) => {
  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all mb-4 ${
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-muted hover:border-primary/50'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        id="document-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="image/*,application/pdf"
        multiple
        onChange={onFileInput}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>

        <div>
          <p className="font-medium mb-1">Drop documents here</p>
          <p className="text-xs text-muted-foreground">
            or click to browse
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <Badge variant="outline" className="text-xs">
            {getDocumentTypeIcon('drivers_license')} Driver's License
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getDocumentTypeIcon('court_form')} Court Forms
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getDocumentTypeIcon('legal_document')} Legal Docs
          </Badge>
        </div>
      </div>
    </div>
  );
};
