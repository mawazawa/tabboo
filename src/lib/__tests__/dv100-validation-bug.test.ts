import { describe, it, expect } from 'vitest';
import { dv100FormDataSchema } from '../validations';
import type { DV100FormData } from '@/types/FormData';

describe('DV-100 Validation Schema Bug - Field Name Mismatch', () => {
  it('FAILS BEFORE FIX: TypeScript interface field names do not match Zod schema', () => {
    // This test uses CORRECT field names from the TypeScript DV100FormData interface
    // It should pass validation, but will fail if schema has wrong field names

    const correctFormData: Partial<DV100FormData> = {
      courtCounty: 'Los Angeles',
      item1a_yourName: 'Jane Smith',

      // ITEM 3: These are the CORRECT field names from DV100FormData interface
      item3a_haveChildren: true,
      item3a_childrenNames: 'John Doe',
      item3b_married: false,
      item3c_usedToBeMarried: true,
      item3d_dating: true,  // ← CORRECT name per TypeScript interface (line 446)
      item3e_engaged: false,  // ← CORRECT name per TypeScript interface (line 449)
      item3f_related: true,  // ← CORRECT name per TypeScript interface (line 452)
      item3f_parent: true,  // ← CORRECT name per TypeScript interface (line 455)
      item3f_sibling: false,  // ← CORRECT name per TypeScript interface (line 458)
      item3g_liveTogether: true,  // ← CORRECT name per TypeScript interface (line 473)
      item3g_asFamily: true,  // ← CORRECT name per TypeScript interface (line 476)

      // ITEM 5: These are the CORRECT field names from DV100FormData interface
      item5a_dateOfAbuse: '2025-01-15',
      item5b_witnessYes: true,
      item5b_witnessNames: 'Officer Johnson',
      item5c_weaponNo: true,
      item5d_harmYes: true,  // ← CORRECT name per TypeScript interface (line 552)
      item5d_harmDescribe: 'Bruises on arm',  // ← CORRECT name per TypeScript interface (line 555)
      item5e_policeDontKnow: false,  // ← CORRECT name per TypeScript interface (line 559)
      item5e_policeNo: false,  // ← CORRECT name per TypeScript interface (line 561)
      item5e_policeYes: true,  // ← CORRECT name per TypeScript interface (line 564)
      item5f_details: 'Incident occurred at home',  // ← CORRECT name per TypeScript interface (line 567)
      item5g_weekly: true,  // ← CORRECT name per TypeScript interface (line 577)
      item5g_dates: '2024-12-01, 2025-01-01, 2025-01-15',  // ← CORRECT name per TypeScript interface (line 583)
    };

    // Test strict validation (remove passthrough to expose the bug)
    const strictSchema = dv100FormDataSchema.strict();
    const result = strictSchema.safeParse(correctFormData);

    if (!result.success) {
      console.log('\n❌ VALIDATION FAILED FOR CORRECT TYPESCRIPT FIELD NAMES:');
      console.log('Unrecognized keys:', result.error.issues.filter(i => i.code === 'unrecognized_keys'));

      // Show which correct fields are being rejected
      const unrecognizedKeys = result.error.issues
        .filter(i => i.code === 'unrecognized_keys')
        .flatMap(i => (i as any).keys || []);

      console.log('\nFields rejected (but they ARE in TypeScript interface!):');
      unrecognizedKeys.forEach(key => console.log(`  - ${key}`));
    }

    // This SHOULD pass but will FAIL before fix because schema has wrong field names
    expect(result.success).toBe(true);
  });

  it('shows what the buggy schema actually expects (wrong field names)', () => {
    // These field names are what the CURRENT (buggy) Zod schema expects
    // They DO NOT match the TypeScript DV100FormData interface

    const buggySchemaExpects = {
      courtCounty: 'Los Angeles',

      // WRONG field names in current Zod schema (not in TypeScript interface):
      item3d_liveTogather: true,  // ← WRONG! TypeScript has item3d_dating
      item3e_usedToLiveTogather: true,  // ← WRONG! TypeScript has item3e_engaged
      item3f_dated: false,  // ← WRONG! TypeScript has item3f_related
      item3g_engaged: false,  // ← WRONG! TypeScript has item3e_engaged (different number!)
      item3h_haveDateChild: false,  // ← WRONG! This field doesn't exist in TypeScript at all

      item5d_policeReportNo: false,  // ← WRONG! TypeScript has item5d_harmNo
      item5d_policeReportYes: true,  // ← WRONG! TypeScript has item5d_harmYes
      item5d_policeReportNumber: 'Report123',  // ← WRONG! TypeScript has item5d_harmDescribe
      item5e_injuryNo: false,  // ← WRONG! TypeScript has item5e_policeDontKnow
      item5e_injuryYes: true,  // ← WRONG! TypeScript has item5e_policeNo
      item5e_injuryDescribe: 'Broken arm',  // ← WRONG! TypeScript has item5e_policeYes
    };

    // The buggy schema WILL validate this wrong data (passthrough mode)
    const passthroughResult = dv100FormDataSchema.safeParse(buggySchemaExpects);
    expect(passthroughResult.success).toBe(true);  // Passes due to .passthrough()

    // But strict mode shows these fields are actually in the schema (wrong!)
    const strictSchema = dv100FormDataSchema.strict();
    const strictResult = strictSchema.safeParse(buggySchemaExpects);

    // If these wrong fields are in the schema, this will pass (proving the bug)
    // After fix, this should FAIL because these field names shouldn't exist
    console.log('\n🐛 BUG DEMONSTRATION:');
    console.log('Wrong field names validate:', strictResult.success ? 'YES (BUG!)' : 'NO (Fixed!)');
  });

  it('PASSES AFTER FIX: validates complete DV-100 form with correct field names', () => {
    const completeFormData: Partial<DV100FormData> = {
      // Header
      courtCounty: 'Los Angeles',
      courtStreetAddress: '111 N Hill St',
      caseNumber: 'DV123456',

      // Item 1: Person asking for protection
      item1a_yourName: 'Jane Doe',
      item1b_yourAge: '32',
      item1c_address: '123 Main St',
      item1c_city: 'Los Angeles',
      item1c_state: 'CA',
      item1c_zip: '90012',
      item1d_telephone: '(555) 123-4567',
      item1d_email: 'jane@example.com',

      // Item 2: Person to protect from
      item2a_fullName: 'John Doe',
      item2b_age: '35',
      item2d_genderM: true,
      item2e_race: 'White',

      // Item 3: Relationship (CORRECT field names)
      item3a_haveChildren: true,
      item3a_childrenNames: 'Child Doe, age 5',
      item3c_usedToBeMarried: true,
      item3d_dating: false,
      item3e_engaged: false,
      item3g_liveTogether: true,
      item3g_asFamily: true,

      // Item 4: Other court cases (CORRECT field names from TypeScript)
      item4a_noOrders: true,
      item4b_yesOtherCases: true,
      item4b_divorce: true,

      // Item 5: Abuse details (CORRECT field names)
      item5a_dateOfAbuse: '2025-01-15',
      item5b_witnessYes: true,
      item5b_witnessNames: 'Witness Name',
      item5c_weaponNo: true,
      item5d_harmYes: true,
      item5d_harmDescribe: 'Bruises on left arm',
      item5e_policeYes: true,
      item5f_details: 'Detailed description of incident',
      item5g_2to5times: true,
      item5g_dates: '2025-01-01, 2025-01-10, 2025-01-15',
    };

    // With passthrough, this passes even with bugs
    const passthroughResult = dv100FormDataSchema.safeParse(completeFormData);
    expect(passthroughResult.success).toBe(true);

    // After fix, strict mode should also pass
    const strictSchema = dv100FormDataSchema.strict();
    const strictResult = strictSchema.safeParse(completeFormData);

    if (!strictResult.success) {
      console.log('\n❌ STRICT VALIDATION FAILED:');
      strictResult.error.issues.forEach(issue => {
        console.log(`  ${issue.code}: ${issue.message}`);
        if (issue.code === 'unrecognized_keys') {
          console.log(`  Unrecognized: ${(issue as any).keys?.join(', ')}`);
        }
      });
    }

    // After fix, this should pass
    expect(strictResult.success).toBe(true);
  });
});
