import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, SkipForward, CheckCircle2 } from "lucide-react";
import { ManifestField } from "@/hooks/use-field-mapping";

interface MappingHUDProps {
  field: ManifestField | undefined;
  index: number;
  total: number;
  onSkip: () => void;
  onPrev: () => void;
}

export function MappingHUD({ field, index, total, onSkip, onPrev }: MappingHUDProps) {
  if (!field) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-2xl px-4 pointer-events-none">
      <Card className="p-4 bg-black/80 backdrop-blur-md border-neon-orange/50 text-white shadow-[0_0_30px_rgba(255,95,31,0.3)] w-full flex items-center justify-between gap-4 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-neon-orange text-neon-orange font-mono">
              {index + 1} / {total}
            </Badge>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Auto-Pilot Mode</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-neon-orange font-mono tracking-tight">
              {field.name}
            </h3>
            <Badge className="bg-white/10 hover:bg-white/20 text-white border-none">
              {field.type}
            </Badge>
          </div>
          <p className="text-sm text-gray-300 max-w-md truncate">
            {field.label || "Draw a box for this field"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onPrev} className="text-gray-400 hover:text-white hover:bg-white/10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="h-12 w-px bg-white/10 mx-2" />
          
          <Button variant="secondary" onClick={onSkip} className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10">
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
        </div>
      </Card>
      
      <div className="bg-neon-orange text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
        Draw Box to Map & Auto-Advance
      </div>
    </div>
  );
}

