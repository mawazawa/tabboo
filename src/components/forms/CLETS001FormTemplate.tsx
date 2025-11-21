import React, { useState } from 'react';
import './CLETS001FormTemplate.css';

export interface CLETS001FormData {
  // Case Information
  caseNumber: string;
  county: string;
  courtName: string;

  // Protected Person Information
  protectedName: string;
  protectedDOB: string;
  protectedSex: string;
  protectedRace: string;
  protectedHeight: string;
  protectedWeight: string;
  protectedHairColor: string;
  protectedEyeColor: string;
  protectedAddress: string;
  protectedCity: string;
  protectedState: string;
  protectedZip: string;
  protectedPhone: string;

  // Restrained Person Information
  restrainedName: string;
  restrainedDOB: string;
  restrainedSex: string;
  restrainedRace: string;
  restrainedHeight: string;
  restrainedWeight: string;
  restrainedHairColor: string;
  restrainedEyeColor: string;
  restrainedAddress: string;
  restrainedCity: string;
  restrainedState: string;
  restrainedZip: string;
  restrainedPhone: string;
  restrainedSSN: string;
  restrainedDriverLicense: string;
  restrainedDLState: string;

  // Additional Restrained Person Details
  restrainedEmployer: string;
  restrainedEmployerAddress: string;
  restrainedOccupation: string;

  // Vehicle Information
  vehicleLicensePlate: string;
  vehicleState: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;

  // Firearm Information
  hasFirearms: boolean;
  firearmDescription: string;
  firearmLocation: string;

  // Order Information
  orderExpirationDate: string;
  orderType: string;
}

interface CLETS001FormTemplateProps {
  data?: Partial<CLETS001FormData>;
  onChange?: (data: CLETS001FormData) => void;
  readOnly?: boolean;
}

const defaultData: CLETS001FormData = {
  caseNumber: '',
  county: '',
  courtName: '',
  protectedName: '',
  protectedDOB: '',
  protectedSex: '',
  protectedRace: '',
  protectedHeight: '',
  protectedWeight: '',
  protectedHairColor: '',
  protectedEyeColor: '',
  protectedAddress: '',
  protectedCity: '',
  protectedState: '',
  protectedZip: '',
  protectedPhone: '',
  restrainedName: '',
  restrainedDOB: '',
  restrainedSex: '',
  restrainedRace: '',
  restrainedHeight: '',
  restrainedWeight: '',
  restrainedHairColor: '',
  restrainedEyeColor: '',
  restrainedAddress: '',
  restrainedCity: '',
  restrainedState: '',
  restrainedZip: '',
  restrainedPhone: '',
  restrainedSSN: '',
  restrainedDriverLicense: '',
  restrainedDLState: '',
  restrainedEmployer: '',
  restrainedEmployerAddress: '',
  restrainedOccupation: '',
  vehicleLicensePlate: '',
  vehicleState: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleColor: '',
  hasFirearms: false,
  firearmDescription: '',
  firearmLocation: '',
  orderExpirationDate: '',
  orderType: '',
};

export const CLETS001FormTemplate: React.FC<CLETS001FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<CLETS001FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof CLETS001FormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof CLETS001FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof CLETS001FormData, value);
    }
  };

  return (
    <div className="clets-form-container">
      <form className="clets-form" data-form="CLETS-001">
        <section className="clets-page" data-page="1">
          {/* Header */}
          <div className="clets-header">
            <div className="clets-confidential-banner">
              CONFIDENTIAL CLETS INFORMATION
            </div>
            <div className="clets-form-id">CLETS-001</div>
            <div className="clets-warning">
              <strong>CONFIDENTIAL:</strong> This form contains sensitive information for law enforcement use only.
              Do not file with public court records.
            </div>
          </div>

          {/* Case Information */}
          <div className="clets-section">
            <div className="clets-section-title">Case Information</div>
            <div className="clets-row">
              <div className="clets-field">
                <label>Court Name</label>
                <input
                  type="text"
                  name="courtName"
                  value={formData.courtName}
                  onChange={handleInputChange}
                  placeholder="Superior Court of California, County of..."
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-50">
                <label>County</label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-50">
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

          {/* Protected Person */}
          <div className="clets-section">
            <div className="clets-section-title">Protected Person Information</div>
            <div className="clets-row">
              <div className="clets-field">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  name="protectedName"
                  value={formData.protectedName}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-25">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="protectedDOB"
                  value={formData.protectedDOB}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Sex</label>
                <select
                  name="protectedSex"
                  value={formData.protectedSex}
                  onChange={handleInputChange}
                  disabled={readOnly}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Non-Binary</option>
                </select>
              </div>
              <div className="clets-field clets-w-25">
                <label>Race</label>
                <input
                  type="text"
                  name="protectedRace"
                  value={formData.protectedRace}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Phone</label>
                <input
                  type="tel"
                  name="protectedPhone"
                  value={formData.protectedPhone}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-25">
                <label>Height</label>
                <input
                  type="text"
                  name="protectedHeight"
                  value={formData.protectedHeight}
                  onChange={handleInputChange}
                  placeholder="5'10&quot;"
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Weight</label>
                <input
                  type="text"
                  name="protectedWeight"
                  value={formData.protectedWeight}
                  onChange={handleInputChange}
                  placeholder="lbs"
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Hair Color</label>
                <input
                  type="text"
                  name="protectedHairColor"
                  value={formData.protectedHairColor}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Eye Color</label>
                <input
                  type="text"
                  name="protectedEyeColor"
                  value={formData.protectedEyeColor}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-50">
                <label>Address</label>
                <input
                  type="text"
                  name="protectedAddress"
                  value={formData.protectedAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>City</label>
                <input
                  type="text"
                  name="protectedCity"
                  value={formData.protectedCity}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-15">
                <label>State</label>
                <input
                  type="text"
                  name="protectedState"
                  value={formData.protectedState}
                  onChange={handleInputChange}
                  maxLength={2}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-10">
                <label>ZIP</label>
                <input
                  type="text"
                  name="protectedZip"
                  value={formData.protectedZip}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Restrained Person */}
          <div className="clets-section">
            <div className="clets-section-title">Restrained Person Information</div>
            <div className="clets-row">
              <div className="clets-field">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  name="restrainedName"
                  value={formData.restrainedName}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-25">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="restrainedDOB"
                  value={formData.restrainedDOB}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Sex</label>
                <select
                  name="restrainedSex"
                  value={formData.restrainedSex}
                  onChange={handleInputChange}
                  disabled={readOnly}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Non-Binary</option>
                </select>
              </div>
              <div className="clets-field clets-w-25">
                <label>Race</label>
                <input
                  type="text"
                  name="restrainedRace"
                  value={formData.restrainedRace}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Phone</label>
                <input
                  type="tel"
                  name="restrainedPhone"
                  value={formData.restrainedPhone}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-25">
                <label>Height</label>
                <input
                  type="text"
                  name="restrainedHeight"
                  value={formData.restrainedHeight}
                  onChange={handleInputChange}
                  placeholder="5'10&quot;"
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Weight</label>
                <input
                  type="text"
                  name="restrainedWeight"
                  value={formData.restrainedWeight}
                  onChange={handleInputChange}
                  placeholder="lbs"
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Hair Color</label>
                <input
                  type="text"
                  name="restrainedHairColor"
                  value={formData.restrainedHairColor}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Eye Color</label>
                <input
                  type="text"
                  name="restrainedEyeColor"
                  value={formData.restrainedEyeColor}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-50">
                <label>Address</label>
                <input
                  type="text"
                  name="restrainedAddress"
                  value={formData.restrainedAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>City</label>
                <input
                  type="text"
                  name="restrainedCity"
                  value={formData.restrainedCity}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-15">
                <label>State</label>
                <input
                  type="text"
                  name="restrainedState"
                  value={formData.restrainedState}
                  onChange={handleInputChange}
                  maxLength={2}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-10">
                <label>ZIP</label>
                <input
                  type="text"
                  name="restrainedZip"
                  value={formData.restrainedZip}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-33">
                <label>Social Security Number</label>
                <input
                  type="text"
                  name="restrainedSSN"
                  value={formData.restrainedSSN}
                  onChange={handleInputChange}
                  placeholder="XXX-XX-XXXX"
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-33">
                <label>Driver License Number</label>
                <input
                  type="text"
                  name="restrainedDriverLicense"
                  value={formData.restrainedDriverLicense}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-33">
                <label>DL State</label>
                <input
                  type="text"
                  name="restrainedDLState"
                  value={formData.restrainedDLState}
                  onChange={handleInputChange}
                  maxLength={2}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-50">
                <label>Employer</label>
                <input
                  type="text"
                  name="restrainedEmployer"
                  value={formData.restrainedEmployer}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-50">
                <label>Occupation</label>
                <input
                  type="text"
                  name="restrainedOccupation"
                  value={formData.restrainedOccupation}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field">
                <label>Employer Address</label>
                <input
                  type="text"
                  name="restrainedEmployerAddress"
                  value={formData.restrainedEmployerAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="clets-section">
            <div className="clets-section-title">Vehicle Information</div>
            <div className="clets-row">
              <div className="clets-field clets-w-25">
                <label>License Plate</label>
                <input
                  type="text"
                  name="vehicleLicensePlate"
                  value={formData.vehicleLicensePlate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-15">
                <label>State</label>
                <input
                  type="text"
                  name="vehicleState"
                  value={formData.vehicleState}
                  onChange={handleInputChange}
                  maxLength={2}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-15">
                <label>Year</label>
                <input
                  type="text"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleInputChange}
                  maxLength={4}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-20">
                <label>Make</label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-25">
                <label>Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
            <div className="clets-row">
              <div className="clets-field clets-w-25">
                <label>Color</label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Firearm Information */}
          <div className="clets-section">
            <div className="clets-section-title">Firearm Information</div>
            <div className="clets-row">
              <label className="clets-checkbox">
                <input
                  type="checkbox"
                  name="hasFirearms"
                  checked={formData.hasFirearms}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Restrained person has or owns firearms
              </label>
            </div>
            {formData.hasFirearms && (
              <>
                <div className="clets-row">
                  <div className="clets-field">
                    <label>Description of Firearms</label>
                    <textarea
                      name="firearmDescription"
                      value={formData.firearmDescription}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="clets-row">
                  <div className="clets-field">
                    <label>Location of Firearms</label>
                    <input
                      type="text"
                      name="firearmLocation"
                      value={formData.firearmLocation}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Order Information */}
          <div className="clets-section">
            <div className="clets-section-title">Order Information</div>
            <div className="clets-row">
              <div className="clets-field clets-w-50">
                <label>Order Expiration Date</label>
                <input
                  type="date"
                  name="orderExpirationDate"
                  value={formData.orderExpirationDate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="clets-field clets-w-50">
                <label>Order Type</label>
                <select
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleInputChange}
                  disabled={readOnly}
                >
                  <option value="">Select</option>
                  <option value="TRO">Temporary Restraining Order</option>
                  <option value="RO">Restraining Order After Hearing</option>
                  <option value="EPO">Emergency Protective Order</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="clets-footer">
            <div>CLETS-001 [Rev. January 1, 2025]</div>
            <div>Confidential CLETS Information</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default CLETS001FormTemplate;
