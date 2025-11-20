import React, { useState, useRef } from 'react';
import { FormViewer, FormType } from '@/components/FormViewer';
import { X, Move, Maximize2, Minimize2 } from '@/icons';
import { cn } from '@/lib/utils';
import type { FormData, FieldPosition } from '@/types/FormData';

interface CanvasFormViewerProps {
  formType: FormType;
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  fieldPositions: Record<string, FieldPosition>;
  updateFieldPosition: (field: string, position: FieldPosition) => void;
  currentFieldIndex: number;
  setCurrentFieldIndex: (index: number) => void;
  onClose?: () => void;
  initialPosition?: { x: number; y: number };
  initialScale?: number;
}

export const CanvasFormViewer: React.FC<CanvasFormViewerProps> = ({
  formType,
  formData,
  updateField,
  fieldPositions,
  updateFieldPosition,
  currentFieldIndex,
  setCurrentFieldIndex,
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialScale = 0.8
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, button, [role="button"]')) {
      return; // Don't drag if clicking on form elements
    }
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(prev + delta, 0.3), 2));
    }
  };

  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        className="fixed z-50 liquid-glass rounded-2xl cursor-move spring-smooth shadow-[var(--shadow-ultra)]"
        style={{
          left: position.x,
          top: position.y,
          width: '300px',
          height: '60px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center justify-between p-4 h-full relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm flex items-center justify-center border border-blue-200/30 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5)]">
              <Move size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800">{formType}</div>
              <div className="text-xs text-slate-500">Form Editor</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all spring-snappy hover:scale-110 active:scale-95"
            >
              <Maximize2 size={16} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all spring-snappy hover:scale-110 active:scale-95 text-red-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 liquid-glass rounded-2xl overflow-hidden spring-smooth",
        isDragging 
          ? "shadow-[var(--shadow-ultra-hover)] scale-[1.01]" 
          : "shadow-[var(--shadow-ultra)] hover:shadow-[var(--shadow-ultra-hover)]"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: `${850 * scale}px`,
        maxWidth: '90vw',
        maxHeight: '90vh',
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="h-14 liquid-glass border-b border-white/20 flex items-center justify-between px-6 cursor-move relative z-10 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.6)]">
        <div className="flex items-center gap-3 text-slate-700">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-sm p-1.5 rounded-lg text-blue-600 border border-blue-200/30 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5)]">
            <Move size={18} />
          </div>
          <span className="font-mono font-bold text-lg">{formType} Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all spring-snappy hover:scale-110 active:scale-95"
          >
            <Minimize2 size={18} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all spring-snappy hover:scale-110 active:scale-95 text-red-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="overflow-auto" style={{ height: 'calc(90vh - 56px)' }}>
        <div style={{ width: '850px', minHeight: '1100px' }}>
          <FormViewer
            formData={formData}
            updateField={updateField}
            currentFieldIndex={currentFieldIndex}
            setCurrentFieldIndex={setCurrentFieldIndex}
            fieldPositions={fieldPositions}
            updateFieldPosition={updateFieldPosition}
            formType={formType}
            zoom={1}
            fieldFontSize={12}
            highlightedField={null}
            validationErrors={{}}
            vaultData={null}
            isEditMode={true}
          />
        </div>
      </div>
    </div>
  );
};

