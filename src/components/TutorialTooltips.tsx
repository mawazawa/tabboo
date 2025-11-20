import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "@/icons";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  tabPrompt: string;
  celebration: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to SwiftFill",
    description: "Let's get you started with a quick tour. We'll teach you the fastest way to fill forms.",
    tabPrompt: "Press Tab to begin →",
    celebration: "Great start! 🎯"
  },
  {
    id: "tab-navigation",
    title: "Tab Navigation",
    description: "Tab is your best friend. It moves you through fields in the perfect order, just like a professional.",
    tabPrompt: "Press Tab to continue →",
    celebration: "You're a natural! ⚡"
  },
  {
    id: "autofill",
    title: "Smart Autofill",
    description: "Fields with a sparkle can be auto-filled from your vault. One click fills the field instantly.",
    tabPrompt: "Press Tab to continue →",
    celebration: "Perfect! ✨"
  },
  {
    id: "keyboard-power",
    title: "Keyboard Power User",
    description: "Shift+Tab goes back. Cmd+K opens quick actions. You're already faster than 90% of users.",
    tabPrompt: "Press Tab to finish →",
    celebration: "You're ready! 🚀"
  }
];

// Celebration confetti particles
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <div
    className="absolute w-2 h-2 rounded-full animate-confetti"
    style={{
      backgroundColor: color,
      left: `${Math.random() * 100}%`,
      animationDelay: `${delay}ms`,
    }}
  />
);

export const TutorialTooltips = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Check if tutorial has been shown before
    const tutorialShown = localStorage.getItem('tutorial-shown');
    if (!tutorialShown) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem('tutorial-shown', 'true');
  }, []);

  const handleNext = useCallback(() => {
    // Trigger celebration
    setShowCelebration(true);

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]); // Double tap pattern
    }

    // Brief celebration, then advance
    setTimeout(() => {
      setShowCelebration(false);
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleClose();
      }
    }, 800);
  }, [currentStep, handleClose]);

  // Tab key listener for muscle memory training
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handleClose]);

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const confettiColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] animate-in fade-in duration-300" />

      {/* Tutorial tooltip */}
      <div
        className="fixed z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      >
        <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl max-w-sm p-6 overflow-hidden">
          {/* Celebration confetti */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confettiColors.map((color, i) => (
                <ConfettiParticle key={i} delay={i * 50} color={color} />
              ))}
            </div>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-3 right-3 h-6 w-6 text-muted-foreground/60 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>

          {/* Celebration message */}
          {showCelebration ? (
            <div className="text-center py-4 animate-in zoom-in duration-200">
              <div className="text-3xl mb-2">{step.celebration.split(' ').pop()}</div>
              <p className="text-lg font-semibold text-primary">
                {step.celebration.replace(/[^\w\s!]/g, '').trim()}
              </p>
            </div>
          ) : (
            <>
              {/* Step counter */}
              <div className="flex items-center gap-1.5 mb-4">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index < currentStep
                        ? "w-6 bg-primary"
                        : index === currentStep
                        ? "w-6 bg-primary animate-pulse"
                        : "w-3 bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-foreground mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Tab prompt - the main CTA */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  Skip
                </button>

                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={handleNext}
                >
                  <kbd className="px-2 py-0.5 text-xs font-mono bg-background rounded border border-border shadow-sm">
                    Tab
                  </kbd>
                  <span className="text-xs font-medium text-primary">
                    {step.tabPrompt.replace('Press Tab to ', '').replace(' →', '')}
                  </span>
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
};
