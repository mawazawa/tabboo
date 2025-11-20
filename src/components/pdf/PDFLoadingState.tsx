import { Loader2 } from "@/icons";

interface PDFLoadingStateProps {
  loadProgress: number;
  formType: string;
}

export const PDFLoadingState = ({ loadProgress, formType }: PDFLoadingStateProps) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-50">
      <div className="w-full max-w-md bg-card rounded-lg border-2 shadow-3point chamfered p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Loading PDF Form</h3>
            <p className="text-sm text-muted-foreground">Preparing your {formType} form...</p>
          </div>
          {loadProgress > 0 && loadProgress < 100 && (
            <div className="w-full">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">{loadProgress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

