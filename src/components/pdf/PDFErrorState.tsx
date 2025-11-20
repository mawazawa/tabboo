import { Card } from "@/components/ui/liquid-justice-temp";
import { AlertTriangle, AlertCircle } from "@/icons";

interface PDFErrorStateProps {
  type: 'error' | 'no-fields';
  formType: string;
  errorMessage?: string;
}

export const PDFErrorState = ({ type, formType, errorMessage }: PDFErrorStateProps) => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted/20">
      <Card className="p-6 max-w-md">
        <div className="text-center space-y-4">
          {type === 'error' ? (
            <>
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="font-semibold text-lg">Error Loading Form Fields</h3>
              <p className="text-sm text-muted-foreground">
                Failed to load {formType} form field definitions from the database.
              </p>
              {errorMessage && (
                <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {errorMessage}
                </p>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-warning" />
              <h3 className="font-semibold text-lg">No Form Fields Found</h3>
              <p className="text-sm text-muted-foreground">
                No field mappings found for {formType} in the database.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

