import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import type { ValidationRule, ValidationRuleType, FieldValidationConfig } from '@/types/validation';
import { DEFAULT_MESSAGES } from '@/types/validation';

interface ValidationRuleEditorProps {
  fieldName: string;
  currentRules: ValidationRule[];
  onSave: (fieldName: string, rules: ValidationRule[]) => void;
  triggerless?: boolean;
}

const RULE_TYPES: { value: ValidationRuleType; label: string; hasValue?: boolean }[] = [
  { value: 'required', label: 'Required' },
  { value: 'email', label: 'Email Format' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'zipCode', label: 'ZIP Code' },
  { value: 'minLength', label: 'Minimum Length', hasValue: true },
  { value: 'maxLength', label: 'Maximum Length', hasValue: true },
  { value: 'pattern', label: 'Custom Pattern (Regex)', hasValue: true },
];

export const ValidationRuleEditor = ({
  fieldName,
  currentRules,
  onSave,
  triggerless = false,
}: ValidationRuleEditorProps) => {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<ValidationRule[]>(currentRules);

  const handleAddRule = () => {
    const newRule: ValidationRule = {
      type: 'required',
      message: DEFAULT_MESSAGES.required,
      enabled: true,
    };
    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, updates: Partial<ValidationRule>) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    
    // Update message to default if type changed
    if (updates.type && updates.type !== updatedRules[index].type) {
      updatedRules[index].message = DEFAULT_MESSAGES[updates.type] || 'Invalid value';
    }
    
    setRules(updatedRules);
  };

  const handleSave = () => {
    onSave(fieldName, rules);
    toast.success(`Validation rules saved for ${fieldName}`);
    setOpen(false);
  };

  const content = (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Define validation rules for <strong>{fieldName}</strong>. Rules are checked when the field value changes.
        </AlertDescription>
      </Alert>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No validation rules yet. Click "Add Rule" to create one.
            </div>
          ) : (
            rules.map((rule, index) => {
              const ruleTypeInfo = RULE_TYPES.find(t => t.value === rule.type);
              
              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Rule {index + 1}</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`enabled-${index}`} className="text-xs">Enabled</Label>
                        <Switch
                          id={`enabled-${index}`}
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => handleRuleChange(index, { enabled })}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRule(index)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`type-${index}`} className="text-xs">Rule Type</Label>
                    <Select
                      value={rule.type}
                      onValueChange={(type) => handleRuleChange(index, { type: type as ValidationRuleType })}
                    >
                      <SelectTrigger id={`type-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {ruleTypeInfo?.hasValue && (
                    <div className="space-y-2">
                      <Label htmlFor={`value-${index}`} className="text-xs">
                        {rule.type === 'pattern' ? 'Regex Pattern' : 'Value'}
                      </Label>
                      <Input
                        id={`value-${index}`}
                        value={rule.value || ''}
                        onChange={(e) => handleRuleChange(index, { value: e.target.value })}
                        placeholder={rule.type === 'pattern' ? '^[A-Z][0-9]+$' : '10'}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`message-${index}`} className="text-xs">Error Message</Label>
                    <Input
                      id={`message-${index}`}
                      value={rule.message}
                      onChange={(e) => handleRuleChange(index, { message: e.target.value })}
                      placeholder="Enter error message"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleAddRule} variant="outline" className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Rules
        </Button>
      </div>
    </div>
  );

  if (triggerless) {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Validation Rules
          {currentRules.filter(r => r.enabled).length > 0 && (
            <span className="ml-1 text-xs">({currentRules.filter(r => r.enabled).length})</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Field Validation Rules</DialogTitle>
          <DialogDescription>
            Configure validation rules for {fieldName}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
