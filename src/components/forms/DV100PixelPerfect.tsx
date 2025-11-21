import React, { useState } from 'react';
import './court-forms.css';

export interface DV100PixelPerfectData {
  // Attorney/Party Info
  attorneyName: string;
  attorneyBarNumber: string;
  firmName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  telephone: string;
  fax: string;
  email: string;
  attorneyFor: string;

  // Court Info
  county: string;
  courtStreet: string;
  courtMailing: string;
  courtCityZip: string;
  branchName: string;

  // Case Info
  caseNumber: string;

  // Item 1: Protected Person
  protectedPersonName: string;
  protectedPersonAge: string;
  protectedPersonSex: string;
  protectedPersonRelationship: string;

  // Item 2: Restrained Person
  restrainedPersonName: string;
  restrainedPersonAge: string;
  restrainedPersonSex: string;
  restrainedPersonHeight: string;
  restrainedPersonWeight: string;
  restrainedPersonHairColor: string;
  restrainedPersonEyeColor: string;
  restrainedPersonRace: string;
  restrainedPersonAddress: string;
  restrainedPersonCity: string;
  restrainedPersonState: string;
  restrainedPersonZip: string;

  // Item 3: Relationship
  relationshipMarried: boolean;
  relationshipDomesticPartners: boolean;
  relationshipDivorced: boolean;
  relationshipSeparated: boolean;
  relationshipDating: boolean;
  relationshipEngaged: boolean;
  relationshipRelatives: boolean;
  relationshipRelativeType: string;
  relationshipLiveTogether: boolean;
  relationshipParentChild: boolean;
  relationshipOther: boolean;
  relationshipOtherDesc: string;

  // Item 4: Other Court Cases
  hasOtherCases: boolean;
  otherCaseType: string;
  otherCaseCounty: string;
  otherCaseNumber: string;
  otherCaseYear: string;

  // Item 5: Checkbox Orders
  checkPersonalConduct: boolean;
  checkStayAway: boolean;
  checkMoveOut: boolean;
  checkAnimals: boolean;
  checkChildCustody: boolean;
  checkChildSupport: boolean;
  checkSpousalSupport: boolean;
  checkPropertyControl: boolean;
  checkDebtPayment: boolean;
  checkPropertyRestraint: boolean;
  checkRecordProtection: boolean;
  checkBatterersProgram: boolean;
  checkLawyerFees: boolean;
  checkOtherOrders: boolean;
  otherOrdersDesc: string;

  // Item 6: Abuse Description
  abuseDescription: string;

  // Signature
  signatureDate: string;
  signatureCity: string;
  lawyerSignatureDate: string;
}

interface DV100PixelPerfectProps {
  data?: Partial<DV100PixelPerfectData>;
  onChange?: (data: DV100PixelPerfectData) => void;
  readOnly?: boolean;
}

const defaultData: DV100PixelPerfectData = {
  attorneyName: '',
  attorneyBarNumber: '',
  firmName: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  telephone: '',
  fax: '',
  email: '',
  attorneyFor: '',
  county: '',
  courtStreet: '',
  courtMailing: '',
  courtCityZip: '',
  branchName: '',
  caseNumber: '',
  protectedPersonName: '',
  protectedPersonAge: '',
  protectedPersonSex: '',
  protectedPersonRelationship: '',
  restrainedPersonName: '',
  restrainedPersonAge: '',
  restrainedPersonSex: '',
  restrainedPersonHeight: '',
  restrainedPersonWeight: '',
  restrainedPersonHairColor: '',
  restrainedPersonEyeColor: '',
  restrainedPersonRace: '',
  restrainedPersonAddress: '',
  restrainedPersonCity: '',
  restrainedPersonState: '',
  restrainedPersonZip: '',
  relationshipMarried: false,
  relationshipDomesticPartners: false,
  relationshipDivorced: false,
  relationshipSeparated: false,
  relationshipDating: false,
  relationshipEngaged: false,
  relationshipRelatives: false,
  relationshipRelativeType: '',
  relationshipLiveTogether: false,
  relationshipParentChild: false,
  relationshipOther: false,
  relationshipOtherDesc: '',
  hasOtherCases: false,
  otherCaseType: '',
  otherCaseCounty: '',
  otherCaseNumber: '',
  otherCaseYear: '',
  checkPersonalConduct: false,
  checkStayAway: false,
  checkMoveOut: false,
  checkAnimals: false,
  checkChildCustody: false,
  checkChildSupport: false,
  checkSpousalSupport: false,
  checkPropertyControl: false,
  checkDebtPayment: false,
  checkPropertyRestraint: false,
  checkRecordProtection: false,
  checkBatterersProgram: false,
  checkLawyerFees: false,
  checkOtherOrders: false,
  otherOrdersDesc: '',
  abuseDescription: '',
  signatureDate: '',
  signatureCity: '',
  lawyerSignatureDate: '',
};

export const DV100PixelPerfect: React.FC<DV100PixelPerfectProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV100PixelPerfectData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV100PixelPerfectData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof DV100PixelPerfectData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof DV100PixelPerfectData, value);
    }
  };

  return (
    <div className="court-form-container">
      <form className="court-form" data-form="DV-100">
        {/* PAGE 1 */}
        <section className="page" data-page="1">
          {/* Header */}
          <div className="header-line">
            <div className="judicial">
              <div>Form Approved for Optional Use<br/>Judicial Council of California</div>
              <div className="form-id">DV-100 [Rev. January 1, 2025]</div>
              <div className="bold">REQUEST FOR DOMESTIC VIOLENCE RESTRAINING ORDER</div>
              <div className="small">Family Code, § 6200 et seq.</div>
            </div>
            <div className="code">DV-100</div>
          </div>

          {/* Party/Attorney and Court Use */}
          <div className="row">
            <div className="w-60 box">
              <div className="label">Person Asking for Protection</div>
              <div className="row mt6">
                <div className="w-60">
                  <label className="small">Name</label>
                  <input type="text" name="attorneyName" value={formData.attorneyName} onChange={handleInputChange} readOnly={readOnly} />
                </div>
                <div className="w-40">
                  <label className="small">State Bar No. (if attorney)</label>
                  <input type="text" name="attorneyBarNumber" value={formData.attorneyBarNumber} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="row mt6">
                <div className="w-100">
                  <label className="small">Firm Name (if any)</label>
                  <input type="text" name="firmName" value={formData.firmName} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="row mt6">
                <div className="w-100">
                  <label className="small">Street Address</label>
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="row mt6">
                <div className="w-40">
                  <label className="small">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} readOnly={readOnly} />
                </div>
                <div className="w-20">
                  <label className="small">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} readOnly={readOnly} maxLength={2} />
                </div>
                <div className="w-40">
                  <label className="small">ZIP Code</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="row mt6">
                <div className="w-50">
                  <label className="small">Telephone</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} readOnly={readOnly} />
                </div>
                <div className="w-50">
                  <label className="small">Fax</label>
                  <input type="tel" name="fax" value={formData.fax} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="row mt6">
                <div className="w-100">
                  <label className="small">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="row mt6">
                <div className="w-100">
                  <label className="small">Lawyer for (name)</label>
                  <input type="text" name="attorneyFor" value={formData.attorneyFor} onChange={handleInputChange} readOnly={readOnly} />
                </div>
              </div>
            </div>
            <div className="w-40 box">
              <div className="label">For Court Use Only</div>
              <div className="courtuse" aria-label="Court Use Only"></div>
            </div>
          </div>

          {/* Superior Court */}
          <div className="box mt12">
            <div className="label">Superior Court of California, County of</div>
            <div className="row mt6">
              <div className="w-50">
                <input type="text" name="county" value={formData.county} onChange={handleInputChange} readOnly={readOnly} placeholder="County" />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-60">
                <label className="small">Street Address</label>
                <input type="text" name="courtStreet" value={formData.courtStreet} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-40">
                <label className="small">Mailing Address</label>
                <input type="text" name="courtMailing" value={formData.courtMailing} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-60">
                <label className="small">City and ZIP Code</label>
                <input type="text" name="courtCityZip" value={formData.courtCityZip} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-40">
                <label className="small">Branch Name</label>
                <input type="text" name="branchName" value={formData.branchName} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
          </div>

          {/* Case Number */}
          <div className="row mt12">
            <div className="w-75 box-none"></div>
            <div className="w-25 box">
              <label className="small">Case Number</label>
              <input type="text" name="caseNumber" value={formData.caseNumber} onChange={handleInputChange} readOnly={readOnly} />
            </div>
          </div>

          {/* Item 1: Protected Person */}
          <div className="box mt12">
            <div className="title">1. Person Asking for Protection</div>
            <div className="row mt6">
              <div className="w-50">
                <label className="small">Full Name</label>
                <input type="text" name="protectedPersonName" value={formData.protectedPersonName} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-20">
                <label className="small">Age</label>
                <input type="text" name="protectedPersonAge" value={formData.protectedPersonAge} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-30">
                <label className="small">Sex</label>
                <input type="text" name="protectedPersonSex" value={formData.protectedPersonSex} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-100">
                <label className="small">Your relationship to person in 2</label>
                <input type="text" name="protectedPersonRelationship" value={formData.protectedPersonRelationship} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
          </div>

          {/* Item 2: Restrained Person */}
          <div className="box mt12">
            <div className="title">2. Person You Want Restrained</div>
            <div className="row mt6">
              <div className="w-50">
                <label className="small">Full Name</label>
                <input type="text" name="restrainedPersonName" value={formData.restrainedPersonName} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-20">
                <label className="small">Age</label>
                <input type="text" name="restrainedPersonAge" value={formData.restrainedPersonAge} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-30">
                <label className="small">Sex</label>
                <input type="text" name="restrainedPersonSex" value={formData.restrainedPersonSex} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-25">
                <label className="small">Height</label>
                <input type="text" name="restrainedPersonHeight" value={formData.restrainedPersonHeight} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-25">
                <label className="small">Weight</label>
                <input type="text" name="restrainedPersonWeight" value={formData.restrainedPersonWeight} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-25">
                <label className="small">Hair Color</label>
                <input type="text" name="restrainedPersonHairColor" value={formData.restrainedPersonHairColor} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-25">
                <label className="small">Eye Color</label>
                <input type="text" name="restrainedPersonEyeColor" value={formData.restrainedPersonEyeColor} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-100">
                <label className="small">Race</label>
                <input type="text" name="restrainedPersonRace" value={formData.restrainedPersonRace} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-100">
                <label className="small">Address (if known)</label>
                <input type="text" name="restrainedPersonAddress" value={formData.restrainedPersonAddress} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="row mt6">
              <div className="w-50">
                <label className="small">City</label>
                <input type="text" name="restrainedPersonCity" value={formData.restrainedPersonCity} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-25">
                <label className="small">State</label>
                <input type="text" name="restrainedPersonState" value={formData.restrainedPersonState} onChange={handleInputChange} readOnly={readOnly} />
              </div>
              <div className="w-25">
                <label className="small">ZIP</label>
                <input type="text" name="restrainedPersonZip" value={formData.restrainedPersonZip} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div>DV-100 [Rev. January 1, 2025]</div>
            <div>Request for Domestic Violence Restraining Order</div>
          </div>
          <div className="pageno">Page 1 of 6</div>
        </section>

        {/* PAGE 2 */}
        <section className="page" data-page="2">
          {/* Page header */}
          <div className="row mb12">
            <div className="w-50">
              <label className="small">Case Number</label>
              <input type="text" name="caseNumber" value={formData.caseNumber} onChange={handleInputChange} readOnly={readOnly} />
            </div>
          </div>

          {/* Item 3: Relationship */}
          <div className="box mt6">
            <div className="title">3. Relationship of Parties</div>
            <div className="small mt6">Check all that apply:</div>
            <div className="two-col mt6">
              <label className="checkbox"><input type="checkbox" name="relationshipMarried" checked={formData.relationshipMarried} onChange={handleInputChange} disabled={readOnly} /> We are married or domestic partners</label>
              <label className="checkbox"><input type="checkbox" name="relationshipDomesticPartners" checked={formData.relationshipDomesticPartners} onChange={handleInputChange} disabled={readOnly} /> We are registered domestic partners</label>
              <label className="checkbox"><input type="checkbox" name="relationshipDivorced" checked={formData.relationshipDivorced} onChange={handleInputChange} disabled={readOnly} /> We are divorced or legally separated</label>
              <label className="checkbox"><input type="checkbox" name="relationshipSeparated" checked={formData.relationshipSeparated} onChange={handleInputChange} disabled={readOnly} /> We are separated</label>
              <label className="checkbox"><input type="checkbox" name="relationshipDating" checked={formData.relationshipDating} onChange={handleInputChange} disabled={readOnly} /> We are dating or used to date</label>
              <label className="checkbox"><input type="checkbox" name="relationshipEngaged" checked={formData.relationshipEngaged} onChange={handleInputChange} disabled={readOnly} /> We are engaged or used to be engaged</label>
              <label className="checkbox"><input type="checkbox" name="relationshipParentChild" checked={formData.relationshipParentChild} onChange={handleInputChange} disabled={readOnly} /> We have a child together</label>
              <label className="checkbox"><input type="checkbox" name="relationshipLiveTogether" checked={formData.relationshipLiveTogether} onChange={handleInputChange} disabled={readOnly} /> We live together or used to live together</label>
            </div>
            <div className="mt6">
              <label className="checkbox">
                <input type="checkbox" name="relationshipRelatives" checked={formData.relationshipRelatives} onChange={handleInputChange} disabled={readOnly} />
                We are related by blood, adoption, or marriage (specify):
                <input type="text" name="relationshipRelativeType" value={formData.relationshipRelativeType} onChange={handleInputChange} readOnly={readOnly} className="inline-input" style={{marginLeft: '6px', width: '150px'}} />
              </label>
            </div>
            <div className="mt6">
              <label className="checkbox">
                <input type="checkbox" name="relationshipOther" checked={formData.relationshipOther} onChange={handleInputChange} disabled={readOnly} />
                Other (specify):
                <input type="text" name="relationshipOtherDesc" value={formData.relationshipOtherDesc} onChange={handleInputChange} readOnly={readOnly} className="inline-input" style={{marginLeft: '6px', width: '200px'}} />
              </label>
            </div>
          </div>

          {/* Item 4: Other Court Cases */}
          <div className="box mt12">
            <div className="title">4. Other Court Cases</div>
            <div className="mt6">
              <label className="checkbox">
                <input type="checkbox" name="hasOtherCases" checked={formData.hasOtherCases} onChange={handleInputChange} disabled={readOnly} />
                The parties have or had another court case together
              </label>
            </div>
            {formData.hasOtherCases && (
              <div className="indent mt6">
                <div className="row">
                  <div className="w-40">
                    <label className="small">Type of case</label>
                    <input type="text" name="otherCaseType" value={formData.otherCaseType} onChange={handleInputChange} readOnly={readOnly} />
                  </div>
                  <div className="w-30">
                    <label className="small">County</label>
                    <input type="text" name="otherCaseCounty" value={formData.otherCaseCounty} onChange={handleInputChange} readOnly={readOnly} />
                  </div>
                  <div className="w-30">
                    <label className="small">Case Number</label>
                    <input type="text" name="otherCaseNumber" value={formData.otherCaseNumber} onChange={handleInputChange} readOnly={readOnly} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Item 5: Orders Requested */}
          <div className="box mt12">
            <div className="title">5. Orders Requested</div>
            <div className="small mt6">Check all that apply. You must fill out page 3 to explain these requests.</div>
            <div className="two-col mt6">
              <label className="checkbox"><input type="checkbox" name="checkPersonalConduct" checked={formData.checkPersonalConduct} onChange={handleInputChange} disabled={readOnly} /> Personal conduct orders</label>
              <label className="checkbox"><input type="checkbox" name="checkStayAway" checked={formData.checkStayAway} onChange={handleInputChange} disabled={readOnly} /> Stay-away orders</label>
              <label className="checkbox"><input type="checkbox" name="checkMoveOut" checked={formData.checkMoveOut} onChange={handleInputChange} disabled={readOnly} /> Move-out order</label>
              <label className="checkbox"><input type="checkbox" name="checkAnimals" checked={formData.checkAnimals} onChange={handleInputChange} disabled={readOnly} /> Animals</label>
              <label className="checkbox"><input type="checkbox" name="checkChildCustody" checked={formData.checkChildCustody} onChange={handleInputChange} disabled={readOnly} /> Child custody and visitation</label>
              <label className="checkbox"><input type="checkbox" name="checkChildSupport" checked={formData.checkChildSupport} onChange={handleInputChange} disabled={readOnly} /> Child support</label>
              <label className="checkbox"><input type="checkbox" name="checkSpousalSupport" checked={formData.checkSpousalSupport} onChange={handleInputChange} disabled={readOnly} /> Spousal/partner support</label>
              <label className="checkbox"><input type="checkbox" name="checkPropertyControl" checked={formData.checkPropertyControl} onChange={handleInputChange} disabled={readOnly} /> Property control</label>
              <label className="checkbox"><input type="checkbox" name="checkDebtPayment" checked={formData.checkDebtPayment} onChange={handleInputChange} disabled={readOnly} /> Debt payment</label>
              <label className="checkbox"><input type="checkbox" name="checkPropertyRestraint" checked={formData.checkPropertyRestraint} onChange={handleInputChange} disabled={readOnly} /> Property restraint</label>
              <label className="checkbox"><input type="checkbox" name="checkRecordProtection" checked={formData.checkRecordProtection} onChange={handleInputChange} disabled={readOnly} /> Record protection</label>
              <label className="checkbox"><input type="checkbox" name="checkBatterersProgram" checked={formData.checkBatterersProgram} onChange={handleInputChange} disabled={readOnly} /> Batterer's program</label>
              <label className="checkbox"><input type="checkbox" name="checkLawyerFees" checked={formData.checkLawyerFees} onChange={handleInputChange} disabled={readOnly} /> Lawyer's fees and costs</label>
            </div>
            <div className="mt6">
              <label className="checkbox">
                <input type="checkbox" name="checkOtherOrders" checked={formData.checkOtherOrders} onChange={handleInputChange} disabled={readOnly} />
                Other orders (specify):
              </label>
              {formData.checkOtherOrders && (
                <textarea name="otherOrdersDesc" value={formData.otherOrdersDesc} onChange={handleInputChange} readOnly={readOnly} className="short mt6" />
              )}
            </div>
          </div>

          {/* Item 6: Abuse Description */}
          <div className="box mt12">
            <div className="title">6. Description of Abuse</div>
            <div className="small mt6">Describe in detail what happened. Include dates, who did what, what was said, and how it made you afraid. Use DV-101 for more space.</div>
            <textarea name="abuseDescription" value={formData.abuseDescription} onChange={handleInputChange} readOnly={readOnly} className="mt6" />
          </div>

          {/* Footer */}
          <div className="footer">
            <div>DV-100 [Rev. January 1, 2025]</div>
            <div>Request for Domestic Violence Restraining Order</div>
          </div>
          <div className="pageno">Page 2 of 6</div>
        </section>

        {/* PAGE 3 - Signature */}
        <section className="page" data-page="3">
          <div className="row mb12">
            <div className="w-50">
              <label className="small">Case Number</label>
              <input type="text" name="caseNumber" value={formData.caseNumber} onChange={handleInputChange} readOnly={readOnly} />
            </div>
          </div>

          <div className="note mt12">
            <strong>I declare under penalty of perjury under the laws of the State of California that the information above is true and correct.</strong>
          </div>

          <div className="row mt18">
            <div className="w-50">
              <label className="small">Date</label>
              <input type="date" name="signatureDate" value={formData.signatureDate} onChange={handleInputChange} readOnly={readOnly} />
            </div>
          </div>

          <div className="mt18">
            <div className="signature-line"></div>
            <div className="signature-label">Signature of Person Asking for Protection</div>
          </div>

          {/* Lawyer signature if applicable */}
          <div className="box mt18">
            <div className="title">Lawyer's Signature (if any)</div>
            <div className="row mt12">
              <div className="w-50">
                <label className="small">Date</label>
                <input type="date" name="lawyerSignatureDate" value={formData.lawyerSignatureDate} onChange={handleInputChange} readOnly={readOnly} />
              </div>
            </div>
            <div className="mt18">
              <div className="signature-line"></div>
              <div className="signature-label">Signature of Lawyer</div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div>DV-100 [Rev. January 1, 2025]</div>
            <div>Request for Domestic Violence Restraining Order</div>
          </div>
          <div className="pageno">Page 3 of 6</div>
        </section>
      </form>
    </div>
  );
};

export default DV100PixelPerfect;
