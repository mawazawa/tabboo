import React, { useState } from 'react';
import './DV100FormTemplate.css';

export interface DV100FormData {
  // Section 1: Person Asking for Protection
  yourName: string;
  yourAge: string;
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  telephone: string;
  fax: string;
  email: string;
  lawyerName: string;
  lawyerBarNumber: string;
  lawyerFirmName: string;

  // Court Information
  county: string;
  caseNumber: string;

  // Section 2: Person You Want Protection From
  restrainedPersonName: string;
  restrainedPersonAge: string;
  restrainedPersonDOB: string;
  restrainedPersonGenderM: boolean;
  restrainedPersonGenderF: boolean;
  restrainedPersonGenderNonbinary: boolean;
  restrainedPersonRace: string;

  // Section 3: Relationship
  relationshipChildren: boolean;
  relationshipChildrenNames: string;
  relationshipMarried: boolean;
  relationshipFormerlyMarried: boolean;
  relationshipDating: boolean;
  relationshipEngaged: boolean;
  relationshipRelated: boolean;
  relatedParent: boolean;
  relatedSibling: boolean;
  relatedChild: boolean;
  relatedGrandparent: boolean;
  relatedChildSpouse: boolean;
  relatedGrandchild: boolean;
  relationshipCohabitant: boolean;
  cohabitantAsFamily: boolean | null;

  // Section 4: Other Orders
  otherOrdersNo: boolean;
  otherOrdersYes: boolean;
  otherOrder1Date: string;
  otherOrder1Expires: string;
  otherOrder2Date: string;
  otherOrder2Expires: string;
  otherCasesNo: boolean;
  otherCasesYes: boolean;
  otherCaseCustody: boolean;
  otherCaseDivorce: boolean;
  otherCaseJuvenile: boolean;
  otherCaseGuardianship: boolean;
  otherCaseCriminal: boolean;
  otherCaseOther: boolean;
  otherCaseOtherType: string;

  // Section 5: Describe Abuse
  abuseDate: string;
  witnessesUnknown: boolean;
  witnessesNo: boolean;
  witnessesYes: boolean;
  witnessNames: string;
  weaponNo: boolean;
  weaponYes: boolean;
  weaponDescription: string;
  harmNo: boolean;
  harmYes: boolean;
  harmDescription: string;
  policeUnknown: boolean;
  policeNo: boolean;
  policeYes: boolean;
  abuseDetails: string;
  frequencyOnce: boolean;
  frequency2to5: boolean;
  frequencyWeekly: boolean;
  frequencyOther: boolean;
  frequencyOtherText: string;
  frequencyDates: string;

  // Signature
  signatureDate: string;
  signaturePrintName: string;
}

interface DV100FormTemplateProps {
  data?: Partial<DV100FormData>;
  onChange?: (data: DV100FormData) => void;
  readOnly?: boolean;
}

const defaultData: DV100FormData = {
  yourName: '',
  yourAge: '',
  mailingAddress: '',
  mailingCity: '',
  mailingState: '',
  mailingZip: '',
  telephone: '',
  fax: '',
  email: '',
  lawyerName: '',
  lawyerBarNumber: '',
  lawyerFirmName: '',
  county: '',
  caseNumber: '',
  restrainedPersonName: '',
  restrainedPersonAge: '',
  restrainedPersonDOB: '',
  restrainedPersonGenderM: false,
  restrainedPersonGenderF: false,
  restrainedPersonGenderNonbinary: false,
  restrainedPersonRace: '',
  relationshipChildren: false,
  relationshipChildrenNames: '',
  relationshipMarried: false,
  relationshipFormerlyMarried: false,
  relationshipDating: false,
  relationshipEngaged: false,
  relationshipRelated: false,
  relatedParent: false,
  relatedSibling: false,
  relatedChild: false,
  relatedGrandparent: false,
  relatedChildSpouse: false,
  relatedGrandchild: false,
  relationshipCohabitant: false,
  cohabitantAsFamily: null,
  otherOrdersNo: false,
  otherOrdersYes: false,
  otherOrder1Date: '',
  otherOrder1Expires: '',
  otherOrder2Date: '',
  otherOrder2Expires: '',
  otherCasesNo: false,
  otherCasesYes: false,
  otherCaseCustody: false,
  otherCaseDivorce: false,
  otherCaseJuvenile: false,
  otherCaseGuardianship: false,
  otherCaseCriminal: false,
  otherCaseOther: false,
  otherCaseOtherType: '',
  abuseDate: '',
  witnessesUnknown: false,
  witnessesNo: false,
  witnessesYes: false,
  witnessNames: '',
  weaponNo: false,
  weaponYes: false,
  weaponDescription: '',
  harmNo: false,
  harmYes: false,
  harmDescription: '',
  policeUnknown: false,
  policeNo: false,
  policeYes: false,
  abuseDetails: '',
  frequencyOnce: false,
  frequency2to5: false,
  frequencyWeekly: false,
  frequencyOther: false,
  frequencyOtherText: '',
  frequencyDates: '',
  signatureDate: '',
  signaturePrintName: '',
};

export const DV100FormTemplate: React.FC<DV100FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV100FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV100FormData, value: string | boolean | null) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof DV100FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof DV100FormData, value);
    }
  };

  return (
    <div className="dv100-form-container">
      <form className="dv100-form" data-form="DV-100" data-rev="2025-01-01">
        {/* Page 1 */}
        <section className="dv100-page" data-page="1">
          {/* Header */}
          <div className="dv100-judicial-council-info">
            Judicial Council of California,<br />
            www.courts.ca.gov<br />
            Rev. January 1, 2025, Mandatory Form<br />
            Family Code, § 6200 et seq.
          </div>

          <div className="dv100-header">
            <div className="dv100-form-title">Request for Domestic Violence Restraining Order</div>
            <div className="dv100-form-subtitle">(Domestic Violence Prevention)</div>
          </div>

          <div className="dv100-warning-notice">
            <strong>This is not a Court Order.</strong>
          </div>

          <div className="dv100-header-grid">
            <div>
              <div className="dv100-form-id">Request for Domestic Violence Restraining Order</div>
              <div className="dv100-form-id">DV-100</div>
            </div>
            <div className="dv100-clerk-stamp-area">
              Clerk stamps date here when form is filed.
            </div>
          </div>

          {/* Court Information */}
          <div className="dv100-court-info-section">
            <div className="dv100-court-row">
              <strong>Fill in court name and street address:</strong><br />
              Superior Court of California, County of{' '}
              <input
                type="text"
                name="county"
                value={formData.county}
                onChange={handleInputChange}
                className="dv100-input dv100-input-long"
                readOnly={readOnly}
              />
            </div>
            <div className="dv100-court-row">
              <strong>Court fills in case number when form is filed.</strong><br />
              Case Number:{' '}
              <input
                type="text"
                name="caseNumber"
                value={formData.caseNumber}
                onChange={handleInputChange}
                className="dv100-input dv100-input-medium"
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="dv100-instructions-box">
            <strong>Instructions</strong><br />
            To ask for a domestic violence restraining order, you will need to complete this form and other forms (see page 13 for list of forms). If this case includes sensitive information about a minor child (under 18 years old), see form DV-160-INFO, Privacy Protection for a Minor (Person Under 18 Years Old), for more information on how to protect the child's information.
          </div>

          {/* Section 1: Person Asking for Protection */}
          <div className="dv100-section">
            <div className="dv100-section-header">
              <div className="dv100-section-number">1</div>
              <div className="dv100-section-body">
                <div className="dv100-section-title">Person Asking for Protection</div>
                <div className="dv100-section-content">
                  <div className="dv100-form-row">
                    <span className="dv100-label">a. Your name:</span>
                    <input
                      type="text"
                      name="yourName"
                      value={formData.yourName}
                      onChange={handleInputChange}
                      className="dv100-input dv100-input-extra-long"
                      readOnly={readOnly}
                      autoComplete="name"
                    />
                  </div>
                  <div className="dv100-form-row">
                    <span className="dv100-label">b. Your age:</span>
                    <input
                      type="text"
                      name="yourAge"
                      value={formData.yourAge}
                      onChange={handleInputChange}
                      className="dv100-input dv100-input-short"
                      readOnly={readOnly}
                    />
                  </div>

                  <div className="dv100-subsection">
                    <div className="dv100-label">c. Address where you can receive court papers</div>
                    <div className="dv100-address-note">
                      (This address will be used by the court and by the person in <strong>2</strong> to send you official court dates, orders, and papers. For privacy, you may use another address like a post office box, a Safe at Home address, or another person's address, if you have their permission and can get your mail regularly. If you have a lawyer, give their information.)
                    </div>
                    <div className="dv100-form-row">
                      <span className="dv100-label">Address:</span>
                      <input
                        type="text"
                        name="mailingAddress"
                        value={formData.mailingAddress}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-extra-long"
                        readOnly={readOnly}
                        autoComplete="street-address"
                      />
                    </div>
                    <div className="dv100-form-row-inline">
                      <span className="dv100-label">City:</span>
                      <input
                        type="text"
                        name="mailingCity"
                        value={formData.mailingCity}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-medium"
                        readOnly={readOnly}
                        autoComplete="address-level2"
                      />
                      <span className="dv100-label">State:</span>
                      <input
                        type="text"
                        name="mailingState"
                        value={formData.mailingState}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-short"
                        maxLength={2}
                        readOnly={readOnly}
                        autoComplete="address-level1"
                      />
                      <span className="dv100-label">Zip:</span>
                      <input
                        type="text"
                        name="mailingZip"
                        value={formData.mailingZip}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-short"
                        readOnly={readOnly}
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <div className="dv100-label">d. Your contact information (optional)</div>
                    <div className="dv100-address-note">
                      (The court could use this information to contact you. If you don't want the person in <strong>2</strong> to have this information, leave it blank or provide a safe phone number or email address. If you have a lawyer, give their information.)
                    </div>
                    <div className="dv100-form-row-inline">
                      <span className="dv100-label">Telephone:</span>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-medium"
                        readOnly={readOnly}
                        autoComplete="tel"
                      />
                      <span className="dv100-label">Fax:</span>
                      <input
                        type="tel"
                        name="fax"
                        value={formData.fax}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-medium"
                        readOnly={readOnly}
                      />
                    </div>
                    <div className="dv100-form-row">
                      <span className="dv100-label">Email Address:</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-extra-long"
                        readOnly={readOnly}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <div className="dv100-label">e. Your lawyer's information (if you have one)</div>
                    <div className="dv100-form-row-inline">
                      <span className="dv100-label">Name:</span>
                      <input
                        type="text"
                        name="lawyerName"
                        value={formData.lawyerName}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-long"
                        readOnly={readOnly}
                      />
                      <span className="dv100-label">State Bar No.:</span>
                      <input
                        type="text"
                        name="lawyerBarNumber"
                        value={formData.lawyerBarNumber}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-medium"
                        readOnly={readOnly}
                      />
                    </div>
                    <div className="dv100-form-row">
                      <span className="dv100-label">Firm Name:</span>
                      <input
                        type="text"
                        name="lawyerFirmName"
                        value={formData.lawyerFirmName}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-extra-long"
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Person You Want Protection From */}
          <div className="dv100-section">
            <div className="dv100-section-header">
              <div className="dv100-section-number">2</div>
              <div className="dv100-section-body">
                <div className="dv100-section-title">Person You Want Protection From</div>
                <div className="dv100-section-content">
                  <div className="dv100-form-row">
                    <span className="dv100-label">a. Full name:</span>
                    <input
                      type="text"
                      name="restrainedPersonName"
                      value={formData.restrainedPersonName}
                      onChange={handleInputChange}
                      className="dv100-input dv100-input-extra-long"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="dv100-form-row">
                    <span className="dv100-label">b. Age (give estimate if you do not know exact age):</span>
                    <input
                      type="text"
                      name="restrainedPersonAge"
                      value={formData.restrainedPersonAge}
                      onChange={handleInputChange}
                      className="dv100-input dv100-input-short"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="dv100-form-row">
                    <span className="dv100-label">c. Date of birth (if known):</span>
                    <input
                      type="text"
                      name="restrainedPersonDOB"
                      value={formData.restrainedPersonDOB}
                      onChange={handleInputChange}
                      className="dv100-input dv100-input-medium"
                      placeholder="MM/DD/YYYY"
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="dv100-form-row-inline">
                    <span className="dv100-label">d. Gender:</span>
                    <label className="dv100-checkbox-label">
                      <input
                        type="checkbox"
                        name="restrainedPersonGenderM"
                        checked={formData.restrainedPersonGenderM}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      M
                    </label>
                    <label className="dv100-checkbox-label">
                      <input
                        type="checkbox"
                        name="restrainedPersonGenderF"
                        checked={formData.restrainedPersonGenderF}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      F
                    </label>
                    <label className="dv100-checkbox-label">
                      <input
                        type="checkbox"
                        name="restrainedPersonGenderNonbinary"
                        checked={formData.restrainedPersonGenderNonbinary}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      Nonbinary
                    </label>
                  </div>
                  <div className="dv100-form-row">
                    <span className="dv100-label">e. Race:</span>
                    <input
                      type="text"
                      name="restrainedPersonRace"
                      value={formData.restrainedPersonRace}
                      onChange={handleInputChange}
                      className="dv100-input dv100-input-long"
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Relationship */}
          <div className="dv100-section">
            <div className="dv100-section-header">
              <div className="dv100-section-number">3</div>
              <div className="dv100-section-body">
                <div className="dv100-section-title">Your Relationship to the Person in <strong>2</strong></div>
                <div className="dv100-address-note">
                  (If you do not have one of these relationships with the person in <strong>2</strong>, do not complete the rest of this form. You may be eligible for another type of restraining order. Learn more at https://selfhelp.courts.ca.gov/restraining-orders.)
                </div>
                <div className="dv100-address-note">
                  <strong>(Check all that apply)</strong>
                </div>
                <div className="dv100-section-content">
                  <div className="dv100-checkbox-group">
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipChildren"
                        checked={formData.relationshipChildren}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>a.</strong> We have a child or children together (names of children):{' '}
                      <input
                        type="text"
                        name="relationshipChildrenNames"
                        value={formData.relationshipChildrenNames}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-long"
                        readOnly={readOnly}
                      />
                    </label>
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipMarried"
                        checked={formData.relationshipMarried}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>b.</strong> We are married or registered domestic partners.
                    </label>
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipFormerlyMarried"
                        checked={formData.relationshipFormerlyMarried}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>c.</strong> We used to be married or registered domestic partners.
                    </label>
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipDating"
                        checked={formData.relationshipDating}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>d.</strong> We are dating or used to date.
                    </label>
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipEngaged"
                        checked={formData.relationshipEngaged}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>e.</strong> We are or used to be engaged to be married.
                    </label>
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipRelated"
                        checked={formData.relationshipRelated}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>f.</strong> We are related. The person in <strong>2</strong> is my (check all that apply):
                    </label>
                    {formData.relationshipRelated && (
                      <div className="dv100-nested-checkboxes">
                        <label className="dv100-checkbox-item">
                          <input
                            type="checkbox"
                            name="relatedParent"
                            checked={formData.relatedParent}
                            onChange={handleInputChange}
                            disabled={readOnly}
                          />
                          Parent, stepparent, or parent-in-law
                        </label>
                        <label className="dv100-checkbox-item">
                          <input
                            type="checkbox"
                            name="relatedSibling"
                            checked={formData.relatedSibling}
                            onChange={handleInputChange}
                            disabled={readOnly}
                          />
                          Brother, sister, sibling, stepsibling, or sibling in-law
                        </label>
                        <label className="dv100-checkbox-item">
                          <input
                            type="checkbox"
                            name="relatedChild"
                            checked={formData.relatedChild}
                            onChange={handleInputChange}
                            disabled={readOnly}
                          />
                          Child, stepchild, or legally adopted child
                        </label>
                        <label className="dv100-checkbox-item">
                          <input
                            type="checkbox"
                            name="relatedGrandparent"
                            checked={formData.relatedGrandparent}
                            onChange={handleInputChange}
                            disabled={readOnly}
                          />
                          Grandparent, step-grandparent, or grandparent-in-law
                        </label>
                        <label className="dv100-checkbox-item">
                          <input
                            type="checkbox"
                            name="relatedChildSpouse"
                            checked={formData.relatedChildSpouse}
                            onChange={handleInputChange}
                            disabled={readOnly}
                          />
                          Child's spouse
                        </label>
                        <label className="dv100-checkbox-item">
                          <input
                            type="checkbox"
                            name="relatedGrandchild"
                            checked={formData.relatedGrandchild}
                            onChange={handleInputChange}
                            disabled={readOnly}
                          />
                          Grandchild, step-grandchild, or grandchild-in-law
                        </label>
                      </div>
                    )}
                    <label className="dv100-checkbox-item">
                      <input
                        type="checkbox"
                        name="relationshipCohabitant"
                        checked={formData.relationshipCohabitant}
                        onChange={handleInputChange}
                        disabled={readOnly}
                      />
                      <strong>g.</strong> We live together or used to live together.
                    </label>
                    {formData.relationshipCohabitant && (
                      <div className="dv100-nested-content">
                        Have you lived together with the person in <strong>2</strong> as a family or household (more than just roommates)?
                        <label className="dv100-checkbox-label">
                          <input
                            type="radio"
                            name="cohabitantAsFamily"
                            checked={formData.cohabitantAsFamily === true}
                            onChange={() => handleChange('cohabitantAsFamily', true)}
                            disabled={readOnly}
                          />
                          Yes
                        </label>
                        <label className="dv100-checkbox-label">
                          <input
                            type="radio"
                            name="cohabitantAsFamily"
                            checked={formData.cohabitantAsFamily === false}
                            onChange={() => handleChange('cohabitantAsFamily', false)}
                            disabled={readOnly}
                          />
                          No
                        </label>
                        <div className="dv100-small-note">
                          (If no, you do not qualify for this kind of restraining order unless you checked one of the other relationships listed above.)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Other Restraining Orders */}
          <div className="dv100-section">
            <div className="dv100-section-header">
              <div className="dv100-section-number">4</div>
              <div className="dv100-section-body">
                <div className="dv100-section-title">Other Restraining Orders and Court Cases</div>
                <div className="dv100-section-content">
                  <div className="dv100-subsection">
                    <strong>a.</strong> Are there any restraining orders currently in place or that have expired in the last six months?
                    <div className="dv100-nested-content">
                      <label className="dv100-checkbox-item">
                        <input
                          type="checkbox"
                          name="otherOrdersNo"
                          checked={formData.otherOrdersNo}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        No
                      </label>
                      <label className="dv100-checkbox-item">
                        <input
                          type="checkbox"
                          name="otherOrdersYes"
                          checked={formData.otherOrdersYes}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Yes (If yes, give information below and attach a copy if you have one.)
                      </label>
                      {formData.otherOrdersYes && (
                        <div className="dv100-order-details">
                          <div className="dv100-form-row-inline">
                            (1) Date of order:{' '}
                            <input
                              type="text"
                              name="otherOrder1Date"
                              value={formData.otherOrder1Date}
                              onChange={handleInputChange}
                              className="dv100-input dv100-input-medium"
                              readOnly={readOnly}
                            />
                            Date it expires:{' '}
                            <input
                              type="text"
                              name="otherOrder1Expires"
                              value={formData.otherOrder1Expires}
                              onChange={handleInputChange}
                              className="dv100-input dv100-input-medium"
                              readOnly={readOnly}
                            />
                          </div>
                          <div className="dv100-form-row-inline">
                            (2) Date of order:{' '}
                            <input
                              type="text"
                              name="otherOrder2Date"
                              value={formData.otherOrder2Date}
                              onChange={handleInputChange}
                              className="dv100-input dv100-input-medium"
                              readOnly={readOnly}
                            />
                            Date it expires:{' '}
                            <input
                              type="text"
                              name="otherOrder2Expires"
                              value={formData.otherOrder2Expires}
                              onChange={handleInputChange}
                              className="dv100-input dv100-input-medium"
                              readOnly={readOnly}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <strong>b.</strong> Are you involved in any other court case with the person in <strong>2</strong>?
                    <div className="dv100-nested-content">
                      <label className="dv100-checkbox-item">
                        <input
                          type="checkbox"
                          name="otherCasesNo"
                          checked={formData.otherCasesNo}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        No
                      </label>
                      <label className="dv100-checkbox-item">
                        <input
                          type="checkbox"
                          name="otherCasesYes"
                          checked={formData.otherCasesYes}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Yes (If you know, list where the case was filed, the year, and case number.)
                      </label>
                      {formData.otherCasesYes && (
                        <div className="dv100-case-types">
                          <label className="dv100-checkbox-item">
                            <input
                              type="checkbox"
                              name="otherCaseCustody"
                              checked={formData.otherCaseCustody}
                              onChange={handleInputChange}
                              disabled={readOnly}
                            />
                            Custody
                          </label>
                          <label className="dv100-checkbox-item">
                            <input
                              type="checkbox"
                              name="otherCaseDivorce"
                              checked={formData.otherCaseDivorce}
                              onChange={handleInputChange}
                              disabled={readOnly}
                            />
                            Divorce
                          </label>
                          <label className="dv100-checkbox-item">
                            <input
                              type="checkbox"
                              name="otherCaseJuvenile"
                              checked={formData.otherCaseJuvenile}
                              onChange={handleInputChange}
                              disabled={readOnly}
                            />
                            Juvenile (child welfare or juvenile justice)
                          </label>
                          <label className="dv100-checkbox-item">
                            <input
                              type="checkbox"
                              name="otherCaseGuardianship"
                              checked={formData.otherCaseGuardianship}
                              onChange={handleInputChange}
                              disabled={readOnly}
                            />
                            Guardianship
                          </label>
                          <label className="dv100-checkbox-item">
                            <input
                              type="checkbox"
                              name="otherCaseCriminal"
                              checked={formData.otherCaseCriminal}
                              onChange={handleInputChange}
                              disabled={readOnly}
                            />
                            Criminal
                          </label>
                          <label className="dv100-checkbox-item">
                            <input
                              type="checkbox"
                              name="otherCaseOther"
                              checked={formData.otherCaseOther}
                              onChange={handleInputChange}
                              disabled={readOnly}
                            />
                            Other (what kind of case?):{' '}
                            <input
                              type="text"
                              name="otherCaseOtherType"
                              value={formData.otherCaseOtherType}
                              onChange={handleInputChange}
                              className="dv100-input dv100-input-long"
                              readOnly={readOnly}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Describe Abuse */}
          <div className="dv100-section">
            <div className="dv100-section-header">
              <div className="dv100-section-number">5</div>
              <div className="dv100-section-body">
                <div className="dv100-section-title">Describe Abuse</div>
                <div className="dv100-instructions-box">
                  In this section, explain how the person in <strong>2</strong> has been abusive. The judge will use this information to decide your request.
                </div>
                <div className="dv100-section-content">
                  <div className="dv100-abuse-examples">
                    <div className="dv100-abuse-column">
                      <ul>
                        <li>made repeated unwanted contact with you</li>
                        <li>tracked, controlled, or blocked your movements</li>
                        <li>kept you from getting food or basic needs</li>
                        <li>isolated you from friends, family, or other support</li>
                        <li>made threats based on actual or suspected immigration status</li>
                        <li>made you do something by force, threat, or intimidation</li>
                        <li>stopped you from accessing or earning money</li>
                      </ul>
                    </div>
                    <div className="dv100-abuse-column">
                      <ul>
                        <li>tried to control/interfere with your contraception, birth control, pregnancy</li>
                        <li>harassed you</li>
                        <li>hit, kicked, pushed, or bit you</li>
                        <li>injured you or tried to</li>
                        <li>threatened to hurt or kill you</li>
                        <li>sexually abused you</li>
                        <li>abused a pet or animal</li>
                        <li>destroyed your property</li>
                        <li>choked or strangled you</li>
                        <li>abused your children</li>
                      </ul>
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <div className="dv100-form-row">
                      <span className="dv100-label">a. Date of abuse (estimate if unknown):</span>
                      <input
                        type="text"
                        name="abuseDate"
                        value={formData.abuseDate}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-medium"
                        readOnly={readOnly}
                      />
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <strong>b.</strong> Did anyone else hear or see what happened on this day?
                    <div className="dv100-inline-options">
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="witnessesUnknown"
                          checked={formData.witnessesUnknown}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        I don't know
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="witnessesNo"
                          checked={formData.witnessesNo}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        No
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="witnessesYes"
                          checked={formData.witnessesYes}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Yes (names):{' '}
                        <input
                          type="text"
                          name="witnessNames"
                          value={formData.witnessNames}
                          onChange={handleInputChange}
                          className="dv100-input dv100-input-long"
                          readOnly={readOnly}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <strong>c.</strong> Did the person in <strong>2</strong> use or threaten to use a gun or other weapon?
                    <div className="dv100-inline-options">
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="weaponNo"
                          checked={formData.weaponNo}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        No
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="weaponYes"
                          checked={formData.weaponYes}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Yes (describe):{' '}
                        <input
                          type="text"
                          name="weaponDescription"
                          value={formData.weaponDescription}
                          onChange={handleInputChange}
                          className="dv100-input dv100-input-long"
                          readOnly={readOnly}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <strong>d.</strong> Did the person in <strong>2</strong> cause you any emotional or physical harm?
                    <div className="dv100-inline-options">
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="harmNo"
                          checked={formData.harmNo}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        No
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="harmYes"
                          checked={formData.harmYes}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Yes (describe):{' '}
                        <input
                          type="text"
                          name="harmDescription"
                          value={formData.harmDescription}
                          onChange={handleInputChange}
                          className="dv100-input dv100-input-long"
                          readOnly={readOnly}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <strong>e.</strong> Did the police come?
                    <div className="dv100-inline-options">
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="policeUnknown"
                          checked={formData.policeUnknown}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        I don't know
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="policeNo"
                          checked={formData.policeNo}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        No
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="policeYes"
                          checked={formData.policeYes}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Yes
                      </label>
                    </div>
                  </div>

                  <div className="dv100-subsection">
                    <strong>f.</strong> Give more details about how the person in <strong>2</strong> was abusive on this day:
                    <textarea
                      name="abuseDetails"
                      value={formData.abuseDetails}
                      onChange={handleInputChange}
                      className="dv100-textarea"
                      rows={6}
                      readOnly={readOnly}
                    />
                  </div>

                  <div className="dv100-subsection">
                    <strong>g.</strong> How often has the person in <strong>2</strong> abused you like this?
                    <div className="dv100-inline-options">
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="frequencyOnce"
                          checked={formData.frequencyOnce}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Just this once
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="frequency2to5"
                          checked={formData.frequency2to5}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        2–5 times
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="frequencyWeekly"
                          checked={formData.frequencyWeekly}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Weekly
                      </label>
                      <label className="dv100-checkbox-label">
                        <input
                          type="checkbox"
                          name="frequencyOther"
                          checked={formData.frequencyOther}
                          onChange={handleInputChange}
                          disabled={readOnly}
                        />
                        Other:{' '}
                        <input
                          type="text"
                          name="frequencyOtherText"
                          value={formData.frequencyOtherText}
                          onChange={handleInputChange}
                          className="dv100-input dv100-input-medium"
                          readOnly={readOnly}
                        />
                      </label>
                    </div>
                    <div className="dv100-form-row">
                      <span>Give dates or estimates of when it happened, if known:</span>
                      <input
                        type="text"
                        name="frequencyDates"
                        value={formData.frequencyDates}
                        onChange={handleInputChange}
                        className="dv100-input dv100-input-extra-long"
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="dv100-signature-section">
            <div className="dv100-section-title">Your Signature</div>
            <div className="dv100-declaration">
              I declare under penalty of perjury under the laws of the State of California that the information above is true and correct.
            </div>
            <div className="dv100-signature-grid">
              <div>
                <div className="dv100-form-row">
                  <span>Date:</span>
                  <input
                    type="date"
                    name="signatureDate"
                    value={formData.signatureDate}
                    onChange={handleInputChange}
                    className="dv100-input dv100-input-medium"
                    readOnly={readOnly}
                  />
                </div>
                <div className="dv100-signature-line"></div>
                <div className="dv100-signature-label">Sign your name</div>
              </div>
              <div>
                <div className="dv100-form-row">
                  <input
                    type="text"
                    name="signaturePrintName"
                    value={formData.signaturePrintName}
                    onChange={handleInputChange}
                    className="dv100-input dv100-input-extra-long"
                    readOnly={readOnly}
                  />
                </div>
                <div className="dv100-signature-label">Type or print your name</div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="dv100-next-steps">
            <div className="dv100-next-steps-title">Your Next Steps</div>
            <div className="dv100-step">
              <span className="dv100-step-marker">&#x25CF;</span> You must complete at least three additional forms:
              <div className="dv100-step-content">
                Form <strong>DV-110</strong>, Temporary Restraining Order (only items 1, 2 and 3)<br />
                Form <strong>DV-109</strong>, Notice of Court Hearing (only items 1 and 2)<br />
                Form <strong>CLETS-001</strong>, Confidential Information for Law Enforcement
              </div>
            </div>
            <div className="dv100-step">
              <span className="dv100-step-marker">&#x25CF;</span> Turn in your completed forms to the court. Find out when your forms will be ready for you.
            </div>
            <div className="dv100-step">
              <span className="dv100-step-marker">&#x25CF;</span> Once you get your forms back from the court, have someone "serve" a copy of all forms on the person in <strong>2</strong>.
            </div>
          </div>

          {/* Footer */}
          <div className="dv100-footer">
            <div>DV-100, Page 1 of 13</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default DV100FormTemplate;
