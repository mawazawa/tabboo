import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/liquid-justice-temp";
import { Keyboard, FileText, Shield, Sparkles, CheckCircle } from "@/icons";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  hint?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to SwiftFill",
    description: "Let's get you started with the fastest way to fill legal forms. This quick tour will teach you our signature shortcut.",
    icon: <Sparkles className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue"
  },
  {
    title: "Tab is Your Best Friend",
    description: "In SwiftFill, Tab moves you forward through everything - fields, dialogs, confirmations. Just Tab, Tab, Tab.",
    icon: <Keyboard className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue"
  },
  {
    title: "Navigate Form Fields",
    description: "Press Tab to jump between form fields. Shift+Tab goes backwards. Your hands never leave the keyboard.",
    icon: <FileText className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue"
  },
  {
    title: "Your Personal Data Vault",
    description: "Save your info once, auto-fill every form. Name, address, contact details - all encrypted and ready to use.",
    icon: <Shield className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue"
  },
  {
    title: "You're All Set!",
    description: "Remember: Tab moves you forward. It's that simple. Now let's fill some forms.",
    icon: <CheckCircle className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to start"
  }
];

const STORAGE_KEY = 'swiftfill-tour-completed';

export const WelcomeTour = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tabPressCount, setTabPressCount] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    setTabPressCount(prev => prev + 1);
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handleComplete]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 overflow-hidden shadow-2xl border-2 border-primary/20">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {step.icon}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Tab hint with visual pulse */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-pulse">
              <Keyboard className="w-4 h-4" strokeWidth={2} />
              {step.hint}
            </div>
          </div>

          {/* Step counter */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-primary w-6'
                    : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Tab counter - shows muscle memory building */}
          {tabPressCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Tab presses: {tabPressCount} - You're getting it!
            </p>
          )}

          {/* Skip option */}
          <button
            onClick={handleComplete}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Press Esc to skip tour
          </button>
        </div>
      </Card>
    </div>
  );
};

// Export function to reset tour (useful for testing)
export const resetWelcomeTour = () => {
  localStorage.removeItem(STORAGE_KEY);
};
