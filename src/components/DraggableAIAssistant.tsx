import { useState, useRef, useEffect } from "react";
import { MessageSquare, Minimize2, Maximize2, GripVertical } from "lucide-react";
import { AIAssistant } from "./AIAssistant";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Props {
  formContext: any;
  vaultData: any;
  isVisible: boolean;
  onToggleVisible: () => void;
}

export const DraggableAIAssistant = ({ formContext, vaultData, isVisible, onToggleVisible }: Props) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: position.x,
      offsetY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - (isMinimized ? 64 : 400), dragRef.current.offsetX + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - (isMinimized ? 64 : 600), dragRef.current.offsetY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMinimized]);

  if (!isVisible && !isMinimized) return null;

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-spring rounded-2xl shadow-3point",
        "bg-card/95 backdrop-blur-xl border-2 border-border/30",
        isDragging ? "cursor-grabbing scale-105 shadow-glow" : "cursor-grab",
        isMinimized ? "w-14 h-14" : "w-[400px] h-[600px]"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {isMinimized ? (
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-full rounded-2xl hover:bg-primary/20"
          onClick={() => setIsMinimized(false)}
        >
          <MessageSquare className="h-6 w-6 text-primary" strokeWidth={0.5} />
        </Button>
      ) : (
        <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
          {/* Draggable Header */}
          <div 
            className="flex items-center justify-between p-3 border-b bg-card/50 rounded-t-2xl cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
              >
                <Minimize2 className="h-3.5 w-3.5" strokeWidth={0.5} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible();
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={0.5} />
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
