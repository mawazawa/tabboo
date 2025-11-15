import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "@/icons";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  position: { top: string; left: string };
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "drag-fields",
    title: "Drag to Reposition",
    description: "Click and drag the Move icon (⊕) on any field to reposition it. Smart alignment guides will appear to help you align fields perfectly.",
    position: { top: "20%", left: "50%" },
    arrowPosition: "top"
  },
  {
    id: "edit-mode",
    title: "Edit Mode",
    description: "Click the Move icon to toggle edit mode. Use arrow buttons for precise positioning or enter exact coordinates.",
    position: { top: "30%", left: "50%" },
    arrowPosition: "top"
  },
  {
    id: "autofill",
    title: "Smart Autofill",
    description: "Fields with a sparkle ✨ icon can be auto-filled from your Personal Data Vault. Click the sparkle button to instantly fill the field.",
    position: { top: "40%", left: "50%" },
    arrowPosition: "top"
  },
  {
    id: "keyboard",
    title: "Keyboard Shortcuts",
    description: "Press Tab/Shift+Tab to navigate between fields. Use Ctrl+K to open the command palette for quick actions.",
    position: { top: "50%", left: "50%" },
    arrowPosition: "top"
  }
];

export const TutorialTooltips = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if tutorial has been shown before
    const tutorialShown = localStorage.getItem('tutorial-shown');
    if (!tutorialShown) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('tutorial-shown', 'true');
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <>
      {/* Backdrop overlay - pointer events disabled so it doesn't block clicks */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] pointer-events-none animate-in fade-in duration-300" />
      
      {/* Tutorial tooltip */}
      <div
        className="fixed z-[9999] animate-in fade-in slide-in-from-top-4 duration-500"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      >
        <div className="bg-card border-2 border-primary rounded-xl shadow-lg max-w-md p-6 pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 -mt-2 -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-foreground mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tutorial
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow pointer */}
        {step.arrowPosition && (
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${
              step.arrowPosition === 'top'
                ? 'border-b-primary -top-4 left-1/2 -translate-x-1/2'
                : step.arrowPosition === 'bottom'
                ? 'border-t-primary -bottom-4 left-1/2 -translate-x-1/2'
                : step.arrowPosition === 'left'
                ? 'border-r-primary -left-4 top-1/2 -translate-y-1/2'
                : 'border-l-primary -right-4 top-1/2 -translate-y-1/2'
            }`}
          />
        )}
      </div>
    </>
  );
};
