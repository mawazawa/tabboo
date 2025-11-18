interface AlignmentGuidesProps {
  guides: { x: number[]; y: number[] };
}

/**
 * Visual alignment guides shown during field dragging
 * Displays vertical (X) and horizontal (Y) guide lines when fields snap to alignment
 */
export function AlignmentGuides({ guides }: AlignmentGuidesProps) {
  return (
    <>
      {/* Vertical alignment guides */}
      {guides.x.map((x, i) => (
        <div
          key={`guide-x-${i}`}
          className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-lg pointer-events-none z-40 animate-in fade-in duration-100"
          style={{ left: `${x}%` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-accent text-accent-foreground text-xs px-2 py-1 rounded-t">
            {x.toFixed(1)}%
          </div>
        </div>
      ))}

      {/* Horizontal alignment guides */}
      {guides.y.map((y, i) => (
        <div
          key={`guide-y-${i}`}
          className="absolute left-0 right-0 h-0.5 bg-accent shadow-lg pointer-events-none z-40 animate-in fade-in duration-100"
          style={{ top: `${y}%` }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-accent text-accent-foreground text-xs px-2 py-1 rounded-l">
            {y.toFixed(1)}%
          </div>
        </div>
      ))}
    </>
  );
}
