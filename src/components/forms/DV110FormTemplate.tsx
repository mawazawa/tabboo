import React, { useState } from 'react';
import './DV110FormTemplate.css';

export interface DV110FormData {
  // Case Information
  caseNumber: string;
  county: string;
  courtAddress: string;
  courtCityZip: string;
  branchName: string;

  // Parties
  protectedPerson: string;
  restrainedPerson: string;

  // Order Status
  orderGranted: boolean;
  orderDenied: boolean;
  orderModified: boolean;

  // Personal Conduct Orders
  noHarass: boolean;
  noContact: boolean;
  noStalk: boolean;
  stayAway: boolean;
  stayAwayDistance: string;
  stayAwayHome: boolean;
  stayAwayWork: boolean;
  stayAwaySchool: boolean;
  stayAwayChildren: boolean;
  stayAwayOther: boolean;
  stayAwayOtherLocation: string;

  // Move Out Order
  moveOut: boolean;
  moveOutAddress: string;

  // Child Custody
  childCustody: boolean;
  childCustodyDetails: string;

  // Child Visitation
  childVisitation: boolean;
  childVisitationDetails: string;

  // Child Support
  childSupport: boolean;
  childSupportAmount: string;

  // Spousal Support
  spousalSupport: boolean;
  spousalSupportAmount: string;

  // Property Control
  propertyControl: boolean;
  propertyControlDetails: string;

  // Firearms
  noFirearms: boolean;
  surrenderFirearms: boolean;
  firearmsSurrenderDate: string;

  // Other Orders
  otherOrders: boolean;
  otherOrdersDetails: string;

  // Expiration
  expirationDate: string;

  // Judge Signature
  judgeDate: string;
  judgeName: string;
}

interface DV110FormTemplateProps {
  data?: Partial<DV110FormData>;
  onChange?: (data: DV110FormData) => void;
  readOnly?: boolean;
}

const defaultData: DV110FormData = {
  caseNumber: '',
  county: '',
  courtAddress: '',
  courtCityZip: '',
  branchName: '',
  protectedPerson: '',
  restrainedPerson: '',
  orderGranted: false,
  orderDenied: false,
  orderModified: false,
  noHarass: false,
  noContact: false,
  noStalk: false,
  stayAway: false,
  stayAwayDistance: '100',
  stayAwayHome: false,
  stayAwayWork: false,
  stayAwaySchool: false,
  stayAwayChildren: false,
  stayAwayOther: false,
  stayAwayOtherLocation: '',
  moveOut: false,
  moveOutAddress: '',
  childCustody: false,
  childCustodyDetails: '',
  childVisitation: false,
  childVisitationDetails: '',
  childSupport: false,
  childSupportAmount: '',
  spousalSupport: false,
  spousalSupportAmount: '',
  propertyControl: false,
  propertyControlDetails: '',
  noFirearms: false,
  surrenderFirearms: false,
  firearmsSurrenderDate: '',
  otherOrders: false,
  otherOrdersDetails: '',
  expirationDate: '',
  judgeDate: '',
  judgeName: '',
};

export const DV110FormTemplate: React.FC<DV110FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV110FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV110FormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof DV110FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof DV110FormData, value);
    }
  };

  return (
    <div className="dv110-form-container">
      <form className="dv110-form" data-form="DV-110">
        <section className="dv110-page" data-page="1">
          {/* Header */}
          <div className="dv110-header">
            <div className="dv110-judicial-info">
              Judicial Council of California<br />
              www.courts.ca.gov<br />
              Rev. January 1, 2025
            </div>
            <div className="dv110-form-title">
              TEMPORARY RESTRAINING ORDER
            </div>
            <div className="dv110-form-subtitle">
              (CLETS—TRO)
            </div>
            <div className="dv110-form-id">DV-110</div>
          </div>

          {/* Court Information */}
          <div className="dv110-section">
            <div className="dv110-row">
              <div className="dv110-field">
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
            <div className="dv110-row">
              <div className="dv110-field dv110-w-50">
                <label>Court Address</label>
                <input
                  type="text"
                  name="courtAddress"
                  value={formData.courtAddress}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv110-field dv110-w-50">
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
          <div className="dv110-section">
            <div className="dv110-row">
              <div className="dv110-field dv110-w-50">
                <label>Protected Person</label>
                <input
                  type="text"
                  name="protectedPerson"
                  value={formData.protectedPerson}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv110-field dv110-w-50">
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

          {/* Order Status */}
          <div className="dv110-section">
            <div className="dv110-section-title">Court Order</div>
            <div className="dv110-checkbox-group">
              <label className="dv110-checkbox">
                <input
                  type="checkbox"
                  name="orderGranted"
                  checked={formData.orderGranted}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                The orders requested in Form DV-100 are GRANTED
              </label>
              <label className="dv110-checkbox">
                <input
                  type="checkbox"
                  name="orderDenied"
                  checked={formData.orderDenied}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                The orders requested are DENIED
              </label>
              <label className="dv110-checkbox">
                <input
                  type="checkbox"
                  name="orderModified"
                  checked={formData.orderModified}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                The orders requested are GRANTED as modified below
              </label>
            </div>
          </div>

          {/* Personal Conduct Orders */}
          <div className="dv110-section">
            <div className="dv110-section-title">1. Personal Conduct Orders</div>
            <p className="dv110-instruction">The restrained person must not do the following to the protected person:</p>
            <div className="dv110-checkbox-group">
              <label className="dv110-checkbox">
                <input
                  type="checkbox"
                  name="noHarass"
                  checked={formData.noHarass}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Harass, attack, strike, threaten, assault, hit, follow, stalk, molest, destroy personal property, disturb the peace, keep under surveillance, or block movements
              </label>
              <label className="dv110-checkbox">
                <input
                  type="checkbox"
                  name="noContact"
                  checked={formData.noContact}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Contact, either directly or indirectly, by any means, including by telephone, mail, email, or other electronic means
              </label>
            </div>
          </div>

          {/* Stay Away Orders */}
          <div className="dv110-section">
            <div className="dv110-section-title">2. Stay-Away Orders</div>
            <label className="dv110-checkbox">
              <input
                type="checkbox"
                name="stayAway"
                checked={formData.stayAway}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              The restrained person must stay at least{' '}
              <input
                type="text"
                name="stayAwayDistance"
                value={formData.stayAwayDistance}
                onChange={handleInputChange}
                className="dv110-inline-input"
                readOnly={readOnly}
              />
              {' '}yards away from:
            </label>
            {formData.stayAway && (
              <div className="dv110-nested">
                <label className="dv110-checkbox">
                  <input
                    type="checkbox"
                    name="stayAwayHome"
                    checked={formData.stayAwayHome}
                    onChange={handleInputChange}
                    disabled={readOnly}
                  />
                  Protected person's home
                </label>
                <label className="dv110-checkbox">
                  <input
                    type="checkbox"
                    name="stayAwayWork"
                    checked={formData.stayAwayWork}
                    onChange={handleInputChange}
                    disabled={readOnly}
                  />
                  Protected person's workplace
                </label>
                <label className="dv110-checkbox">
                  <input
                    type="checkbox"
                    name="stayAwaySchool"
                    checked={formData.stayAwaySchool}
                    onChange={handleInputChange}
                    disabled={readOnly}
                  />
                  Protected person's school
                </label>
                <label className="dv110-checkbox">
                  <input
                    type="checkbox"
                    name="stayAwayChildren"
                    checked={formData.stayAwayChildren}
                    onChange={handleInputChange}
                    disabled={readOnly}
                  />
                  Children's school or childcare
                </label>
                <label className="dv110-checkbox">
                  <input
                    type="checkbox"
                    name="stayAwayOther"
                    checked={formData.stayAwayOther}
                    onChange={handleInputChange}
                    disabled={readOnly}
                  />
                  Other:{' '}
                  <input
                    type="text"
                    name="stayAwayOtherLocation"
                    value={formData.stayAwayOtherLocation}
                    onChange={handleInputChange}
                    className="dv110-inline-input-long"
                    readOnly={readOnly}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Move Out Order */}
          <div className="dv110-section">
            <div className="dv110-section-title">3. Move-Out Order</div>
            <label className="dv110-checkbox">
              <input
                type="checkbox"
                name="moveOut"
                checked={formData.moveOut}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              The restrained person must move out immediately from:
            </label>
            {formData.moveOut && (
              <input
                type="text"
                name="moveOutAddress"
                value={formData.moveOutAddress}
                onChange={handleInputChange}
                className="dv110-full-input"
                placeholder="Address"
                readOnly={readOnly}
              />
            )}
          </div>

          {/* Firearms */}
          <div className="dv110-section">
            <div className="dv110-section-title">4. Firearms Prohibition and Relinquishment</div>
            <label className="dv110-checkbox">
              <input
                type="checkbox"
                name="noFirearms"
                checked={formData.noFirearms}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              The restrained person cannot own, possess, purchase, receive, or attempt to purchase or receive any firearm or ammunition
            </label>
            <label className="dv110-checkbox">
              <input
                type="checkbox"
                name="surrenderFirearms"
                checked={formData.surrenderFirearms}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              The restrained person must surrender all firearms within 24 hours
            </label>
          </div>

          {/* Expiration */}
          <div className="dv110-section dv110-expiration">
            <div className="dv110-section-title">Order Expiration</div>
            <p>This Temporary Restraining Order expires on:</p>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
              readOnly={readOnly}
            />
          </div>

          {/* Judge Signature */}
          <div className="dv110-signature">
            <div className="dv110-row">
              <div className="dv110-field dv110-w-50">
                <label>Date</label>
                <input
                  type="date"
                  name="judgeDate"
                  value={formData.judgeDate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv110-field dv110-w-50">
                <label>Judicial Officer</label>
                <input
                  type="text"
                  name="judgeName"
                  value={formData.judgeName}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dv110-footer">
            <div>DV-110 [Rev. January 1, 2025]</div>
            <div>Temporary Restraining Order</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default DV110FormTemplate;
