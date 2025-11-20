import { Move, Keyboard } from "@/icons";

export const EditModeBanner = () => {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-500/95 text-white rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-top border-2 border-amber-400">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Move className="h-5 w-5" />
          <div className="absolute inset-0 bg-white/30 blur-sm animate-pulse" />
        </div>
        <div>
          <div className="font-bold text-sm">✅ DRAG MODE ACTIVE</div>
          <div className="text-xs flex items-center gap-2 mt-0.5">
            <span className="font-semibold">Click & drag any field to reposition</span>
            <span className="opacity-70">• Or use</span>
            <Keyboard className="h-3 w-3 inline" />
            <span className="opacity-70">arrow keys</span>
            <span className="opacity-70">• Press E or Esc to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

