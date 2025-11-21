import React, { useState } from 'react';
import './DV109FormTemplate.css';

export interface DV109FormData {
  // Case Information
  caseNumber: string;
  county: string;
  courtAddress: string;
  courtCityZip: string;
  branchName: string;

  // Parties
  protectedPerson: string;
  restrainedPerson: string;

  // Hearing Information
  hearingDate: string;
  hearingTime: string;
  deptRoom: string;
  hearingAddress: string;

  // Clerk Information
  clerkDate: string;
  clerkName: string;
}

interface DV109FormTemplateProps {
  data?: Partial<DV109FormData>;
  onChange?: (data: DV109FormData) => void;
  readOnly?: boolean;
}

const defaultData: DV109FormData = {
  caseNumber: '',
  county: '',
  courtAddress: '',
  courtCityZip: '',
  branchName: '',
  protectedPerson: '',
  restrainedPerson: '',
  hearingDate: '',
  hearingTime: '',
  deptRoom: '',
  hearingAddress: '',
  clerkDate: '',
  clerkName: '',
};

export const DV109FormTemplate: React.FC<DV109FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV109FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV109FormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof DV109FormData, value);
  };

  return (
    <div className="dv109-form-container">
      <form className="dv109-form" data-form="DV-109">
        <section className="dv109-page" data-page="1">
          {/* Header */}
          <div className="dv109-header">
            <div className="dv109-judicial-info">
              Judicial Council of California<br />
              www.courts.ca.gov<br />
              Rev. January 1, 2025
            </div>
            <div className="dv109-form-title">
              NOTICE OF COURT HEARING
            </div>
            <div className="dv109-form-id">DV-109</div>
          </div>

          {/* Court Information */}
          <div className="dv109-section">
            <div className="dv109-row">
              <div className="dv109-field">
                <label>Superior Court of California, County of</label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv109-row">
              <div className="dv109-field dv109-w-50">
                <label>Court Address</label>
                <input
                  type="text"
                  name="courtAddress"
                  value={formData.courtAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv109-field dv109-w-50">
                <label>City and ZIP</label>
                <input
                  type="text"
                  name="courtCityZip"
                  value={formData.courtCityZip}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv109-row">
              <div className="dv109-field dv109-w-50">
                <label>Branch Name</label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv109-field dv109-w-50">
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
          </div>

          {/* Parties */}
          <div className="dv109-section">
            <div className="dv109-row">
              <div className="dv109-field dv109-w-50">
                <label>Person Asking for Protection (Protected Person)</label>
                <input
                  type="text"
                  name="protectedPerson"
                  value={formData.protectedPerson}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv109-field dv109-w-50">
                <label>Person to Be Restrained (Restrained Person)</label>
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

          {/* Hearing Notice */}
          <div className="dv109-hearing-box">
            <div className="dv109-hearing-title">
              NOTICE OF COURT HEARING
            </div>
            <div className="dv109-hearing-subtitle">
              A court hearing is scheduled on your Request for Domestic Violence Restraining Order
            </div>
            <div className="dv109-row">
              <div className="dv109-field dv109-w-33">
                <label>Hearing Date</label>
                <input
                  type="date"
                  name="hearingDate"
                  value={formData.hearingDate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv109-field dv109-w-33">
                <label>Time</label>
                <input
                  type="time"
                  name="hearingTime"
                  value={formData.hearingTime}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv109-field dv109-w-33">
                <label>Dept. / Room</label>
                <input
                  type="text"
                  name="deptRoom"
                  value={formData.deptRoom}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="dv109-row">
              <div className="dv109-field">
                <label>Hearing Address (if different from court address above)</label>
                <input
                  type="text"
                  name="hearingAddress"
                  value={formData.hearingAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="dv109-instructions">
            <div className="dv109-instruction-title">To the Person Asking for Protection:</div>
            <ul>
              <li>You must have the other person served with a copy of all the documents at least 5 days before the hearing date.</li>
              <li>If you want to change any of the orders, you must ask the court at the hearing.</li>
              <li>Sintra/Zoom (if available) - Request the clerk or check the court's website for remote appearance options.</li>
            </ul>

            <div className="dv109-instruction-title">To the Person to Be Restrained:</div>
            <ul>
              <li>If you want to respond to the request for orders, fill out Form DV-120, Response to Request for Domestic Violence Restraining Order, and file it with the court.</li>
              <li>If the Protected Person also asked for child custody, visitation, or support orders, you may need to file other forms.</li>
              <li>You should go to court on the hearing date if you disagree with any of the orders requested.</li>
            </ul>
          </div>

          {/* Clerk Signature */}
          <div className="dv109-clerk-section">
            <div className="dv109-row">
              <div className="dv109-field dv109-w-50">
                <label>Date</label>
                <input
                  type="date"
                  name="clerkDate"
                  value={formData.clerkDate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv109-field dv109-w-50">
                <label>Clerk, by</label>
                <input
                  type="text"
                  name="clerkName"
                  value={formData.clerkName}
                  onChange={handleInputChange}
                  placeholder="Deputy"
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dv109-footer">
            <div>DV-109 [Rev. January 1, 2025]</div>
            <div>Notice of Court Hearing</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default DV109FormTemplate;
