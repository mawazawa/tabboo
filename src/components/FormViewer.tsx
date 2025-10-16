import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface FormData {
  // Text fields
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
  
  // Boolean fields
  noOrders?: boolean;
  agreeOrders?: boolean;
  consentCustody?: boolean;
  consentVisitation?: boolean;
}

export const FormViewer = () => {
  const [formData, setFormData] = useState<FormData>({});

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="h-full border-2 shadow-medium">
      <ScrollArea className="h-full p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b-2">
            <h1 className="text-2xl font-bold">FL-320</h1>
            <h2 className="text-lg font-semibold text-muted-foreground">
              RESPONSIVE DECLARATION TO REQUEST FOR ORDER
            </h2>
          </div>

          {/* Party Information */}
          <div className="space-y-4 bg-accent/5 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Party Without Attorney or Attorney Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>NAME:</Label>
                <Input
                  value={formData.partyName || ''}
                  onChange={(e) => updateField('partyName', e.target.value)}
                  className="font-medium"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>STREET ADDRESS:</Label>
                <Input
                  value={formData.streetAddress || ''}
                  onChange={(e) => updateField('streetAddress', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CITY:</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div className="space-y-2 grid grid-cols-2 gap-2">
                <div>
                  <Label>STATE:</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => updateField('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label>ZIP:</Label>
                  <Input
                    value={formData.zipCode || ''}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>TELEPHONE NO.:</Label>
                <Input
                  value={formData.telephoneNo || ''}
                  onChange={(e) => updateField('telephoneNo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>FAX NO.:</Label>
                <Input
                  value={formData.faxNo || ''}
                  onChange={(e) => updateField('faxNo', e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>E-MAIL ADDRESS:</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Case Information */}
          <div className="space-y-4 bg-primary/5 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Superior Court Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SUPERIOR COURT OF CALIFORNIA, COUNTY OF:</Label>
                <Input
                  value={formData.county || ''}
                  onChange={(e) => updateField('county', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>PETITIONER:</Label>
                <Input
                  value={formData.petitioner || ''}
                  onChange={(e) => updateField('petitioner', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>RESPONDENT:</Label>
                <Input
                  value={formData.respondent || ''}
                  onChange={(e) => updateField('respondent', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CASE NUMBER:</Label>
                <Input
                  value={formData.caseNumber || ''}
                  onChange={(e) => updateField('caseNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="space-y-3 border-l-4 border-primary pl-4">
              <h4 className="font-semibold">1. RESTRAINING ORDER INFORMATION</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-orders"
                    checked={!!formData.noOrders}
                    onCheckedChange={(checked) => updateField('noOrders', checked as boolean)}
                  />
                  <Label htmlFor="no-orders">
                    No domestic violence restraining/protective orders are now in effect
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agree-orders"
                    checked={!!formData.agreeOrders}
                    onCheckedChange={(checked) => updateField('agreeOrders', checked as boolean)}
                  />
                  <Label htmlFor="agree-orders">
                    I agree that one or more domestic violence restraining/protective orders are in effect
                  </Label>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-3 border-l-4 border-primary pl-4">
              <h4 className="font-semibold">2. CHILD CUSTODY VISITATION (PARENTING TIME)</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent-custody"
                    checked={!!formData.consentCustody}
                    onCheckedChange={(checked) => updateField('consentCustody', checked as boolean)}
                  />
                  <Label htmlFor="consent-custody">
                    I consent to the order requested for child custody
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent-visitation"
                    checked={!!formData.consentVisitation}
                    onCheckedChange={(checked) => updateField('consentVisitation', checked as boolean)}
                  />
                  <Label htmlFor="consent-visitation">
                    I consent to the order requested for visitation
                  </Label>
                </div>
              </div>
            </div>

            {/* Section 10 - Facts */}
            <div className="space-y-3 border-l-4 border-accent pl-4">
              <h4 className="font-semibold">10. FACTS TO SUPPORT MY RESPONSIVE DECLARATION</h4>
              <p className="text-sm text-muted-foreground">
                Cannot be longer than 10 pages, unless the court gives permission
              </p>
              <Textarea
                placeholder="Enter facts supporting your responsive declaration..."
                value={formData.facts || ''}
                onChange={(e) => updateField('facts', e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg mt-8">
            <p className="text-sm italic">
              I declare under penalty of perjury under the laws of the State of California that the information provided in this form and all attachments is true and correct.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date:</Label>
                <Input 
                  type="date"
                  value={formData.signatureDate || ''}
                  onChange={(e) => updateField('signatureDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Signature:</Label>
                <Input 
                  placeholder="(TYPE OR PRINT NAME)"
                  value={formData.signatureName || ''}
                  onChange={(e) => updateField('signatureName', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};