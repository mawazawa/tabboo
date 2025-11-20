import React, { useRef, useState, ReactNode } from 'react';

interface CanvasProps {
  children: ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  
  // Touch handling references
  const touchDist = useRef(0);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomSensitivity = 0.005;
      const newScale = Math.min(Math.max(scale - e.deltaY * zoomSensitivity, 0.3), 3);
      setScale(newScale);
    } else {
      setPosition(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; 
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      isDragging.current = true;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = newDist - touchDist.current;
      touchDist.current = newDist;
      setScale(s => Math.min(Math.max(s + delta * 0.005, 0.3), 3));
    } else if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Premium Canvas Background with Depth
  // Uses subtle gradient overlay for depth perception
  const gridStyle = {
    backgroundImage: `
      radial-gradient(#cbd5e1 1px, transparent 1px),
      linear-gradient(to bottom, hsl(220 15% 98% / 0.5), hsl(220 15% 96% / 0.3))
    `,
    backgroundSize: `${32 * scale}px ${32 * scale}px, 100% 100%`,
    backgroundPosition: `${position.x}px ${position.y}px, 0 0`,
    backgroundColor: 'hsl(220 15% 98%)'
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative cursor-grab touch-none"
      style={gridStyle}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
        }}
        className="absolute top-0 left-0 w-full h-full"
      >
        {children}
      </div>
      
      {/* Navigation Controls Overlay */}
      <div className="absolute bottom-8 left-24 flex flex-col gap-2 pointer-events-none">
        <div className="liquid-glass p-2 rounded-lg shadow-[var(--shadow-diffused)] pointer-events-auto flex gap-2 text-xs text-slate-600 font-mono font-medium">
           <span>X: {position.x.toFixed(0)}</span>
           <span>Y: {position.y.toFixed(0)}</span>
           <span>Z: {(scale * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

