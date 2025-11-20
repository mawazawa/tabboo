import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, Input, Label } from "@/components/ui/liquid-justice-temp";
import { Shield, Save, Loader2 } from "@/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { personalInfoSchema, type PersonalInfoFormData } from "@/lib/validations";
import { sanitizeFormData } from "@/utils/inputSanitizer";

interface PersonalDataVaultProps {
  userId: string;
}

export const PersonalDataVault = ({ userId }: PersonalDataVaultProps) => {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (open && userId) {
      loadPersonalInfo();
    }
  }, [open, userId]);

  const loadPersonalInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          street_address: data.street_address || '',
          city: data.city || '',
          state: data.state || 'CA',
          zip_code: data.zip_code || '',
          telephone_no: data.telephone_no || '',
          fax_no: data.fax_no || '',
          email_address: data.email_address || '',
          attorney_name: data.attorney_name || '',
          firm_name: data.firm_name || '',
          bar_number: data.bar_number || '',
        });
      }
    } catch (error: unknown) {
      toast.error("Failed to load personal information");
    } finally {
      setLoading(false);
    }
  };

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
      setOpen(false);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
        // Zod validation errors
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-2 shadow-soft">
          <Shield className="w-4 h-4" strokeWidth={0.5} />
          Personal Data Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-primary" strokeWidth={0.5} />
            Personal Data Vault
          </DialogTitle>
          <DialogDescription>
            Store your personal information securely. This data will be used to automatically fill form fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="street_address">Street Address</Label>
              <Input
                id="street_address"
                value={formData.street_address}
                onChange={(e) => updateField('street_address', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Los Angeles"
              />
            </div>

            <div className="space-y-2 grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => updateField('zip_code', e.target.value)}
                  placeholder="90001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone_no">Telephone</Label>
              <Input
                id="telephone_no"
                value={formData.telephone_no}
                onChange={(e) => updateField('telephone_no', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax_no">Fax</Label>
              <Input
                id="fax_no"
                value={formData.fax_no}
                onChange={(e) => updateField('fax_no', e.target.value)}
                placeholder="(555) 123-4568"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => updateField('email_address', e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="attorney_name">Attorney Name (if applicable)</Label>
              <Input
                id="attorney_name"
                value={formData.attorney_name}
                onChange={(e) => updateField('attorney_name', e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firm_name">Law Firm Name</Label>
              <Input
                id="firm_name"
                value={formData.firm_name}
                onChange={(e) => updateField('firm_name', e.target.value)}
                placeholder="Smith & Associates"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bar_number">State Bar Number</Label>
              <Input
                id="bar_number"
                value={formData.bar_number}
                onChange={(e) => updateField('bar_number', e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full gap-2 bg-gradient-to-r from-primary to-accent" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={0.5} /> : <Save className="w-4 h-4" strokeWidth={0.5} />}
            Save to Secure Vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};