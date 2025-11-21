/**
 * PDF Form Field Mapper Page
 *
 * Main page for mapping form fields on PDF documents.
 * Combines PDFViewer, OverlayLayer, FieldInspector, and JSONPreview
 * into a cohesive field mapping experience.
 *
 * @author Claude Code
 * @since November 2025
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { PDFViewer } from '@/components/PDFViewer';
import { OverlayLayer } from '@/components/OverlayLayer';
import { FieldInspector } from '@/components/FieldInspector';
import { JSONPreview } from '@/components/JSONPreview';
import { useFormStore } from '@/stores/formStore';
import { Field } from '@/types/mapper';
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  Trash2,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Default PDF for testing (DV-100)
const DEFAULT_PDF = '/dv100.pdf';

export default function MapperPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfUrl, setPdfUrl] = useState(DEFAULT_PDF);
  const [pageSize, setPageSize] = useState({ width: 612, height: 792 }); // Letter size in points

  const {
    fields,
    selectedFieldId,
    pdfState,
    addField,
    updateField,
    removeField,
    selectField,
    getFieldsByPage,
    clearFields,
  } = useFormStore();

  // Get fields for current page
  const currentPageFields = getFieldsByPage(pdfState.currentPage);

  // Handle new field drawn on overlay
  const handleFieldAdd = useCallback((rect: { x: number; y: number; w: number; h: number }) => {
    const newField: Field = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key: `field_${fields.length + 1}`,
      type: 'text',
      rect,
      page: pdfState.currentPage,
      required: false,
    };

    addField(newField);

    toast({
      title: 'Field Created',
      description: `New field added on page ${pdfState.currentPage}`,
    });
  }, [addField, fields.length, pdfState.currentPage, toast]);

  // Handle field selection from overlay
  const handleFieldSelect = useCallback((id: string) => {
    selectField(id);
  }, [selectField]);

  // Handle field update from inspector
  const handleFieldUpdate = useCallback((id: string, updates: Partial<Field>) => {
    updateField(id, updates);
  }, [updateField]);

  // Handle field deletion
  const handleFieldDelete = useCallback((id: string) => {
    removeField(id);
    toast({
      title: 'Field Deleted',
      description: 'Field has been removed',
    });
  }, [removeField, toast]);

  // Get selected field object
  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  // Handle PDF file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      clearFields(); // Clear fields when loading new PDF
      toast({
        title: 'PDF Loaded',
        description: file.name,
      });
    }
  };

  // Export fields as JSON
  const handleExport = () => {
    const exportData = {
      pdfUrl: pdfUrl.startsWith('blob:') ? 'uploaded-file.pdf' : pdfUrl,
      fields: fields.map(({ id, ...rest }) => rest), // Remove internal IDs
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-mappings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exported',
      description: `${fields.length} fields exported`,
    });
  };

  // Clear all fields
  const handleClearAll = () => {
    if (fields.length > 0 && window.confirm(`Delete all ${fields.length} fields?`)) {
      clearFields();
      toast({
        title: 'Cleared',
        description: 'All fields removed',
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">PDF Field Mapper</h1>
          </div>
          <span className="text-sm text-white/40">
            {fields.length} field{fields.length !== 1 ? 's' : ''} mapped
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Load PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={fields.length === 0}
            className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={fields.length === 0}
            className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer with Overlay */}
        <div className="flex-1 relative overflow-auto bg-[#1e1e1e] p-4">
          <div className="relative inline-block">
            <PDFViewer fileUrl={pdfUrl}>
              <OverlayLayer
                width={pageSize.width * pdfState.scale}
                height={pageSize.height * pdfState.scale}
                fields={currentPageFields.map(f => ({
                  id: f.id,
                  rect: {
                    x: f.rect.x * pdfState.scale,
                    y: f.rect.y * pdfState.scale,
                    w: f.rect.w * pdfState.scale,
                    h: f.rect.h * pdfState.scale,
                  },
                  key: f.key,
                }))}
                onFieldAdd={(rect) => {
                  // Convert from screen coords back to PDF coords
                  handleFieldAdd({
                    x: rect.x / pdfState.scale,
                    y: rect.y / pdfState.scale,
                    w: rect.w / pdfState.scale,
                    h: rect.h / pdfState.scale,
                  });
                }}
                onFieldSelect={handleFieldSelect}
                selectedFieldId={selectedFieldId || undefined}
                minFieldSize={10}
                gridSnap={0}
                showGuides={true}
              />
            </PDFViewer>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col border-l border-[#3c3c3c] bg-[#252526]">
          {/* Field Inspector */}
          <div className="flex-1 overflow-auto border-b border-[#3c3c3c]">
            <FieldInspector
              selectedField={selectedField}
              onUpdate={handleFieldUpdate}
              onDelete={handleFieldDelete}
            />
          </div>

          {/* JSON Preview */}
          <div className="h-64 overflow-auto">
            <JSONPreview
              fields={fields}
              maxHeight="100%"
              title="Field Schema"
            />
          </div>
        </div>
      </div>

      {/* Instructions Footer */}
      {fields.length === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white/60 text-sm">
          Click and drag on the PDF to create field rectangles
        </div>
      )}
    </div>
  );
}
