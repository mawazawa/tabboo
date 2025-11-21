import React, { useState } from 'react';
import './DV200FormTemplate.css';

export interface DV200FormData {
  // Case Information
  caseNumber: string;
  county: string;

  // Parties
  protectedPerson: string;
  restrainedPerson: string;

  // Server Information
  serverName: string;
  serverAddress: string;
  serverCity: string;
  serverState: string;
  serverZip: string;
  serverPhone: string;

  // Documents Served
  servedDV100: boolean;
  servedDV109: boolean;
  servedDV110: boolean;
  servedDV105: boolean;
  servedDV140: boolean;
  servedBlankDV120: boolean;
  servedBlankDV125: boolean;
  servedOther: boolean;
  servedOtherDescription: string;

  // Person Served
  personServedName: string;
  personServedAddress: string;
  personServedCity: string;
  personServedState: string;
  personServedZip: string;

  // Service Details
  serviceDate: string;
  serviceTime: string;
  serviceMethod: 'personal' | 'substituted' | 'mail' | '';

  // Personal Service
  personalServiceLocation: string;

  // Substituted Service
  substitutedPersonName: string;
  substitutedPersonRelationship: string;
  substitutedAddress: string;
  mailedDate: string;

  // Mail Service
  mailDate: string;
  mailCity: string;
  mailState: string;

  // Server Declaration
  serverIsOver18: boolean;
  serverNotParty: boolean;
  serverEmployedBy: string;
  declarationDate: string;
  declarationCity: string;
  declarationState: string;
}

interface DV200FormTemplateProps {
  data?: Partial<DV200FormData>;
  onChange?: (data: DV200FormData) => void;
  readOnly?: boolean;
}

const defaultData: DV200FormData = {
  caseNumber: '',
  county: '',
  protectedPerson: '',
  restrainedPerson: '',
  serverName: '',
  serverAddress: '',
  serverCity: '',
  serverState: '',
  serverZip: '',
  serverPhone: '',
  servedDV100: false,
  servedDV109: false,
  servedDV110: false,
  servedDV105: false,
  servedDV140: false,
  servedBlankDV120: false,
  servedBlankDV125: false,
  servedOther: false,
  servedOtherDescription: '',
  personServedName: '',
  personServedAddress: '',
  personServedCity: '',
  personServedState: '',
  personServedZip: '',
  serviceDate: '',
  serviceTime: '',
  serviceMethod: '',
  personalServiceLocation: '',
  substitutedPersonName: '',
  substitutedPersonRelationship: '',
  substitutedAddress: '',
  mailedDate: '',
  mailDate: '',
  mailCity: '',
  mailState: '',
  serverIsOver18: false,
  serverNotParty: false,
  serverEmployedBy: '',
  declarationDate: '',
  declarationCity: '',
  declarationState: '',
};

export const DV200FormTemplate: React.FC<DV200FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV200FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV200FormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof DV200FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof DV200FormData, value);
    }
  };

  return (
    <div className="dv200-form-container">
      <form className="dv200-form" data-form="DV-200">
        <section className="dv200-page" data-page="1">
          {/* Header */}
          <div className="dv200-header">
            <div className="dv200-judicial-info">
              Judicial Council of California<br />
              www.courts.ca.gov<br />
              Rev. January 1, 2025
            </div>
            <div className="dv200-form-title">
              PROOF OF PERSONAL SERVICE
            </div>
            <div className="dv200-form-id">DV-200</div>
          </div>

          {/* Case Info */}
          <div className="dv200-section">
            <div className="dv200-row">
              <div className="dv200-field dv200-w-50">
                <label>Protected Person</label>
                <input
                  type="text"
                  name="protectedPerson"
                  value={formData.protectedPerson}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv200-field dv200-w-25">
                <label>Case Number</label>
                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field dv200-w-50">
                <label>Restrained Person</label>
                <input
                  type="text"
                  name="restrainedPerson"
                  value={formData.restrainedPerson}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Server Information */}
          <div className="dv200-section">
            <div className="dv200-section-title">1. Server's Information</div>
            <div className="dv200-row">
              <div className="dv200-field">
                <label>Name</label>
                <input
                  type="text"
                  name="serverName"
                  value={formData.serverName}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field">
                <label>Address</label>
                <input
                  type="text"
                  name="serverAddress"
                  value={formData.serverAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field dv200-w-50">
                <label>City</label>
                <input
                  type="text"
                  name="serverCity"
                  value={formData.serverCity}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv200-field dv200-w-25">
                <label>State</label>
                <input
                  type="text"
                  name="serverState"
                  value={formData.serverState}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv200-field dv200-w-25">
                <label>ZIP</label>
                <input
                  type="text"
                  name="serverZip"
                  value={formData.serverZip}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field dv200-w-50">
                <label>Telephone</label>
                <input
                  type="tel"
                  name="serverPhone"
                  value={formData.serverPhone}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Documents Served */}
          <div className="dv200-section">
            <div className="dv200-section-title">2. I served copies of the following documents:</div>
            <div className="dv200-checkbox-grid">
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedDV100"
                  checked={formData.servedDV100}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                DV-100 (Request for Domestic Violence Restraining Order)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedDV109"
                  checked={formData.servedDV109}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                DV-109 (Notice of Court Hearing)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedDV110"
                  checked={formData.servedDV110}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                DV-110 (Temporary Restraining Order)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedDV105"
                  checked={formData.servedDV105}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                DV-105 (Request for Child Custody and Visitation Orders)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedDV140"
                  checked={formData.servedDV140}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                DV-140 (Child Custody and Visitation Order)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedBlankDV120"
                  checked={formData.servedBlankDV120}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Blank DV-120 (Response to Request)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedBlankDV125"
                  checked={formData.servedBlankDV125}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Blank DV-125 (Request to Continue Hearing)
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="servedOther"
                  checked={formData.servedOther}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Other:{' '}
                <input
                  type="text"
                  name="servedOtherDescription"
                  value={formData.servedOtherDescription}
                  onChange={handleInputChange}
                  className="dv200-inline-input"
                  readOnly={readOnly}
                />
              </label>
            </div>
          </div>

          {/* Person Served */}
          <div className="dv200-section">
            <div className="dv200-section-title">3. I served the documents on:</div>
            <div className="dv200-row">
              <div className="dv200-field">
                <label>Name of Person Served</label>
                <input
                  type="text"
                  name="personServedName"
                  value={formData.personServedName}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field">
                <label>Address</label>
                <input
                  type="text"
                  name="personServedAddress"
                  value={formData.personServedAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field dv200-w-50">
                <label>City</label>
                <input
                  type="text"
                  name="personServedCity"
                  value={formData.personServedCity}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv200-field dv200-w-25">
                <label>State</label>
                <input
                  type="text"
                  name="personServedState"
                  value={formData.personServedState}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv200-field dv200-w-25">
                <label>ZIP</label>
                <input
                  type="text"
                  name="personServedZip"
                  value={formData.personServedZip}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-row">
              <div className="dv200-field dv200-w-50">
                <label>Date of Service</label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv200-field dv200-w-50">
                <label>Time of Service</label>
                <input
                  type="time"
                  name="serviceTime"
                  value={formData.serviceTime}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Service Method */}
          <div className="dv200-section">
            <div className="dv200-section-title">4. Method of Service</div>
            <div className="dv200-checkbox-group">
              <label className="dv200-radio">
                <input
                  type="radio"
                  name="serviceMethod"
                  value="personal"
                  checked={formData.serviceMethod === 'personal'}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                <strong>Personal Service.</strong> I personally gave copies of the documents to the person served.
              </label>
              {formData.serviceMethod === 'personal' && (
                <div className="dv200-subsection">
                  <div className="dv200-field">
                    <label>Location where service was made</label>
                    <input
                      type="text"
                      name="personalServiceLocation"
                      value={formData.personalServiceLocation}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              )}

              <label className="dv200-radio">
                <input
                  type="radio"
                  name="serviceMethod"
                  value="substituted"
                  checked={formData.serviceMethod === 'substituted'}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                <strong>Substituted Service.</strong> I left the documents with or in the presence of:
              </label>
              {formData.serviceMethod === 'substituted' && (
                <div className="dv200-subsection">
                  <div className="dv200-row">
                    <div className="dv200-field dv200-w-50">
                      <label>Name of person</label>
                      <input
                        type="text"
                        name="substitutedPersonName"
                        value={formData.substitutedPersonName}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                    <div className="dv200-field dv200-w-50">
                      <label>Relationship to person served</label>
                      <input
                        type="text"
                        name="substitutedPersonRelationship"
                        value={formData.substitutedPersonRelationship}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                  <div className="dv200-row">
                    <div className="dv200-field">
                      <label>Address where documents were left</label>
                      <input
                        type="text"
                        name="substitutedAddress"
                        value={formData.substitutedAddress}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                  <div className="dv200-row">
                    <div className="dv200-field dv200-w-50">
                      <label>I then mailed copies on</label>
                      <input
                        type="date"
                        name="mailedDate"
                        value={formData.mailedDate}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                </div>
              )}

              <label className="dv200-radio">
                <input
                  type="radio"
                  name="serviceMethod"
                  value="mail"
                  checked={formData.serviceMethod === 'mail'}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                <strong>Service by Mail.</strong> (Only allowed if ordered by the court)
              </label>
              {formData.serviceMethod === 'mail' && (
                <div className="dv200-subsection">
                  <div className="dv200-row">
                    <div className="dv200-field dv200-w-50">
                      <label>Date mailed</label>
                      <input
                        type="date"
                        name="mailDate"
                        value={formData.mailDate}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                  <div className="dv200-row">
                    <div className="dv200-field dv200-w-50">
                      <label>City</label>
                      <input
                        type="text"
                        name="mailCity"
                        value={formData.mailCity}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                    <div className="dv200-field dv200-w-50">
                      <label>State</label>
                      <input
                        type="text"
                        name="mailState"
                        value={formData.mailState}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Declaration */}
          <div className="dv200-section">
            <div className="dv200-section-title">5. Server's Declaration</div>
            <div className="dv200-checkbox-group">
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="serverIsOver18"
                  checked={formData.serverIsOver18}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                I am 18 years of age or older.
              </label>
              <label className="dv200-checkbox">
                <input
                  type="checkbox"
                  name="serverNotParty"
                  checked={formData.serverNotParty}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                I am not a party to this case.
              </label>
            </div>
            <div className="dv200-row">
              <div className="dv200-field">
                <label>I am (relationship to party or "professional process server"):</label>
                <input
                  type="text"
                  name="serverEmployedBy"
                  value={formData.serverEmployedBy}
                  onChange={handleInputChange}
                  placeholder="e.g., Friend of protected person, Professional process server"
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv200-declaration">
              <p>
                I declare under penalty of perjury under the laws of the State of California
                that the foregoing is true and correct.
              </p>
              <div className="dv200-row">
                <div className="dv200-field dv200-w-50">
                  <label>Date</label>
                  <input
                    type="date"
                    name="declarationDate"
                    value={formData.declarationDate}
                    onChange={handleInputChange}
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="dv200-row">
                <div className="dv200-field dv200-w-50">
                  <label>City</label>
                  <input
                    type="text"
                    name="declarationCity"
                    value={formData.declarationCity}
                    onChange={handleInputChange}
                    readOnly={readOnly}
                  />
                </div>
                <div className="dv200-field dv200-w-50">
                  <label>State</label>
                  <input
                    type="text"
                    name="declarationState"
                    value={formData.declarationState}
                    onChange={handleInputChange}
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="dv200-signature-line">
                <label>Signature of Server</label>
                <div className="dv200-signature-box"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dv200-footer">
            <div>DV-200 [Rev. January 1, 2025]</div>
            <div>Proof of Personal Service</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default DV200FormTemplate;
