import React, { useState } from 'react';
import './DV101FormTemplate.css';

export interface DV101FormData {
  // Case Information
  caseNumber: string;

  // Parties
  protectedPerson: string;
  restrainedPerson: string;

  // Abuse Description
  abuseDescription: string;

  // Additional Incidents
  incident1Date: string;
  incident1Description: string;
  incident2Date: string;
  incident2Description: string;
  incident3Date: string;
  incident3Description: string;

  // Continuation
  continuedOnAttachment: boolean;
}

interface DV101FormTemplateProps {
  data?: Partial<DV101FormData>;
  onChange?: (data: DV101FormData) => void;
  readOnly?: boolean;
}

const defaultData: DV101FormData = {
  caseNumber: '',
  protectedPerson: '',
  restrainedPerson: '',
  abuseDescription: '',
  incident1Date: '',
  incident1Description: '',
  incident2Date: '',
  incident2Description: '',
  incident3Date: '',
  incident3Description: '',
  continuedOnAttachment: false,
};

export const DV101FormTemplate: React.FC<DV101FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV101FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV101FormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof DV101FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof DV101FormData, value);
    }
  };

  return (
    <div className="dv101-form-container">
      <form className="dv101-form" data-form="DV-101">
        <section className="dv101-page" data-page="1">
          {/* Header */}
          <div className="dv101-header">
            <div className="dv101-judicial-info">
              Judicial Council of California<br />
              www.courts.ca.gov<br />
              Rev. January 1, 2025
            </div>
            <div className="dv101-form-title">
              DESCRIPTION OF ABUSE
            </div>
            <div className="dv101-form-subtitle">
              Attachment to DV-100
            </div>
            <div className="dv101-form-id">DV-101</div>
          </div>

          {/* Case Info */}
          <div className="dv101-section">
            <div className="dv101-row">
              <div className="dv101-field dv101-w-50">
                <label>Protected Person</label>
                <input
                  type="text"
                  name="protectedPerson"
                  value={formData.protectedPerson}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv101-field dv101-w-25">
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
            <div className="dv101-row">
              <div className="dv101-field dv101-w-50">
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

          {/* Instructions */}
          <div className="dv101-instructions">
            <strong>Instructions:</strong> Use this form if you need more space to describe the abuse in item 5 of Form DV-100.
            Describe each incident of abuse separately. Include dates, what happened, and any injuries.
          </div>

          {/* Main Description */}
          <div className="dv101-section">
            <div className="dv101-section-title">Description of Abuse</div>
            <p className="dv101-note">
              Describe the abuse in detail. Include what was said, what was done, dates, times, locations,
              any witnesses, any injuries, and how often this type of abuse has occurred.
            </p>
            <textarea
              name="abuseDescription"
              value={formData.abuseDescription}
              onChange={handleInputChange}
              className="dv101-main-textarea"
              rows={12}
              readOnly={readOnly}
              placeholder="Describe the abuse here..."
            />
          </div>

          {/* Additional Incidents */}
          <div className="dv101-section">
            <div className="dv101-section-title">Additional Incidents</div>

            <div className="dv101-incident">
              <div className="dv101-row">
                <div className="dv101-field dv101-w-25">
                  <label>Date of Incident</label>
                  <input
                    type="text"
                    name="incident1Date"
                    value={formData.incident1Date}
                    onChange={handleInputChange}
                    placeholder="MM/DD/YYYY"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <textarea
                name="incident1Description"
                value={formData.incident1Description}
                onChange={handleInputChange}
                rows={4}
                readOnly={readOnly}
                placeholder="Describe what happened..."
              />
            </div>

            <div className="dv101-incident">
              <div className="dv101-row">
                <div className="dv101-field dv101-w-25">
                  <label>Date of Incident</label>
                  <input
                    type="text"
                    name="incident2Date"
                    value={formData.incident2Date}
                    onChange={handleInputChange}
                    placeholder="MM/DD/YYYY"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <textarea
                name="incident2Description"
                value={formData.incident2Description}
                onChange={handleInputChange}
                rows={4}
                readOnly={readOnly}
                placeholder="Describe what happened..."
              />
            </div>

            <div className="dv101-incident">
              <div className="dv101-row">
                <div className="dv101-field dv101-w-25">
                  <label>Date of Incident</label>
                  <input
                    type="text"
                    name="incident3Date"
                    value={formData.incident3Date}
                    onChange={handleInputChange}
                    placeholder="MM/DD/YYYY"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <textarea
                name="incident3Description"
                value={formData.incident3Description}
                onChange={handleInputChange}
                rows={4}
                readOnly={readOnly}
                placeholder="Describe what happened..."
              />
            </div>
          </div>

          {/* Continuation */}
          <div className="dv101-continuation">
            <label className="dv101-checkbox">
              <input
                type="checkbox"
                name="continuedOnAttachment"
                checked={formData.continuedOnAttachment}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              Continued on Attachment DV-101
            </label>
          </div>

          {/* Footer */}
          <div className="dv101-footer">
            <div>DV-101 [Rev. January 1, 2025]</div>
            <div>Description of Abuse</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default DV101FormTemplate;
