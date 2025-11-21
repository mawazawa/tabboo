import React, { useState } from 'react';
import './DV140FormTemplate.css';

export interface DV140FormData {
  // Case Information
  caseNumber: string;
  county: string;

  // Parties
  protectedPerson: string;
  restrainedPerson: string;

  // Children
  child1Name: string;
  child1DOB: string;
  child2Name: string;
  child2DOB: string;
  child3Name: string;
  child3DOB: string;
  child4Name: string;
  child4DOB: string;

  // Legal Custody
  legalCustodyJoint: boolean;
  legalCustodyProtected: boolean;
  legalCustodyRestrained: boolean;

  // Physical Custody
  physicalCustodyJoint: boolean;
  physicalCustodyProtected: boolean;
  physicalCustodyRestrained: boolean;

  // Visitation
  visitationNone: boolean;
  visitationSupervised: boolean;
  visitationSupervisor: string;
  visitationSchedule: boolean;
  visitationScheduleDetails: string;

  // Visitation Schedule
  weekdayParent: string;
  weekendParent: string;
  holidayArrangements: string;
  summerArrangements: string;

  // Transportation
  transportPickup: string;
  transportDropoff: string;

  // Other Orders
  otherCustodyOrders: string;

  // Judge Signature
  judgeDate: string;
  judgeName: string;
}

interface DV140FormTemplateProps {
  data?: Partial<DV140FormData>;
  onChange?: (data: DV140FormData) => void;
  readOnly?: boolean;
}

const defaultData: DV140FormData = {
  caseNumber: '',
  county: '',
  protectedPerson: '',
  restrainedPerson: '',
  child1Name: '',
  child1DOB: '',
  child2Name: '',
  child2DOB: '',
  child3Name: '',
  child3DOB: '',
  child4Name: '',
  child4DOB: '',
  legalCustodyJoint: false,
  legalCustodyProtected: false,
  legalCustodyRestrained: false,
  physicalCustodyJoint: false,
  physicalCustodyProtected: false,
  physicalCustodyRestrained: false,
  visitationNone: false,
  visitationSupervised: false,
  visitationSupervisor: '',
  visitationSchedule: false,
  visitationScheduleDetails: '',
  weekdayParent: '',
  weekendParent: '',
  holidayArrangements: '',
  summerArrangements: '',
  transportPickup: '',
  transportDropoff: '',
  otherCustodyOrders: '',
  judgeDate: '',
  judgeName: '',
};

export const DV140FormTemplate: React.FC<DV140FormTemplateProps> = ({
  data: initialData,
  onChange,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<DV140FormData>({
    ...defaultData,
    ...initialData,
  });

  const handleChange = (field: keyof DV140FormData, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      handleChange(name as keyof DV140FormData, (e.target as HTMLInputElement).checked);
    } else {
      handleChange(name as keyof DV140FormData, value);
    }
  };

  return (
    <div className="dv140-form-container">
      <form className="dv140-form" data-form="DV-140">
        <section className="dv140-page" data-page="1">
          {/* Header */}
          <div className="dv140-header">
            <div className="dv140-judicial-info">
              Judicial Council of California<br />
              www.courts.ca.gov<br />
              Rev. January 1, 2025
            </div>
            <div className="dv140-form-title">
              CHILD CUSTODY AND VISITATION ORDER
            </div>
            <div className="dv140-form-id">DV-140</div>
          </div>

          {/* Case Info */}
          <div className="dv140-section">
            <div className="dv140-row">
              <div className="dv140-field dv140-w-50">
                <label>Protected Person</label>
                <input
                  type="text"
                  name="protectedPerson"
                  value={formData.protectedPerson}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv140-field dv140-w-25">
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
            <div className="dv140-row">
              <div className="dv140-field dv140-w-50">
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

          {/* Children */}
          <div className="dv140-section">
            <div className="dv140-section-title">Children Covered by This Order</div>
            <table className="dv140-children-table">
              <thead>
                <tr>
                  <th>Child's Name</th>
                  <th>Date of Birth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="child1Name"
                      value={formData.child1Name}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="child1DOB"
                      value={formData.child1DOB}
                      onChange={handleInputChange}
                      placeholder="MM/DD/YYYY"
                      readOnly={readOnly}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="child2Name"
                      value={formData.child2Name}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="child2DOB"
                      value={formData.child2DOB}
                      onChange={handleInputChange}
                      placeholder="MM/DD/YYYY"
                      readOnly={readOnly}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="child3Name"
                      value={formData.child3Name}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="child3DOB"
                      value={formData.child3DOB}
                      onChange={handleInputChange}
                      placeholder="MM/DD/YYYY"
                      readOnly={readOnly}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="child4Name"
                      value={formData.child4Name}
                      onChange={handleInputChange}
                      readOnly={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="child4DOB"
                      value={formData.child4DOB}
                      onChange={handleInputChange}
                      placeholder="MM/DD/YYYY"
                      readOnly={readOnly}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal Custody */}
          <div className="dv140-section">
            <div className="dv140-section-title">1. Legal Custody</div>
            <p className="dv140-note">Legal custody means the right to make decisions about health, education, and welfare.</p>
            <div className="dv140-checkbox-group">
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="legalCustodyJoint"
                  checked={formData.legalCustodyJoint}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Joint to both parents
              </label>
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="legalCustodyProtected"
                  checked={formData.legalCustodyProtected}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Sole to protected person
              </label>
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="legalCustodyRestrained"
                  checked={formData.legalCustodyRestrained}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Sole to restrained person
              </label>
            </div>
          </div>

          {/* Physical Custody */}
          <div className="dv140-section">
            <div className="dv140-section-title">2. Physical Custody</div>
            <p className="dv140-note">Physical custody means where the children live.</p>
            <div className="dv140-checkbox-group">
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="physicalCustodyJoint"
                  checked={formData.physicalCustodyJoint}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Joint to both parents
              </label>
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="physicalCustodyProtected"
                  checked={formData.physicalCustodyProtected}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Sole to protected person
              </label>
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="physicalCustodyRestrained"
                  checked={formData.physicalCustodyRestrained}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Sole to restrained person
              </label>
            </div>
          </div>

          {/* Visitation */}
          <div className="dv140-section">
            <div className="dv140-section-title">3. Visitation (Parenting Time)</div>
            <div className="dv140-checkbox-group">
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="visitationNone"
                  checked={formData.visitationNone}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                No visitation until further order of court
              </label>
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="visitationSupervised"
                  checked={formData.visitationSupervised}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Supervised visitation. Supervisor:{' '}
                <input
                  type="text"
                  name="visitationSupervisor"
                  value={formData.visitationSupervisor}
                  onChange={handleInputChange}
                  className="dv140-inline-input"
                  readOnly={readOnly}
                />
              </label>
              <label className="dv140-checkbox">
                <input
                  type="checkbox"
                  name="visitationSchedule"
                  checked={formData.visitationSchedule}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                Visitation as described below
              </label>
            </div>
            {formData.visitationSchedule && (
              <div className="dv140-schedule">
                <div className="dv140-row">
                  <div className="dv140-field">
                    <label>Weekdays</label>
                    <input
                      type="text"
                      name="weekdayParent"
                      value={formData.weekdayParent}
                      onChange={handleInputChange}
                      placeholder="Children are with..."
                      readOnly={readOnly}
                    />
                  </div>
                </div>
                <div className="dv140-row">
                  <div className="dv140-field">
                    <label>Weekends</label>
                    <input
                      type="text"
                      name="weekendParent"
                      value={formData.weekendParent}
                      onChange={handleInputChange}
                      placeholder="Children are with..."
                      readOnly={readOnly}
                    />
                  </div>
                </div>
                <div className="dv140-row">
                  <div className="dv140-field">
                    <label>Holidays</label>
                    <textarea
                      name="holidayArrangements"
                      value={formData.holidayArrangements}
                      onChange={handleInputChange}
                      rows={3}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
                <div className="dv140-row">
                  <div className="dv140-field">
                    <label>Summer/School Breaks</label>
                    <textarea
                      name="summerArrangements"
                      value={formData.summerArrangements}
                      onChange={handleInputChange}
                      rows={3}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transportation */}
          <div className="dv140-section">
            <div className="dv140-section-title">4. Transportation</div>
            <div className="dv140-row">
              <div className="dv140-field dv140-w-50">
                <label>Pickup Location</label>
                <input
                  type="text"
                  name="transportPickup"
                  value={formData.transportPickup}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv140-field dv140-w-50">
                <label>Dropoff Location</label>
                <input
                  type="text"
                  name="transportDropoff"
                  value={formData.transportDropoff}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Other Orders */}
          <div className="dv140-section">
            <div className="dv140-section-title">5. Other Custody Orders</div>
            <textarea
              name="otherCustodyOrders"
              value={formData.otherCustodyOrders}
              onChange={handleInputChange}
              rows={4}
              readOnly={readOnly}
            />
          </div>

          {/* Judge Signature */}
          <div className="dv140-signature">
            <div className="dv140-row">
              <div className="dv140-field dv140-w-50">
                <label>Date</label>
                <input
                  type="date"
                  name="judgeDate"
                  value={formData.judgeDate}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </div>
              <div className="dv140-field dv140-w-50">
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
          <div className="dv140-footer">
            <div>DV-140 [Rev. January 1, 2025]</div>
            <div>Child Custody and Visitation Order</div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default DV140FormTemplate;
