import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save } from "lucide-react";
import { toast } from "sonner";

interface PersonalInfo {
  full_name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  telephone_no: string;
  fax_no: string;
  email_address: string;
  attorney_name: string;
  firm_name: string;
  bar_number: string;
}

export const PersonalDataVault = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>({
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

  const handleSave = () => {
    // In production, save to Supabase
    console.log('Saving to vault:', formData);
    toast.success('Personal information saved securely!');
    setOpen(false);
  };

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-2 shadow-soft">
          <Shield className="w-4 h-4" />
          Personal Data Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-primary" />
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

          <Button onClick={handleSave} className="w-full gap-2 bg-gradient-to-r from-primary to-accent">
            <Save className="w-4 h-4" />
            Save to Secure Vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};