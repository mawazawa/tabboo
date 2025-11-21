/**
 * formDataMapper.test.ts
 *
 * Tests for form data mapping between TRO packet forms.
 * These are mission-critical functions that affect court filings.
 */

import { describe, it, expect } from 'vitest';
import {
  mapDV100ToCLETS,
  mapDV100ToDV105,
  mapDV100ToFL150,
  mapDV120ToFL320,
  mapVaultToForm,
  autofillFromPreviousForms,
  autofillFromVault,
  autofillFromBoth,
  extractCommonValues,
  findInconsistencies,
  synchronizeCommonFields,
  CommonFields
} from '../formDataMapper';
import { FormType } from '@/types/WorkflowTypes';

describe('formDataMapper', () => {
  // ===========================================================================
  // DV-100 to CLETS-001 Mapping
  // ===========================================================================
  describe('mapDV100ToCLETS', () => {
    it('should map protected person information correctly', () => {
      const dv100Data = {
        protectedPersonName: 'Jane Smith',
        protectedPersonAddress: '123 Main St',
        protectedPersonCity: 'Los Angeles',
        protectedPersonState: 'CA',
        protectedPersonZip: '90001',
        protectedPersonDOB: '1985-03-15',
        protectedPersonGender: 'Female',
        protectedPersonRace: 'Caucasian',
        protectedPersonHeight: '5\'6"',
        protectedPersonWeight: '140',
        protectedPersonHairColor: 'Brown',
        protectedPersonEyeColor: 'Blue'
      };

      const result = mapDV100ToCLETS(dv100Data);

      expect(result.protectedPersonName).toBe('Jane Smith');
      expect(result.protectedPersonAddress).toBe('123 Main St');
      expect(result.protectedPersonCity).toBe('Los Angeles');
      expect(result.protectedPersonState).toBe('CA');
      expect(result.protectedPersonZip).toBe('90001');
      expect(result.protectedPersonDOB).toBe('1985-03-15');
      expect(result.protectedPersonGender).toBe('Female');
      expect(result.protectedPersonRace).toBe('Caucasian');
      expect(result.protectedPersonHeight).toBe('5\'6"');
      expect(result.protectedPersonWeight).toBe('140');
      expect(result.protectedPersonHairColor).toBe('Brown');
      expect(result.protectedPersonEyeColor).toBe('Blue');
    });

    it('should map restrained person information correctly', () => {
      const dv100Data = {
        restrainedPersonName: 'John Doe',
        restrainedPersonAddress: '456 Oak Ave',
        restrainedPersonCity: 'Pasadena',
        restrainedPersonState: 'CA',
        restrainedPersonZip: '91101',
        restrainedPersonDOB: '1980-07-22',
        restrainedPersonGender: 'Male',
        restrainedPersonRace: 'Hispanic',
        restrainedPersonHeight: '5\'10"',
        restrainedPersonWeight: '180',
        restrainedPersonHairColor: 'Black',
        restrainedPersonEyeColor: 'Brown'
      };

      const result = mapDV100ToCLETS(dv100Data);

      expect(result.restrainedPersonName).toBe('John Doe');
      expect(result.restrainedPersonAddress).toBe('456 Oak Ave');
      expect(result.restrainedPersonCity).toBe('Pasadena');
      expect(result.restrainedPersonState).toBe('CA');
      expect(result.restrainedPersonZip).toBe('91101');
      expect(result.restrainedPersonDOB).toBe('1980-07-22');
    });

    it('should map case information correctly', () => {
      const dv100Data = {
        caseNumber: 'FL12345678',
        county: 'Los Angeles'
      };

      const result = mapDV100ToCLETS(dv100Data);

      expect(result.caseNumber).toBe('FL12345678');
      expect(result.county).toBe('Los Angeles');
    });

    it('should handle missing optional fields', () => {
      const dv100Data = {
        protectedPersonName: 'Jane Smith',
        caseNumber: 'FL12345678'
      };

      const result = mapDV100ToCLETS(dv100Data);

      expect(result.protectedPersonName).toBe('Jane Smith');
      expect(result.caseNumber).toBe('FL12345678');
      expect(result.protectedPersonDOB).toBeUndefined();
      expect(result.protectedPersonGender).toBeUndefined();
    });

    it('should return empty object for empty input', () => {
      const result = mapDV100ToCLETS({});
      expect(result).toEqual({});
    });
  });

  // ===========================================================================
  // DV-100 to DV-105 Mapping
  // ===========================================================================
  describe('mapDV100ToDV105', () => {
    it('should map party names correctly', () => {
      const dv100Data = {
        protectedPersonName: 'Jane Smith',
        restrainedPersonName: 'John Doe'
      };

      const result = mapDV100ToDV105(dv100Data);

      expect(result.petitionerName).toBe('Jane Smith');
      expect(result.respondentName).toBe('John Doe');
    });

    it('should map case information correctly', () => {
      const dv100Data = {
        caseNumber: 'FL12345678',
        county: 'Los Angeles'
      };

      const result = mapDV100ToDV105(dv100Data);

      expect(result.caseNumber).toBe('FL12345678');
      expect(result.county).toBe('Los Angeles');
    });

    it('should map children information correctly', () => {
      const dv100Data = {
        children: [
          { name: 'Alice Smith', dob: '2015-05-10' },
          { name: 'Bob Smith', dob: '2018-08-20' }
        ],
        childNames: ['Alice Smith', 'Bob Smith'],
        childBirthdates: ['2015-05-10', '2018-08-20'],
        numberOfChildren: 2
      };

      const result = mapDV100ToDV105(dv100Data);

      expect(result.children).toEqual(dv100Data.children);
      expect(result.childNames).toEqual(['Alice Smith', 'Bob Smith']);
      expect(result.numberOfChildren).toBe(2);
    });

    it('should map current custody arrangement if present', () => {
      const dv100Data = {
        currentCustodyArrangement: 'Joint custody with alternating weekends'
      };

      const result = mapDV100ToDV105(dv100Data);

      expect(result.currentCustodyArrangement).toBe('Joint custody with alternating weekends');
    });
  });

  // ===========================================================================
  // DV-100 to FL-150 Mapping
  // ===========================================================================
  describe('mapDV100ToFL150', () => {
    it('should map party name for FL-150', () => {
      const dv100Data = {
        protectedPersonName: 'Jane Smith'
      };

      const result = mapDV100ToFL150(dv100Data);

      expect(result.partyName).toBe('Jane Smith');
      expect(result.petitioner).toBe('Jane Smith');
    });

    it('should map case information', () => {
      const dv100Data = {
        caseNumber: 'FL12345678',
        county: 'Los Angeles'
      };

      const result = mapDV100ToFL150(dv100Data);

      expect(result.caseNumber).toBe('FL12345678');
      expect(result.county).toBe('Los Angeles');
    });

    it('should map number of children for support calculations', () => {
      const dv100Data = {
        numberOfChildren: 3
      };

      const result = mapDV100ToFL150(dv100Data);

      expect(result.numberOfChildren).toBe(3);
    });

    it('should map both petitioner and respondent names', () => {
      const dv100Data = {
        protectedPersonName: 'Jane Smith',
        restrainedPersonName: 'John Doe'
      };

      const result = mapDV100ToFL150(dv100Data);

      expect(result.petitioner).toBe('Jane Smith');
      expect(result.respondent).toBe('John Doe');
    });
  });

  // ===========================================================================
  // DV-120 to FL-320 Mapping
  // ===========================================================================
  describe('mapDV120ToFL320', () => {
    it('should map respondent as party name', () => {
      const dv120Data = {
        respondentName: 'John Doe'
      };

      const result = mapDV120ToFL320(dv120Data);

      expect(result.partyName).toBe('John Doe');
      expect(result.respondent).toBe('John Doe');
    });

    it('should map case information', () => {
      const dv120Data = {
        caseNumber: 'FL12345678',
        county: 'Los Angeles'
      };

      const result = mapDV120ToFL320(dv120Data);

      expect(result.caseNumber).toBe('FL12345678');
      expect(result.county).toBe('Los Angeles');
    });

    it('should map attorney information', () => {
      const dv120Data = {
        attorneyName: 'Robert Attorney',
        firmName: 'Smith & Associates',
        stateBarNumber: '123456'
      };

      const result = mapDV120ToFL320(dv120Data);

      expect(result.partyName).toBe('Robert Attorney');
      expect(result.firmName).toBe('Smith & Associates');
      expect(result.stateBarNumber).toBe('123456');
    });

    it('should map contact information', () => {
      const dv120Data = {
        streetAddress: '789 Pine St',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        telephoneNo: '(555) 123-4567',
        faxNo: '(555) 123-4568',
        email: 'john@example.com'
      };

      const result = mapDV120ToFL320(dv120Data);

      expect(result.streetAddress).toBe('789 Pine St');
      expect(result.city).toBe('San Diego');
      expect(result.state).toBe('CA');
      expect(result.zipCode).toBe('92101');
      expect(result.telephoneNo).toBe('(555) 123-4567');
      expect(result.faxNo).toBe('(555) 123-4568');
      expect(result.email).toBe('john@example.com');
    });
  });

  // ===========================================================================
  // Personal Data Vault Mapping
  // ===========================================================================
  describe('mapVaultToForm', () => {
    const vaultData = {
      full_name: 'Jane Smith',
      street_address: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90001',
      phone: '(555) 123-4567',
      email: 'jane@example.com',
      attorney_name: 'Law Firm LLC',
      attorney_bar_number: '123456',
      county: 'Los Angeles',
      date_of_birth: '1985-03-15',
      gender: 'Female',
      race: 'Caucasian',
      height: '5\'6"',
      weight: '140',
      hair_color: 'Brown',
      eye_color: 'Blue'
    };

    it('should map common fields for all form types', () => {
      const result = mapVaultToForm(vaultData, FormType.FL150);

      expect(result.partyName).toBe('Jane Smith');
      expect(result.streetAddress).toBe('123 Main St');
      expect(result.city).toBe('Los Angeles');
      expect(result.state).toBe('CA');
      expect(result.zipCode).toBe('90001');
      expect(result.telephoneNo).toBe('(555) 123-4567');
      expect(result.email).toBe('jane@example.com');
      expect(result.county).toBe('Los Angeles');
    });

    it('should map DV-100 specific fields', () => {
      const result = mapVaultToForm(vaultData, FormType.DV100);

      expect(result.protectedPersonName).toBe('Jane Smith');
      expect(result.protectedPersonAddress).toBe('123 Main St');
      expect(result.protectedPersonCity).toBe('Los Angeles');
      expect(result.protectedPersonState).toBe('CA');
      expect(result.protectedPersonZip).toBe('90001');
      expect(result.protectedPersonDOB).toBe('1985-03-15');
      expect(result.protectedPersonGender).toBe('Female');
      expect(result.protectedPersonRace).toBe('Caucasian');
    });

    it('should map CLETS-001 specific fields', () => {
      const result = mapVaultToForm(vaultData, FormType.CLETS001);

      expect(result.protectedPersonHeight).toBe('5\'6"');
      expect(result.protectedPersonWeight).toBe('140');
      expect(result.protectedPersonHairColor).toBe('Brown');
      expect(result.protectedPersonEyeColor).toBe('Blue');
    });

    it('should map DV-105 specific fields', () => {
      const result = mapVaultToForm(vaultData, FormType.DV105);

      expect(result.petitionerName).toBe('Jane Smith');
    });

    it('should map DV-120 specific fields', () => {
      const result = mapVaultToForm(vaultData, FormType.DV120);

      expect(result.respondentName).toBe('Jane Smith');
    });

    it('should handle empty vault data', () => {
      const result = mapVaultToForm({}, FormType.DV100);
      expect(result).toEqual({});
    });
  });

  // ===========================================================================
  // Autofill Functions
  // ===========================================================================
  describe('autofillFromPreviousForms', () => {
    it('should autofill CLETS-001 from DV-100', () => {
      const completedForms = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Smith',
          restrainedPersonName: 'John Doe',
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        }
      };

      const result = autofillFromPreviousForms(FormType.CLETS001, completedForms);

      expect(result.fieldsAutofilled).toBeGreaterThan(0);
      expect(result.fields.protectedPersonName).toBe('Jane Smith');
      expect(result.fields.restrainedPersonName).toBe('John Doe');
      expect(result.fields.caseNumber).toBe('FL12345678');
      expect(result.source).toBe('previous_form');
    });

    it('should autofill DV-105 from DV-100', () => {
      const completedForms = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Smith',
          restrainedPersonName: 'John Doe',
          caseNumber: 'FL12345678',
          numberOfChildren: 2
        }
      };

      const result = autofillFromPreviousForms(FormType.DV105, completedForms);

      expect(result.fields.petitionerName).toBe('Jane Smith');
      expect(result.fields.respondentName).toBe('John Doe');
      expect(result.fields.caseNumber).toBe('FL12345678');
      expect(result.fields.numberOfChildren).toBe(2);
    });

    it('should autofill FL-150 from DV-100 or DV-120', () => {
      const completedForms = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Smith',
          caseNumber: 'FL12345678',
          numberOfChildren: 2
        }
      };

      const result = autofillFromPreviousForms(FormType.FL150, completedForms);

      expect(result.fields.partyName).toBe('Jane Smith');
      expect(result.fields.caseNumber).toBe('FL12345678');
      expect(result.fields.numberOfChildren).toBe(2);
    });

    it('should autofill FL-320 from DV-120', () => {
      const completedForms = {
        [FormType.DV120]: {
          respondentName: 'John Doe',
          caseNumber: 'FL12345678',
          county: 'Los Angeles',
          streetAddress: '456 Oak Ave'
        }
      };

      const result = autofillFromPreviousForms(FormType.FL320, completedForms);

      expect(result.fields.partyName).toBe('John Doe');
      expect(result.fields.caseNumber).toBe('FL12345678');
      expect(result.fields.streetAddress).toBe('456 Oak Ave');
    });

    it('should return empty result for forms without autofill sources', () => {
      const result = autofillFromPreviousForms(FormType.DV100, {});

      expect(result.fieldsAutofilled).toBe(0);
      expect(result.fields).toEqual({});
    });

    it('should handle multiple source forms for FL-150', () => {
      const completedForms = {
        [FormType.DV120]: {
          respondentName: 'John Doe',
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        }
      };

      const result = autofillFromPreviousForms(FormType.FL150, completedForms);

      expect(result.fields.partyName).toBe('John Doe');
      expect(result.fields.caseNumber).toBe('FL12345678');
    });
  });

  describe('autofillFromVault', () => {
    it('should autofill from vault data', () => {
      const vaultData = {
        full_name: 'Jane Smith',
        street_address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001'
      };

      const result = autofillFromVault(FormType.DV100, vaultData);

      expect(result.fieldsAutofilled).toBeGreaterThan(0);
      expect(result.fields.protectedPersonName).toBe('Jane Smith');
      expect(result.source).toBe('vault');
    });

    it('should return zero fields for empty vault', () => {
      const result = autofillFromVault(FormType.DV100, {});

      expect(result.fieldsAutofilled).toBe(0);
      expect(result.fields).toEqual({});
    });
  });

  describe('autofillFromBoth', () => {
    it('should combine vault and previous form data', () => {
      const vaultData = {
        full_name: 'Jane Smith',
        phone: '(555) 123-4567'
      };

      const completedForms = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        }
      };

      const result = autofillFromBoth(FormType.CLETS001, vaultData, completedForms);

      expect(result.fields.partyName).toBe('Jane Smith');
      expect(result.fields.caseNumber).toBe('FL12345678');
      expect(result.fields.county).toBe('Los Angeles');
      expect(result.source).toBe('both');
    });

    it('should prefer previous form data over vault data for overlapping fields', () => {
      const vaultData = {
        county: 'Orange'
      };

      const completedForms = {
        [FormType.DV100]: {
          county: 'Los Angeles'
        }
      };

      const result = autofillFromBoth(FormType.CLETS001, vaultData, completedForms);

      expect(result.fields.county).toBe('Los Angeles');
    });
  });

  // ===========================================================================
  // Data Consistency Helpers
  // ===========================================================================
  describe('extractCommonValues', () => {
    it('should extract common values across forms', () => {
      const forms = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles',
          protectedPersonName: 'Jane Smith'
        },
        [FormType.CLETS001]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        }
      };

      const result = extractCommonValues(forms);

      expect(result.caseNumber.size).toBe(1);
      expect(result.caseNumber.has('FL12345678')).toBe(true);
      expect(result.county.size).toBe(1);
      expect(result.petitionerName.size).toBe(1);
    });

    it('should detect multiple different values', () => {
      const forms = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678'
        },
        [FormType.DV105]: {
          caseNumber: 'FL87654321'
        }
      };

      const result = extractCommonValues(forms);

      expect(result.caseNumber.size).toBe(2);
    });

    it('should handle forms with petitionerName and protectedPersonName', () => {
      const forms = {
        [FormType.DV100]: {
          protectedPersonName: 'Jane Smith'
        },
        [FormType.DV105]: {
          petitionerName: 'Jane Smith'
        }
      };

      const result = extractCommonValues(forms);

      expect(result.petitionerName.size).toBe(1);
    });
  });

  describe('findInconsistencies', () => {
    it('should return empty array when data is consistent', () => {
      const forms = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        },
        [FormType.CLETS001]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        }
      };

      const inconsistencies = findInconsistencies(forms);

      expect(inconsistencies).toEqual([]);
    });

    it('should detect inconsistent case numbers', () => {
      const forms = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678'
        },
        [FormType.DV105]: {
          caseNumber: 'FL87654321'
        }
      };

      const inconsistencies = findInconsistencies(forms);

      expect(inconsistencies.length).toBe(1);
      expect(inconsistencies[0]).toContain('caseNumber');
      expect(inconsistencies[0]).toContain('FL12345678');
      expect(inconsistencies[0]).toContain('FL87654321');
    });

    it('should detect multiple inconsistencies', () => {
      const forms = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        },
        [FormType.DV105]: {
          caseNumber: 'FL87654321',
          county: 'Orange'
        }
      };

      const inconsistencies = findInconsistencies(forms);

      expect(inconsistencies.length).toBe(2);
    });
  });

  describe('synchronizeCommonFields', () => {
    it('should synchronize fields from authoritative form', () => {
      const forms: Record<string, Record<string, unknown>> = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678',
          county: 'Los Angeles'
        },
        [FormType.CLETS001]: {}
      };

      synchronizeCommonFields(forms, FormType.DV100);

      expect(forms[FormType.CLETS001].caseNumber).toBe('FL12345678');
      expect(forms[FormType.CLETS001].county).toBe('Los Angeles');
    });

    it('should not overwrite existing values', () => {
      const forms: Record<string, Record<string, unknown>> = {
        [FormType.DV100]: {
          caseNumber: 'FL12345678'
        },
        [FormType.CLETS001]: {
          caseNumber: 'FL87654321'
        }
      };

      synchronizeCommonFields(forms, FormType.DV100);

      // Should keep existing value
      expect(forms[FormType.CLETS001].caseNumber).toBe('FL87654321');
    });

    it('should handle missing authoritative form', () => {
      const forms: Record<string, Record<string, unknown>> = {
        [FormType.CLETS001]: {
          caseNumber: 'FL12345678'
        }
      };

      // Should not throw
      expect(() => synchronizeCommonFields(forms, FormType.DV100)).not.toThrow();
    });
  });

  // ===========================================================================
  // CommonFields Constants
  // ===========================================================================
  describe('CommonFields', () => {
    it('should have all required field constants', () => {
      expect(CommonFields.PETITIONER_NAME).toBe('petitionerName');
      expect(CommonFields.RESPONDENT_NAME).toBe('respondentName');
      expect(CommonFields.CASE_NUMBER).toBe('caseNumber');
      expect(CommonFields.COUNTY).toBe('county');
      expect(CommonFields.EMAIL).toBe('email');
      expect(CommonFields.TELEPHONE).toBe('telephoneNo');
    });
  });
});
