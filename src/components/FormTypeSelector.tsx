import { useState } from 'react';
import { FileText, AlertTriangle, Info } from '@/icons';
import { Button, Card, Badge, Label } from '@/components/ui/liquid-justice-temp';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FormType } from './FormViewer';

interface FormMetadata {
  formNumber: string;
  formName: string;
  description: string;
  pages: number;
  fields: number;
  estimatedMinutes: number;
  complexity: 'simple' | 'moderate' | 'complex';
  status: 'production' | 'beta' | 'alpha';
  requiredForms?: string[];
}

const FORM_METADATA: Record<FormType, FormMetadata> = {
  'FL-320': {
    formNumber: 'FL-320',
    formName: 'Responsive Declaration to Request for Order',
    description: 'Used to respond to a Request for Order (FL-300) in family law cases',
    pages: 4,
    fields: 64,
    estimatedMinutes: 45,
    complexity: 'moderate',
    status: 'production',
  },
  'DV-100': {
    formNumber: 'DV-100',
    formName: 'Request for Domestic Violence Restraining Order',
    description: 'Petition for domestic violence restraining order with temporary orders',
    pages: 13,
    fields: 837,
    estimatedMinutes: 90,
    complexity: 'complex',
    status: 'beta',
    requiredForms: ['CLETS-001'],
  },
  'DV-105': {
    formNumber: 'DV-105',
    formName: 'Request for Child Custody and Visitation Orders',
    description: 'Attachment for child custody and visitation in DV cases',
    pages: 6,
    fields: 466,
    estimatedMinutes: 60,
    complexity: 'complex',
    status: 'beta',
  },
};

interface FormTypeSelectorProps {
  currentFormType: FormType;
  onFormTypeChange: (newFormType: FormType) => void;
  hasUnsavedChanges: boolean;
}

export function FormTypeSelector({
  currentFormType,
  onFormTypeChange,
  hasUnsavedChanges,
}: FormTypeSelectorProps) {
  const [pendingFormType, setPendingFormType] = useState<FormType | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleFormTypeChange = (newFormType: FormType) => {
    if (newFormType === currentFormType) {
      return; // No change
    }

    if (hasUnsavedChanges) {
      // Show confirmation dialog
      setPendingFormType(newFormType);
      setShowConfirmDialog(true);
    } else {
      // Directly change form type
      onFormTypeChange(newFormType);
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingFormType) {
      onFormTypeChange(pendingFormType);
      setShowConfirmDialog(false);
      setPendingFormType(null);
    }
  };

  const handleCancelSwitch = () => {
    setShowConfirmDialog(false);
    setPendingFormType(null);
  };

  const currentFormMetadata = FORM_METADATA[currentFormType];
  const statusColors = {
    production: 'default',
    beta: 'secondary',
    alpha: 'outline',
  } as const;

  const complexityColors = {
    simple: 'default',
    moderate: 'secondary',
    complex: 'destructive',
  } as const;

  return (
    <>
      <div className="flex items-center gap-3">
        <Label htmlFor="form-type-select" className="text-sm font-medium whitespace-nowrap">
          Form Type:
        </Label>
        <Select value={currentFormType} onValueChange={(value) => handleFormTypeChange(value as FormType)}>
          <SelectTrigger id="form-type-select" className="w-[280px]">
            <SelectValue placeholder="Select a form type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>California Judicial Council Forms</SelectLabel>
              {Object.entries(FORM_METADATA).map(([formType, metadata]) => (
                <SelectItem key={formType} value={formType}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{metadata.formNumber}</span>
                    {metadata.status !== 'production' && (
                      <Badge variant={statusColors[metadata.status]} className="text-xs">
                        {metadata.status}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Current Form Info Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentFormMetadata.pages} pages</span>
          <span>•</span>
          <span>{currentFormMetadata.fields} fields</span>
          <span>•</span>
          <span>~{currentFormMetadata.estimatedMinutes} min</span>
          {currentFormMetadata.status !== 'production' && (
            <>
              <span>•</span>
              <Badge variant={statusColors[currentFormMetadata.status]} className="text-xs">
                {currentFormMetadata.status}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <DialogTitle>Unsaved Changes</DialogTitle>
            </div>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                You have unsaved changes on the current form ({currentFormType}).
                Switching forms will discard these changes.
              </p>
              {pendingFormType && (
                <Card className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{FORM_METADATA[pendingFormType].formNumber}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {FORM_METADATA[pendingFormType].formName}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant={complexityColors[FORM_METADATA[pendingFormType].complexity]}>
                      {FORM_METADATA[pendingFormType].complexity}
                    </Badge>
                    <span>{FORM_METADATA[pendingFormType].pages} pages</span>
                    <span>•</span>
                    <span>{FORM_METADATA[pendingFormType].fields} fields</span>
                  </div>
                  {FORM_METADATA[pendingFormType].requiredForms && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 mt-0.5" />
                      <span>
                        Requires: {FORM_METADATA[pendingFormType].requiredForms?.join(', ')}
                      </span>
                    </div>
                  )}
                </Card>
              )}
              <p className="text-sm text-destructive font-medium">
                Are you sure you want to switch forms without saving?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSwitch}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmSwitch}>
              Discard Changes & Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Extended Form Info Panel (for mobile or expanded view)
interface FormInfoPanelProps {
  formType: FormType;
  compact?: boolean;
}

export function FormInfoPanel({ formType, compact = false }: FormInfoPanelProps) {
  const metadata = FORM_METADATA[formType];

  if (compact) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <FileText className="h-3 w-3" />
        <span>{metadata.formNumber}</span>
        <span>•</span>
        <span>{metadata.pages} pages</span>
        <span>•</span>
        <span>{metadata.fields} fields</span>
      </div>
    );
  }

  return (
    <Card liquidGlass className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{metadata.formNumber}</h3>
            {metadata.status !== 'production' && (
              <Badge variant={metadata.status === 'beta' ? 'secondary' : 'outline'}>
                {metadata.status}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{metadata.formName}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{metadata.description}</p>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Pages</p>
          <p className="text-2xl font-bold">{metadata.pages}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Fields</p>
          <p className="text-2xl font-bold">{metadata.fields}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Estimated Time</p>
          <p className="text-lg font-semibold">{metadata.estimatedMinutes} min</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Complexity</p>
          <Badge variant={metadata.complexity === 'complex' ? 'destructive' : 'default'}>
            {metadata.complexity}
          </Badge>
        </div>
      </div>

      {metadata.requiredForms && (
        <div className="pt-2 border-t">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-medium">Required Additional Forms</p>
              <p className="text-sm text-muted-foreground">
                {metadata.requiredForms.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
