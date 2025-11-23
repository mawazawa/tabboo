import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/liquid-justice-temp";
import { Keyboard, FileText, Shield, Sparkles, CheckCircle, Settings } from "@/icons";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  hint?: string;
  targetSelector?: string; // CSS selector for element to spotlight
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'; // Card position relative to spotlight
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to SwiftFill",
    description: "Let's get you started with the fastest way to fill legal forms. This quick tour will teach you our signature shortcut.",
    icon: <Sparkles className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue",
    position: 'center'
  },
  {
    title: "Tab is Your Best Friend",
    description: "In SwiftFill, Tab moves you forward through everything - fields, dialogs, confirmations. Just Tab, Tab, Tab.",
    icon: <Keyboard className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue",
    position: 'center'
  },
  {
    title: "The Control Toolbar",
    description: "Zoom, edit mode, autofill from vault - all your tools are here. Quick actions at your fingertips.",
    icon: <Settings className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue",
    targetSelector: '[data-tour="toolbar"]',
    position: 'bottom'
  },
  {
    title: "Navigate Form Fields",
    description: "Press Tab to jump between form fields. Shift+Tab goes backwards. Your hands never leave the keyboard.",
    icon: <FileText className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue",
    targetSelector: '[data-tour="form-viewer"]',
    position: 'right'
  },
  {
    title: "Your Personal Data Vault",
    description: "Save your info once, auto-fill every form. Name, address, contact details - all encrypted and ready to use.",
    icon: <Shield className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to continue",
    targetSelector: '[data-tour="vault-button"]',
    position: 'bottom'
  },
  {
    title: "You're All Set!",
    description: "Remember: Tab moves you forward. It's that simple. Now let's fill some forms.",
    icon: <CheckCircle className="w-8 h-8" strokeWidth={1.5} />,
    hint: "Press Tab to start",
    position: 'center'
  }
];

const STORAGE_KEY = 'swiftfill-tour-completed';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const WelcomeTour = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tabPressCount, setTabPressCount] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      // Small delay to let the UI render first
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  // Update spotlight position when step changes
  useEffect(() => {
    if (!isVisible) return;

    const step = TOUR_STEPS[currentStep];
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;
        setSpotlightRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        });
      } else {
        setSpotlightRect(null);
      }
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep, isVisible]);

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

  // Calculate card position based on spotlight
  const getCardStyle = (): React.CSSProperties => {
    if (!spotlightRect || step.position === 'center') {
      return {};
    }

    const cardWidth = 400;
    const cardHeight = 380;
    const gap = 24;

    switch (step.position) {
      case 'bottom':
        return {
          position: 'absolute',
          top: spotlightRect.top + spotlightRect.height + gap,
          left: Math.max(16, Math.min(
            spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2,
            window.innerWidth - cardWidth - 16
          )),
        };
      case 'top':
        return {
          position: 'absolute',
          top: spotlightRect.top - cardHeight - gap,
          left: Math.max(16, Math.min(
            spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2,
            window.innerWidth - cardWidth - 16
          )),
        };
      case 'right':
        return {
          position: 'absolute',
          top: Math.max(16, spotlightRect.top),
          left: Math.min(spotlightRect.left + spotlightRect.width + gap, window.innerWidth - cardWidth - 16),
        };
      case 'left':
        return {
          position: 'absolute',
          top: Math.max(16, spotlightRect.top),
          left: Math.max(16, spotlightRect.left - cardWidth - gap),
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible, black = hidden */}
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent overlay with mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight ring highlight */}
      {spotlightRect && (
        <div
          className="absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent pointer-events-none animate-pulse"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      {/* Tour card */}
      <div
        className={`pointer-events-auto ${!spotlightRect || step.position === 'center' ? 'flex items-center justify-center h-full' : ''}`}
        style={spotlightRect && step.position !== 'center' ? getCardStyle() : {}}
      >
        <Card
          ref={cardRef}
          className="w-full max-w-md mx-4 overflow-hidden shadow-2xl border-2 border-primary/20 bg-background"
          style={spotlightRect && step.position !== 'center' ? { margin: 0 } : {}}
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6 text-center space-y-4">
            {/* Icon */}
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {step.icon}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Tab hint with visual pulse */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-pulse">
                <Keyboard className="w-4 h-4" strokeWidth={2} />
                {step.hint}
              </div>
            </div>

            {/* Step counter */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
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
              Press Esc to skip
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Export function to reset tour (useful for testing)
export const resetWelcomeTour = () => {
  localStorage.removeItem(STORAGE_KEY);
};
