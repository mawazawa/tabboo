import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FormData {
  partyName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  telephoneNo?: string;
  faxNo?: string;
  email?: string;
  attorneyFor?: string;
  county?: string;
  petitioner?: string;
  respondent?: string;
  caseNumber?: string;
  facts?: string;
  signatureDate?: string;
  signatureName?: string;
  noOrders?: boolean;
  agreeOrders?: boolean;
  consentCustody?: boolean;
  consentVisitation?: boolean;
}

interface Props {
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
}

export const FormFieldsPanel = ({ formData, updateField }: Props) => {
  return (
    <Card className="h-full border-2 shadow-medium">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Form Fields</h2>
            <p className="text-sm text-muted-foreground">Fill out the form using this panel</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Party Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="partyName">Name</Label>
              <Input
                id="partyName"
                value={formData.partyName || ''}
                onChange={(e) => updateField('partyName', e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress || ''}
                onChange={(e) => updateField('streetAddress', e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => updateField('zipCode', e.target.value)}
                placeholder="ZIP code"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="telephoneNo">Telephone</Label>
                <Input
                  id="telephoneNo"
                  value={formData.telephoneNo || ''}
                  onChange={(e) => updateField('telephoneNo', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faxNo">Fax</Label>
                <Input
                  id="faxNo"
                  value={formData.faxNo || ''}
                  onChange={(e) => updateField('faxNo', e.target.value)}
                  placeholder="Fax number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attorneyFor">Attorney For</Label>
              <Input
                id="attorneyFor"
                value={formData.attorneyFor || ''}
                onChange={(e) => updateField('attorneyFor', e.target.value)}
                placeholder="Attorney for"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Case Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.county || ''}
                onChange={(e) => updateField('county', e.target.value)}
                placeholder="County"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="petitioner">Petitioner</Label>
              <Input
                id="petitioner"
                value={formData.petitioner || ''}
                onChange={(e) => updateField('petitioner', e.target.value)}
                placeholder="Petitioner name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respondent">Respondent</Label>
              <Input
                id="respondent"
                value={formData.respondent || ''}
                onChange={(e) => updateField('respondent', e.target.value)}
                placeholder="Respondent name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={formData.caseNumber || ''}
                onChange={(e) => updateField('caseNumber', e.target.value)}
                placeholder="Case number"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Orders</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noOrders"
                checked={!!formData.noOrders}
                onCheckedChange={(checked) => updateField('noOrders', checked as boolean)}
              />
              <Label htmlFor="noOrders" className="cursor-pointer">No orders requested</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeOrders"
                checked={!!formData.agreeOrders}
                onCheckedChange={(checked) => updateField('agreeOrders', checked as boolean)}
              />
              <Label htmlFor="agreeOrders" className="cursor-pointer">Agree to orders</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentCustody"
                checked={!!formData.consentCustody}
                onCheckedChange={(checked) => updateField('consentCustody', checked as boolean)}
              />
              <Label htmlFor="consentCustody" className="cursor-pointer">Consent to custody</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentVisitation"
                checked={!!formData.consentVisitation}
                onCheckedChange={(checked) => updateField('consentVisitation', checked as boolean)}
              />
              <Label htmlFor="consentVisitation" className="cursor-pointer">Consent to visitation</Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="facts">Facts</Label>
              <Textarea
                id="facts"
                value={formData.facts || ''}
                onChange={(e) => updateField('facts', e.target.value)}
                placeholder="Enter facts and details"
                className="min-h-[120px]"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Signature</h3>
            
            <div className="space-y-2">
              <Label htmlFor="signatureDate">Date</Label>
              <Input
                id="signatureDate"
                type="date"
                value={formData.signatureDate || ''}
                onChange={(e) => updateField('signatureDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatureName">Signature Name</Label>
              <Input
                id="signatureName"
                value={formData.signatureName || ''}
                onChange={(e) => updateField('signatureName', e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
