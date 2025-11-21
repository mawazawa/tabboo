/**
 * Form Comparison Demo Page
 *
 * Foolproof workflow for comparing React forms with original PDFs
 * and making field position adjustments.
 *
 * Features:
 * - Side-by-side view: React form vs PDF with overlay
 * - Color-coded field rectangles
 * - Click-to-adjust field positions
 * - Clear "Save as Template" workflow
 * - Field list with positions
 *
 * @author Claude Code
 * @since November 2025
 */

import React, { useState, useCallback, useRef } from 'react';
import { DV100PixelPerfect } from '@/components/forms/DV100PixelPerfect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Download,
  Eye,
  EyeOff,
  Move,
  Check,
  AlertCircle,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

// Field type colors
const FIELD_COLORS = {
  text: '#3b82f6',      // Blue
  checkbox: '#22c55e',  // Green
  textarea: '#f59e0b',  // Orange
  date: '#8b5cf6',      // Purple
  select: '#ec4899',    // Pink
};

// Demo field positions (would come from mapper)
const DEMO_FIELDS = [
  { id: 'f1', key: 'protectedPersonName', type: 'text', page: 1, rect: { x: 72, y: 200, w: 200, h: 20 } },
  { id: 'f2', key: 'protectedPersonAge', type: 'text', page: 1, rect: { x: 280, y: 200, w: 60, h: 20 } },
  { id: 'f3', key: 'caseNumber', type: 'text', page: 1, rect: { x: 450, y: 120, w: 120, h: 20 } },
  { id: 'f4', key: 'county', type: 'text', page: 1, rect: { x: 200, y: 150, w: 150, h: 20 } },
  { id: 'f5', key: 'restrainedPersonName', type: 'text', page: 1, rect: { x: 72, y: 350, w: 200, h: 20 } },
  { id: 'f6', key: 'abuseDescription', type: 'textarea', page: 2, rect: { x: 72, y: 450, w: 468, h: 100 } },
  { id: 'f7', key: 'relationshipMarried', type: 'checkbox', page: 2, rect: { x: 72, y: 200, w: 13, h: 13 } },
  { id: 'f8', key: 'signatureDate', type: 'date', page: 3, rect: { x: 72, y: 500, w: 150, h: 20 } },
];

export default function FormComparisonDemo() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [fields, setFields] = useState(DEMO_FIELDS);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Get fields for current page
  const currentPageFields = fields.filter(f => f.page === currentPage);

  // Handle field selection
  const handleFieldSelect = useCallback((fieldId: string) => {
    setSelectedFieldId(fieldId);
  }, []);

  // Handle field position update (from dragging)
  const handleFieldMove = useCallback((fieldId: string, newRect: { x: number; y: number; w: number; h: number }) => {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, rect: newRect } : f
    ));
    setHasUnsavedChanges(true);
  }, []);

  // Save template
  const handleSaveTemplate = useCallback(() => {
    const templateData = {
      formType: 'DV-100',
      version: '2025-01-01',
      fields: fields.map(({ id, ...rest }) => rest),
      savedAt: new Date().toISOString(),
    };

    // In production, this would save to database
    console.log('Saving template:', templateData);

    // Download as JSON for now
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dv100-template-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setHasUnsavedChanges(false);
    toast({
      title: '✓ Template Saved',
      description: `${fields.length} field positions saved to template`,
    });
  }, [fields, toast]);

  // Reset to original positions
  const handleReset = useCallback(() => {
    if (window.confirm('Reset all field positions to original? This cannot be undone.')) {
      setFields(DEMO_FIELDS);
      setHasUnsavedChanges(false);
      toast({
        title: 'Reset Complete',
        description: 'Field positions restored to original',
      });
    }
  }, [toast]);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* HEADER - Instructions & Controls */}
      <header className="bg-white border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Form Comparison & Adjustment</h1>
              <p className="text-sm text-gray-500">DV-100 Request for Domestic Violence Restraining Order</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unsaved indicator */}
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </span>
            )}

            {/* Zoom controls */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(50, z - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(200, z + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Toggle overlay */}
            <Button
              variant={showOverlay ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOverlay(!showOverlay)}
            >
              {showOverlay ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              Fields
            </Button>

            {/* Reset */}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            {/* Save */}
            <Button
              size="sm"
              onClick={handleSaveTemplate}
              className={hasUnsavedChanges ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </header>

      {/* INSTRUCTIONS BANNER */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-start gap-2 text-sm text-blue-800">
          <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>How to use:</strong> Compare your React form (left) with the original PDF (right).
            Click on colored rectangles to select fields. Drag to adjust positions.
            The field list below shows all fields and their coordinates.
            <strong className="text-green-700 ml-2">Green "Save Template" button saves all positions.</strong>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Side by Side */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - React Form */}
        <div className="w-1/2 border-r bg-white overflow-auto">
          <div className="sticky top-0 bg-gray-50 border-b px-4 py-2 z-10">
            <h2 className="font-semibold text-gray-700">Your React Form</h2>
            <p className="text-xs text-gray-500">This is what you built</p>
          </div>
          <div className="p-4" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
            <DV100PixelPerfect readOnly />
          </div>
        </div>

        {/* RIGHT PANEL - PDF with Overlay */}
        <div className="w-1/2 bg-gray-900 overflow-auto" ref={pdfContainerRef}>
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-2 z-10">
            <h2 className="font-semibold text-white">Original PDF with Field Overlay</h2>
            <p className="text-xs text-gray-400">Click fields to select, drag to adjust</p>
          </div>
          <div className="p-4 relative" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
            {/* PDF Image (using SVG for demo) */}
            <div className="relative bg-white shadow-lg" style={{ width: '612px', height: '792px' }}>
              <img
                src="/dv100.svg"
                alt="DV-100 Page 1"
                className="w-full h-full object-contain"
                draggable={false}
              />

              {/* Field Overlays */}
              {showOverlay && currentPageFields.map(field => (
                <div
                  key={field.id}
                  className={`absolute border-2 cursor-move transition-all ${
                    selectedFieldId === field.id
                      ? 'ring-2 ring-white ring-offset-2'
                      : 'hover:ring-2 hover:ring-white/50'
                  }`}
                  style={{
                    left: field.rect.x,
                    top: field.rect.y,
                    width: field.rect.w,
                    height: field.rect.h,
                    borderColor: FIELD_COLORS[field.type as keyof typeof FIELD_COLORS] || '#fff',
                    backgroundColor: `${FIELD_COLORS[field.type as keyof typeof FIELD_COLORS] || '#fff'}33`,
                  }}
                  onClick={() => handleFieldSelect(field.id)}
                  title={`${field.key} (${field.type})`}
                >
                  {/* Field label */}
                  <div
                    className="absolute -top-5 left-0 text-[10px] font-mono px-1 rounded whitespace-nowrap"
                    style={{
                      backgroundColor: FIELD_COLORS[field.type as keyof typeof FIELD_COLORS] || '#fff',
                      color: '#fff'
                    }}
                  >
                    {field.key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL - Field List */}
      <div className="h-64 border-t bg-white flex">
        {/* Field List */}
        <div className="flex-1 border-r">
          <div className="bg-gray-50 border-b px-4 py-2">
            <h3 className="font-semibold text-sm">Field Positions ({fields.length} fields)</h3>
          </div>
          <ScrollArea className="h-[calc(100%-40px)]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Field Key</th>
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-left px-4 py-2 font-medium">Page</th>
                  <th className="text-left px-4 py-2 font-medium">X</th>
                  <th className="text-left px-4 py-2 font-medium">Y</th>
                  <th className="text-left px-4 py-2 font-medium">W</th>
                  <th className="text-left px-4 py-2 font-medium">H</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(field => (
                  <tr
                    key={field.id}
                    className={`border-b cursor-pointer hover:bg-gray-50 ${
                      selectedFieldId === field.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleFieldSelect(field.id)}
                  >
                    <td className="px-4 py-2 font-mono text-xs">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: FIELD_COLORS[field.type as keyof typeof FIELD_COLORS] }}
                      />
                      {field.key}
                    </td>
                    <td className="px-4 py-2">{field.type}</td>
                    <td className="px-4 py-2">{field.page}</td>
                    <td className="px-4 py-2 font-mono">{field.rect.x}</td>
                    <td className="px-4 py-2 font-mono">{field.rect.y}</td>
                    <td className="px-4 py-2 font-mono">{field.rect.w}</td>
                    <td className="px-4 py-2 font-mono">{field.rect.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Selected Field Details */}
        <div className="w-80">
          <div className="bg-gray-50 border-b px-4 py-2">
            <h3 className="font-semibold text-sm">Selected Field</h3>
          </div>
          {selectedField ? (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500">Field Key</label>
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {selectedField.key}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Type</label>
                  <div className="text-sm bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: FIELD_COLORS[selectedField.type as keyof typeof FIELD_COLORS] }}
                    />
                    {selectedField.type}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Page</label>
                  <div className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedField.page}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-500">X</label>
                  <input
                    type="number"
                    value={selectedField.rect.x}
                    onChange={(e) => handleFieldMove(selectedField.id, { ...selectedField.rect, x: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y</label>
                  <input
                    type="number"
                    value={selectedField.rect.y}
                    onChange={(e) => handleFieldMove(selectedField.id, { ...selectedField.rect, y: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">W</label>
                  <input
                    type="number"
                    value={selectedField.rect.w}
                    onChange={(e) => handleFieldMove(selectedField.id, { ...selectedField.rect, w: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">H</label>
                  <input
                    type="number"
                    value={selectedField.rect.h}
                    onChange={(e) => handleFieldMove(selectedField.id, { ...selectedField.rect, h: Number(e.target.value) })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Move className="h-3 w-3" />
                Edit values above or drag the field on the PDF
              </p>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click a field to edit its position</p>
            </div>
          )}
        </div>
      </div>

      {/* COLOR LEGEND */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-6">
        <span className="text-xs text-gray-400">Field Types:</span>
        {Object.entries(FIELD_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-xs text-white">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
