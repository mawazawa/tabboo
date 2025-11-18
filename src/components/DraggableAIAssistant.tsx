import { useState, useRef, useEffect, memo } from "react";
import { MessageSquare, Minimize2, Maximize2, GripVertical } from "@/icons";
import { AIAssistant } from "./AIAssistant";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { FormData, PersonalVaultData } from "@/types/FormData";

interface Props {
  formContext: FormData;
  vaultData: PersonalVaultData | null;
  isVisible: boolean;
  onToggleVisible: () => void;
}

export const DraggableAIAssistant = ({ formContext, vaultData, isVisible, onToggleVisible }: Props) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; pointerId: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start drag if clicking interactive elements
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;

    // Capture pointer for smooth drag (works on touch + mouse + pen)
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: position.x,
      offsetY: position.y,
      pointerId: e.pointerId,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current || e.pointerId !== dragRef.current.pointerId) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - (isMinimized ? 64 : 400), dragRef.current.offsetX + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - (isMinimized ? 64 : 600), dragRef.current.offsetY + deltaY)),
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragRef.current || e.pointerId !== dragRef.current.pointerId) return;

      // Release pointer capture
      if (containerRef.current) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }

      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp); // Handle interruptions

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, isMinimized]);

  if (!isVisible && !isMinimized) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 touch-none liquid-glass",
        // Smooth transitions with spring easing
        "transition-all duration-300 ease-out",
        // Premium drag states with enhanced depth
        isDragging
          ? "cursor-grabbing scale-[1.03] shadow-[0_16px_64px_hsl(220_13%_13%/0.20),0_32px_128px_hsl(220_13%_13%/0.15),inset_0_2px_0_hsl(0_0%_100%/0.7)]"
          : "cursor-grab hover:shadow-[0_12px_48px_hsl(220_13%_13%/0.12),0_24px_96px_hsl(220_13%_13%/0.08),inset_0_1px_0_hsl(0_0%_100%/0.6)]",
        // Responsive sizing with smooth animation
        isMinimized ? "w-14 h-14 animate-float" : "w-[400px] h-[600px]"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none', // Prevent browser gestures during drag
      }}
      onPointerDown={handlePointerDown}
    >
      {isMinimized ? (
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-full rounded-2xl hover:bg-primary/20 hover:scale-105 transition-all duration-300 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5)] active:scale-95"
          aria-label="Expand AI Assistant"
          onClick={() => setIsMinimized(false)}
        >
          <MessageSquare className="h-6 w-6 text-primary animate-pulse" strokeWidth={0.5} />
          <span className="sr-only">Expand AI Assistant</span>
        </Button>
      ) : (
        <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
          {/* Draggable Header with Premium Liquid Glass */}
          <div
            className="flex items-center justify-between p-3 border-b border-white/20 bg-background/30 backdrop-blur-xl rounded-t-2xl cursor-grab active:cursor-grabbing relative z-10 transition-all duration-300 hover:bg-background/35 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.4),0_1px_2px_hsl(220_13%_13%/0.05)]"
            onPointerDown={handlePointerDown}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" strokeWidth={0.5} />
              <MessageSquare className="h-4 w-4 text-primary" strokeWidth={0.5} />
              <span className="font-semibold text-sm">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Minimize AI Assistant"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
              >
                <Minimize2 className="h-3.5 w-3.5" strokeWidth={0.5} />
                <span className="sr-only">Minimize</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Close AI Assistant"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible();
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={0.5} />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* AI Assistant Content */}
          <div className="flex-1 overflow-hidden">
            <AIAssistant formContext={formContext} vaultData={vaultData} />
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with memo to prevent unnecessary re-renders
export default memo(DraggableAIAssistant);
