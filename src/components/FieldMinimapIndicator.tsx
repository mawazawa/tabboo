interface Props {
  fieldPosition: { top: number; left: number };
  isActive: boolean;
}

export const FieldMinimapIndicator = ({ fieldPosition, isActive }: Props) => {
  if (!isActive) return null;

  return (
    <div
      className="absolute pointer-events-none z-10 transition-all duration-100"
      style={{
        top: `${fieldPosition.top}%`,
        left: `${fieldPosition.left}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        {/* Pulsing outer ring */}
        <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
        {/* Solid inner dot */}
        <div className="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
      </div>
    </div>
  );
};
