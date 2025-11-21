import React, { useState } from 'react';
import './FL320FormTemplate.css';

export interface FL320FormData {
  // Party/Attorney Information
  attorney_name: string;
  attorney_bar: string;
  firm_name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  phone: string;
  fax: string;
  email: string;
  attorney_for: string;

  // Court Information
  court_street: string;
  court_mailing: string;
  court_cityzip: string;
  court_branch: string;

  // Case Information
  petitioner: string;
  respondent: string;
  other_party: string;
  case_number: string;

  // Hearing Information
  hearing_date: string;
  hearing_time: string;
  hearing_dept: string;

  // Section 1: Restraining Order Information
  dv_none: boolean;
  dv_in_effect: boolean;

  // Section 2: Child Custody/Visitation
  custody_consent: boolean;
  visitation_consent: boolean;
  custody_do_not_consent: boolean;
  custody_alt: string;

  // Section 3: Child Support
  cs_decl: boolean;
  cs_consent: boolean;
  cs_guideline: boolean;
  cs_do_not_consent: boolean;
  cs_alt: string;

  // Section 4: Spousal Support
  ss_decl: boolean;
  ss_consent: boolean;
  ss_do_not_consent: boolean;
  ss_alt: string;

  // Page 2 - Party Information (repeated)
  petitioner_p2: string;
  respondent_p2: string;
  other_party_p2: string;
  case_number_p2: string;

  // Section 5: Property Control
  pc_consent: boolean;
  pc_do_not_consent: boolean;
  pc_alt: string;

  // Section 6: Attorney's Fees
  af_decl: boolean;
  af_attach: boolean;
  af_consent: boolean;
  af_do_not_consent: boolean;
  af_alt: string;

  // Section 7: Other Orders
  oo_consent: boolean;
  oo_do_not_consent: boolean;
  oo_alt: string;

  // Section 8: Time for Service
  ts_consent: boolean;
  ts_do_not_consent: boolean;
  ts_alt: string;

  // Section 9: Facts
  attach_9: boolean;
  facts: string;

  // Signature
  sign_date: string;
  sign_name: string;
  sign_signature: string;
}

interface FL320FormTemplateProps {
  data?: Partial<FL320FormData>;
  onChange?: (data: FL320FormData) => void;
  readOnly?: boolean;
}

const defaultData: FL320FormData = {
  attorney_name: '',
  attorney_bar: '',
  firm_name: '',
  address_street: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  phone: '',
  fax: '',
  email: '',
  attorney_for: '',
  court_street: '',
  court_mailing: '',
  court_cityzip: '',
  court_branch: '',
  petitioner: '',
  respondent: '',
  other_party: '',
  case_number: '',
  hearing_date: '',
  hearing_time: '',
  hearing_dept: '',
  dv_none: false,
  dv_in_effect: false,
  custody_consent: false,
  visitation_consent: false,
  custody_do_not_consent: false,
  custody_alt: '',
  cs_decl: false,
  cs_consent: false,
  cs_guideline: false,
  cs_do_not_consent: false,
  cs_alt: '',
  ss_decl: false,
  ss_consent: false,
  ss_do_not_consent: false,
  ss_alt: '',
  petitioner_p2: '',
  respondent_p2: '',
  other_party_p2: '',
  case_number_p2: '',
  pc_consent: false,
  pc_do_not_consent: false,
  pc_alt: '',
  af_decl: false,
  af_attach: false,
  af_consent: false,
  af_do_not_consent: false,
  af_alt: '',
  oo_consent: false,
  oo_do_not_consent: false,
  oo_alt: '',
  ts_consent: false,
  ts_do_not_consent: false,
  ts_alt: '',
  attach_9: true,
  facts: '',
  sign_date: '',
  sign_name: '',
  sign_signature: '',
};

export const FL320FormTemplate: React.FC<FL320FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FL320FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof FL320FormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof FL320FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof FL320FormData, value);
    }
  };

  return (
    <div className="fl320-form-container">
      <form className="fl320-form" data-form="FL-320" data-rev="2025-07-01">
        {/* Page 1 */}
        <section className="fl320-page" data-page="1">
          <div className="fl320-header-line">
            <div className="fl320-judicial">
              <div>Form Adopted for Mandatory Use<br />Judicial Council of California</div>
              <div className="fl320-form-id-small">FL-320 [Rev. July 1, 2025]</div>
              <div>RESPONSIVE DECLARATION TO REQUEST FOR ORDER</div>
              <div className="fl320-small">Code of Civil Procedure, § 1005 · Cal. Rules of Court, rule 5.92 · courts.ca.gov</div>
            </div>
            <div className="fl320-code">FL-320</div>
          </div>

          <div className="fl320-row">
            <div className="fl320-w-60 fl320-box">
              <div className="fl320-box-label">Party Without Attorney or Attorney</div>
              <div className="fl320-row fl320-mt6">
                <div className="fl320-w-60">
                  <label className="fl320-small">Name</label>
                  <input
                    name="attorney_name"
                    type="text"
                    value={formData.attorney_name}
                    onChange={handleInputChange}
                    autoComplete="name"
                    readOnly={readOnly}
                  />
                </div>
                <div className="fl320-w-40">
                  <label className="fl320-small">State Bar Number</label>
                  <input
                    name="attorney_bar"
                    type="text"
                    value={formData.attorney_bar}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="fl320-row fl320-mt6">
                <div className="fl320-w-100">
                  <label className="fl320-small">Firm Name</label>
                  <input
                    name="firm_name"
                    type="text"
                    value={formData.firm_name}
                    onChange={handleInputChange}
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="fl320-row fl320-mt6">
                <div className="fl320-w-60">
                  <label className="fl320-small">Street Address</label>
                  <input
                    name="address_street"
                    type="text"
                    value={formData.address_street}
                    onChange={handleInputChange}
                    autoComplete="street-address"
                    readOnly={readOnly}
                  />
                </div>
                <div className="fl320-w-40">
                  <label className="fl320-small">City</label>
                  <input
                    name="address_city"
                    type="text"
                    value={formData.address_city}
                    onChange={handleInputChange}
                    autoComplete="address-level2"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="fl320-row fl320-mt6">
                <div className="fl320-w-30">
                  <label className="fl320-small">State</label>
                  <input
                    name="address_state"
                    type="text"
                    value={formData.address_state}
                    onChange={handleInputChange}
                    maxLength={2}
                    autoComplete="address-level1"
                    readOnly={readOnly}
                  />
                </div>
                <div className="fl320-w-30">
                  <label className="fl320-small">ZIP Code</label>
                  <input
                    name="address_zip"
                    type="text"
                    value={formData.address_zip}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    readOnly={readOnly}
                  />
                </div>
                <div className="fl320-w-40">
                  <label className="fl320-small">Telephone</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="fl320-row fl320-mt6">
                <div className="fl320-w-50">
                  <label className="fl320-small">Fax</label>
                  <input
                    name="fax"
                    type="tel"
                    value={formData.fax}
                    onChange={handleInputChange}
                    readOnly={readOnly}
                  />
                </div>
                <div className="fl320-w-50">
                  <label className="fl320-small">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="fl320-row fl320-mt6">
                <div className="fl320-w-100">
                  <label className="fl320-small">Attorney For (name)</label>
                  <input
                    name="attorney_for"
                    type="text"
                    value={formData.attorney_for}
                    onChange={handleInputChange}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
            <div className="fl320-w-40 fl320-box">
              <div className="fl320-box-label">For Court Use Only</div>
              <div className="fl320-courtuse" aria-label="Court Use Only"></div>
            </div>
          </div>

          <div className="fl320-box fl320-mt12">
            <div className="fl320-box-label">Superior Court of California, County of</div>
            <div className="fl320-row fl320-mt6">
              <div className="fl320-w-60">
                <label className="fl320-small">Street Address</label>
                <input
                  name="court_street"
                  type="text"
                  value={formData.court_street}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="fl320-w-40">
                <label className="fl320-small">Mailing Address</label>
                <input
                  name="court_mailing"
                  type="text"
                  value={formData.court_mailing}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="fl320-row fl320-mt6">
              <div className="fl320-w-60">
                <label className="fl320-small">City and ZIP Code</label>
                <input
                  name="court_cityzip"
                  type="text"
                  value={formData.court_cityzip}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="fl320-w-40">
                <label className="fl320-small">Branch Name</label>
                <input
                  name="court_branch"
                  type="text"
                  value={formData.court_branch}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="fl320-row fl320-mt12">
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Petitioner</label>
              <input
                name="petitioner"
                type="text"
                value={formData.petitioner}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Respondent</label>
              <input
                name="respondent"
                type="text"
                value={formData.respondent}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
          </div>
          <div className="fl320-row fl320-mt6">
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Other Parent/Party</label>
              <input
                name="other_party"
                type="text"
                value={formData.other_party}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
            <div className="fl320-w-25 fl320-box">
              <label className="fl320-small">Case Number</label>
              <input
                name="case_number"
                type="text"
                value={formData.case_number}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
            <div className="fl320-w-25 fl320-box">
              <label className="fl320-small">Form Code</label>
              <input
                name="form_code"
                type="text"
                value="FL-320"
                readOnly
              />
            </div>
          </div>

          <div className="fl320-box fl320-mt12">
            <div className="fl320-title">Responsive Declaration to Request for Order</div>
            <div className="fl320-row fl320-mt6">
              <div className="fl320-w-33">
                <label className="fl320-small">Hearing Date</label>
                <input
                  name="hearing_date"
                  type="date"
                  value={formData.hearing_date}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="fl320-w-33">
                <label className="fl320-small">Time</label>
                <input
                  name="hearing_time"
                  type="time"
                  value={formData.hearing_time}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="fl320-w-33">
                <label className="fl320-small">Dept. / Room</label>
                <input
                  name="hearing_dept"
                  type="text"
                  value={formData.hearing_dept}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="fl320-note fl320-mt12 fl320-small">
              Read Information Sheet: Responsive Declaration to Request for Order (form FL-320-INFO) for more information about this form.
            </div>
          </div>

          {/* Section 1 */}
          <div className="fl320-box fl320-mt12" id="sec-1">
            <div className="fl320-title">1. Restraining Order Information</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="dv_none"
                checked={formData.dv_none}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              No domestic violence restraining/protective orders are now in effect between the parties in this case.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="dv_in_effect"
                checked={formData.dv_in_effect}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I agree that one or more domestic violence restraining/protective orders are now in effect between the parties in this case.
            </label>
          </div>

          {/* Section 2 */}
          <div className="fl320-box fl320-mt12" id="sec-2">
            <div className="fl320-title">2. Child Custody / Visitation (Parenting Time)</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="custody_consent"
                checked={formData.custody_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested for child custody (legal and physical custody).
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="visitation_consent"
                checked={formData.visitation_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested for visitation (parenting time).
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="custody_do_not_consent"
                checked={formData.custody_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested for child custody / visitation (parenting time) but I consent to the following order:
            </label>
            <textarea
              name="custody_alt"
              value={formData.custody_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Section 3 */}
          <div className="fl320-box fl320-mt12" id="sec-3">
            <div className="fl320-title">3. Child Support</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="cs_decl"
                checked={formData.cs_decl}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I have completed and filed a current Income and Expense Declaration (FL-150) or, if eligible, a current Financial Statement (Simplified) (FL-155) to support my responsive declaration.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="cs_consent"
                checked={formData.cs_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="cs_guideline"
                checked={formData.cs_guideline}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to guideline support.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="cs_do_not_consent"
                checked={formData.cs_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested but I consent to the following order:
            </label>
            <textarea
              name="cs_alt"
              value={formData.cs_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Section 4 */}
          <div className="fl320-box fl320-mt12" id="sec-4">
            <div className="fl320-title">4. Spousal or Domestic Partner Support</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="ss_decl"
                checked={formData.ss_decl}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I have completed and filed a current Income and Expense Declaration (FL-150) to support my responsive declaration.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="ss_consent"
                checked={formData.ss_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="ss_do_not_consent"
                checked={formData.ss_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested but I consent to the following order:
            </label>
            <textarea
              name="ss_alt"
              value={formData.ss_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          <div className="fl320-footer">
            <div>FL-320 [Rev. July 1, 2025] Responsive Declaration to Request for Order</div>
            <div className="fl320-code">FL-320</div>
          </div>
          <div className="fl320-pageno">Page 1 of 2</div>
        </section>

        {/* Page 2 */}
        <section className="fl320-page" data-page="2">
          <div className="fl320-row">
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Petitioner</label>
              <input
                name="petitioner_p2"
                type="text"
                value={formData.petitioner_p2}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Respondent</label>
              <input
                name="respondent_p2"
                type="text"
                value={formData.respondent_p2}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
          </div>
          <div className="fl320-row fl320-mt6">
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Other Parent/Party</label>
              <input
                name="other_party_p2"
                type="text"
                value={formData.other_party_p2}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
            <div className="fl320-w-50 fl320-box">
              <label className="fl320-small">Case Number</label>
              <input
                name="case_number_p2"
                type="text"
                value={formData.case_number_p2}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Section 5 */}
          <div className="fl320-box fl320-mt12" id="sec-5">
            <div className="fl320-title">5. Property Control</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="pc_consent"
                checked={formData.pc_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="pc_do_not_consent"
                checked={formData.pc_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested but I consent to the following order:
            </label>
            <textarea
              name="pc_alt"
              value={formData.pc_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Section 6 */}
          <div className="fl320-box fl320-mt12" id="sec-6">
            <div className="fl320-title">6. Attorney's Fees and Costs</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="af_decl"
                checked={formData.af_decl}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I have completed and filed a current Income and Expense Declaration (FL-150) to support my responsive declaration.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="af_attach"
                checked={formData.af_attach}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I have completed and filed with this form a Supporting Declaration for Attorney's Fees and Costs Attachment (FL-158) or a declaration that addresses the factors covered in that form.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="af_consent"
                checked={formData.af_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="af_do_not_consent"
                checked={formData.af_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested but I consent to the following order:
            </label>
            <textarea
              name="af_alt"
              value={formData.af_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Section 7 */}
          <div className="fl320-box fl320-mt12" id="sec-7">
            <div className="fl320-title">7. Other Orders Requested</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="oo_consent"
                checked={formData.oo_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="oo_do_not_consent"
                checked={formData.oo_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested but I consent to the following order:
            </label>
            <textarea
              name="oo_alt"
              value={formData.oo_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Section 8 */}
          <div className="fl320-box fl320-mt12" id="sec-8">
            <div className="fl320-title">8. Time for Service / Time Until Hearing</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="ts_consent"
                checked={formData.ts_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I consent to the order requested.
            </label>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="ts_do_not_consent"
                checked={formData.ts_do_not_consent}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              I do not consent to the order requested but I consent to the following order:
            </label>
            <textarea
              name="ts_alt"
              value={formData.ts_alt}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Section 9 */}
          <div className="fl320-box fl320-mt12" id="sec-9">
            <div className="fl320-title">9. Facts to Support Responsive Declaration</div>
            <div className="fl320-small">The facts that I write and attach to this form cannot be longer than 10 pages, unless the court gives me permission.</div>
            <label className="fl320-checkbox fl320-mt6">
              <input
                type="checkbox"
                name="attach_9"
                checked={formData.attach_9}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              Attachment 9.
            </label>
            <textarea
              name="facts"
              value={formData.facts}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Signature */}
          <div className="fl320-row fl320-mt18">
            <div className="fl320-w-60"></div>
            <div className="fl320-w-40">
              <div className="fl320-small">Date</div>
              <input
                name="sign_date"
                type="date"
                value={formData.sign_date}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
              <div className="fl320-mt6 fl320-small">Type or Print Name</div>
              <input
                name="sign_name"
                type="text"
                value={formData.sign_name}
                onChange={handleInputChange}
                readOnly={readOnly}
              />
              <div className="fl320-mt6 fl320-small">Signature of Declarant</div>
              <input
                name="sign_signature"
                type="text"
                value={formData.sign_signature}
                onChange={handleInputChange}
                placeholder="(wet or digital signature)"
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="fl320-footer">
            <div>FL-320 [Rev. July 1, 2025] Responsive Declaration to Request for Order</div>
            <div className="fl320-code">FL-320</div>
          </div>
          <div className="fl320-pageno">Page 2 of 2</div>
        </section>
      </form>
    </div>
  );
};

export default FL320FormTemplate;
