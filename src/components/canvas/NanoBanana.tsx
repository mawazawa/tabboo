import React, { useState, useEffect } from 'react';
import { Banana, Sparkles, Zap, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NanoBananaProps {
  context?: string; // e.g., 'DV-100', 'CLETS-001'
  onMoodChange?: (mood: string) => void;
}

export const NanoBanana: React.FC<NanoBananaProps> = ({ context, onMoodChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMood, setActiveMood] = useState<'neutral' | 'focus' | 'urgent' | 'calm'>('neutral');

  // Auto-set mood based on context (Mock "Sentinel" logic)
  useEffect(() => {
    if (!context) return;

    let newMood: 'neutral' | 'focus' | 'urgent' | 'calm' = 'neutral';
    if (context.includes('DV-100')) newMood = 'urgent';
    else if (context.includes('FL-150')) newMood = 'focus';
    else if (context.includes('CLETS')) newMood = 'urgent';
    else newMood = 'calm';

    if (newMood !== activeMood) {
      setActiveMood(newMood);
      onMoodChange?.(newMood);
    }
  }, [context]);

  const moods = {
    neutral: { color: 'bg-background/80', icon: <Banana className="h-5 w-5" />, label: 'Neutral' },
    focus: { color: 'bg-blue-950/30 border-blue-500/20', icon: <Zap className="h-4 w-4 text-blue-400" />, label: 'Deep Focus' },
    urgent: { color: 'bg-red-950/30 border-red-500/20', icon: <Sparkles className="h-4 w-4 text-red-400" />, label: 'High Alert' },
    calm: { color: 'bg-emerald-950/30 border-emerald-500/20', icon: <Moon className="h-4 w-4 text-emerald-400" />, label: 'Serenity' },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end flex-col gap-2">
      {/* Mood Menu */}
      <div
        className={cn(
          "flex flex-col gap-2 transition-all duration-300 origin-bottom-right",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        )}
      >
        {(Object.keys(moods) as Array<keyof typeof moods>).map((mood) => (
          <Button
            key={mood}
            size="icon"
            variant="outline"
            className={cn(
              "rounded-full h-10 w-10 backdrop-blur-md border transition-all hover:scale-110",
              activeMood === mood ? "ring-2 ring-primary border-primary" : "border-border/50",
              moods[mood].color
            )}
            onClick={() => {
              setActiveMood(mood);
              onMoodChange?.(mood);
              setIsOpen(false);
            }}
          >
            {moods[mood].icon}
          </Button>
        ))}
      </div>

      {/* Trigger */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-xl backdrop-blur-xl transition-all duration-500 hover:scale-110 hover:rotate-12",
                isOpen ? "rotate-45 bg-primary" : "bg-background/50 hover:bg-background/80 border border-primary/20"
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative">
                <Banana 
                  className={cn(
                    "h-6 w-6 transition-all duration-500", 
                    isOpen ? "text-primary-foreground" : "text-yellow-400 fill-yellow-400/20"
                  )} 
                />
                {/* Pulse effect for "Sentinel" active state */}
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Nano Banana Sentinel (Active)</p>
            <p className="text-xs text-muted-foreground">Context: {context || 'Idle'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

