import { useState } from 'react';
import { Upload, Download, Trash2, FileJson } from '@/icons';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Card } from './ui/card';
import { toast } from 'sonner';
import {
  importTemplate,
  exportTemplate,
  getStoredTemplates,
  deleteTemplate,
  saveTemplate,
  createTemplateFromPositions,
  type FormTemplate,
  type FieldTemplate,
} from '@/utils/templateManager';

interface TemplateManagerProps {
  currentFormId: string;
  currentFormName: string;
  currentFieldPositions: Record<string, FieldTemplate>;
  onApplyTemplate: (template: FormTemplate) => void;
  triggerless?: boolean; // If true, renders without Dialog wrapper
}

export const TemplateManager = ({
  currentFormId,
  currentFormName,
  currentFieldPositions,
  onApplyTemplate,
  triggerless = false,
}: TemplateManagerProps) => {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState(getStoredTemplates());

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const template = await importTemplate(file);
      saveTemplate(template);
      setTemplates(getStoredTemplates());
      toast.success(`Template "${template.formName}" imported successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import template');
    }

    event.target.value = '';
  };

  const handleExport = () => {
    const template = createTemplateFromPositions(
      currentFormId,
      currentFormName,
      currentFieldPositions
    );
    exportTemplate(template);
    toast.success('Template exported successfully');
  };

  const handleSaveCurrent = () => {
    const template = createTemplateFromPositions(
      currentFormId,
      currentFormName,
      currentFieldPositions
    );
    saveTemplate(template);
    setTemplates(getStoredTemplates());
    toast.success('Template saved to library');
  };

  const handleApply = (template: FormTemplate) => {
    onApplyTemplate(template);
    setOpen(false);
    toast.success(`Applied template: ${template.formName}`);
  };

  const handleDelete = (formId: string) => {
    const template = templates.find(t => t.formId === formId);
    if (!template) return;

    if (window.confirm(`Delete template "${template.formName}"?\n\nThis action cannot be undone.`)) {
      deleteTemplate(formId);
      setTemplates(getStoredTemplates());
      toast.success('Template deleted');
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Current
        </Button>
        <Button onClick={handleSaveCurrent} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Save to Library
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <label className="cursor-pointer">
            <Upload className="h-4 w-4" />
            Import Mapping
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </Button>
      </div>

      {/* Saved Templates */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Saved Templates</h3>
        {Object.keys(templates).length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No saved templates. Import a mapping file or save the current field positions.
          </p>
        ) : (
          <div className="space-y-2">
            {Object.values(templates).map((template) => (
              <Card key={template.formId} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{template.formName}</h4>
                    <p className="text-xs text-muted-foreground">
                      ID: {template.formId} • Version: {template.version}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Object.keys(template.fields).length} fields
                      {template.author && ` • by ${template.author}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApply(template)}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportTemplate(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.formId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (triggerless) {
    return (
      <div className="w-full">
        <h3 className="text-sm font-semibold mb-3">Field Position Templates</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Import, export, and manage form field position templates for crowdsourcing.
        </p>
        {content}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileJson className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Manager</DialogTitle>
          <DialogDescription>
            Import, export, and manage form field position templates for crowdsourcing.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
