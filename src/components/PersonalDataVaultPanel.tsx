import { useState, useEffect } from "react";
import { Card, Input, Label, Button, Badge } from "@/components/ui/liquid-justice-temp";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Save, Loader2, AlertCircle, CheckCircle } from "@/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { personalInfoSchema, type PersonalInfoFormData } from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";
import { sanitizeFormData } from "@/utils/inputSanitizer";

interface PersonalDataVaultPanelProps {
  userId: string;
  onDataChange?: () => void;
}

interface FieldMapping {
  vaultField: keyof PersonalInfoFormData;
  label: string;
  placeholder: string;
  formFields?: string[]; // Which form fields this maps to
}

const VAULT_FIELDS: FieldMapping[] = [
  { vaultField: 'full_name', label: 'Full Name', placeholder: 'John Doe', formFields: ['partyName', 'signatureName'] },
  { vaultField: 'street_address', label: 'Street Address', placeholder: '123 Main St', formFields: ['streetAddress'] },
  { vaultField: 'city', label: 'City', placeholder: 'Los Angeles', formFields: ['city'] },
  { vaultField: 'state', label: 'State', placeholder: 'CA', formFields: ['state'] },
  { vaultField: 'zip_code', label: 'ZIP Code', placeholder: '90001', formFields: ['zipCode'] },
  { vaultField: 'telephone_no', label: 'Telephone', placeholder: '(555) 123-4567', formFields: ['telephoneNo'] },
  { vaultField: 'fax_no', label: 'Fax', placeholder: '(555) 123-4568', formFields: ['faxNo'] },
  { vaultField: 'email_address', label: 'Email', placeholder: 'john@example.com', formFields: ['email'] },
  { vaultField: 'attorney_name', label: 'Attorney Name', placeholder: 'Jane Smith', formFields: ['attorneyFor'] },
  { vaultField: 'firm_name', label: 'Law Firm', placeholder: 'Smith & Associates', formFields: [] },
  { vaultField: 'bar_number', label: 'State Bar Number', placeholder: '123456', formFields: [] },
];

export const PersonalDataVaultPanel = ({ userId, onDataChange }: PersonalDataVaultPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    full_name: '',
    street_address: '',
    city: '',
    state: 'CA',
    zip_code: '',
    telephone_no: '',
    fax_no: '',
    email_address: '',
    attorney_name: '',
    firm_name: '',
    bar_number: '',
  });

  // Fetch personal info
  const { data: personalInfo, refetch } = useQuery({
    queryKey: ['personal-info-panel', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching personal info:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (personalInfo) {
      setFormData({
        full_name: personalInfo.full_name || '',
        street_address: personalInfo.street_address || '',
        city: personalInfo.city || '',
        state: personalInfo.state || 'CA',
        zip_code: personalInfo.zip_code || '',
        telephone_no: personalInfo.telephone_no || '',
        fax_no: personalInfo.fax_no || '',
        email_address: personalInfo.email_address || '',
        attorney_name: personalInfo.attorney_name || '',
        firm_name: personalInfo.firm_name || '',
        bar_number: personalInfo.bar_number || '',
      });
    }
  }, [personalInfo]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate input
      const validatedData = personalInfoSchema.parse(formData);

      // Sanitize for defense-in-depth XSS protection
      const sanitizedData = sanitizeFormData(validatedData);

      const { error } = await supabase
        .from('personal_info')
        .upsert({
          user_id: userId,
          ...sanitizedData,
        });

      if (error) throw error;

      toast.success('Personal information saved securely!');
      refetch();
      onDataChange?.();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
        error.errors.forEach((err: unknown) => {
          if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            toast.error(err.message);
          }
        });
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save personal information");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof PersonalInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Count filled fields
  const filledCount = VAULT_FIELDS.filter(field => formData[field.vaultField]).length;
  const totalCount = VAULT_FIELDS.length;

  return (
    <Card className="h-full border-hairline shadow-3point chamfered flex flex-col">
      <div className="p-4 border-b-hairline bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
          <h2 className="font-semibold text-sm">Personal Data Vault</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Securely stored data for auto-filling forms
        </p>
        
        {/* Progress indicator */}
        <div className="bg-background rounded-lg border-hairline shadow-3point chamfered p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Vault Completion</span>
            <span className="text-xs text-muted-foreground">{filledCount} of {totalCount}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-3 gap-2 shadow-3point chamfered spring-hover"
          size="lg"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
          Save to Vault
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Empty state onboarding */}
          {filledCount === 0 && (
            <div className="text-center py-6 px-4 space-y-3 bg-muted/30 rounded-lg border-hairline">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Your vault is empty</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add your personal information below to auto-fill forms instantly.
                  Your data is encrypted and stored securely.
                </p>
              </div>
            </div>
          )}

          {VAULT_FIELDS.map((field) => {
            const isFilled = !!formData[field.vaultField];
            const hasFormMapping = field.formFields && field.formFields.length > 0;
            
            return (
              <div
                key={field.vaultField}
                className={`space-y-2 p-4 rounded-lg border-hairline transition-all shadow-3point chamfered ${
                  isFilled 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Label 
                    htmlFor={field.vaultField} 
                    className="text-xs font-medium flex items-center gap-2"
                  >
                    {field.label}
                    {isFilled && (
                      <CheckCircle className="h-3 w-3 text-primary" strokeWidth={1.5} />
                    )}
                  </Label>
                  {hasFormMapping && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-5">
                      Maps to form
                    </Badge>
                  )}
                </div>

                <Input
                  id={field.vaultField}
                  value={formData[field.vaultField] || ''}
                  onChange={(e) => updateField(field.vaultField, e.target.value)}
                  placeholder={field.placeholder}
                  className="shadow-3point chamfered"
                />

                {/* Show which form fields this maps to */}
                {hasFormMapping && field.formFields!.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {field.formFields!.map(formField => (
                      <Badge key={formField} variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 font-mono">
                        {formField}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};
