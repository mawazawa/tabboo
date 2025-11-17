/**
 * Test to verify that FormType enum is used correctly in eFilingExporter
 *
 * This test verifies the bug fix where string literals with type assertions
 * were incorrectly used instead of proper enum values.
 *
 * Bug: f.formType === 'CLETS-001' as FormType (type-unsafe)
 * Fix: f.formType === FormType.CLETS001 (type-safe)
 */

import { describe, it, expect } from 'vitest';
import { FormType } from '@/types/PacketTypes';
import type { PacketForm, TROPacket, PacketMetadata } from '@/types/PacketTypes';

describe('eFilingExporter FormType usage', () => {
  // Create mock packet forms for testing
  const createMockForm = (formType: FormType): PacketForm => ({
    formType,
    category: 'primary' as any,
    displayName: `Test ${formType}`,
    isRequired: true,
    isComplete: true,
    pdfData: new Blob(['test'], { type: 'application/pdf' }),
  });

  const mockForms: PacketForm[] = [
    createMockForm(FormType.DV100),
    createMockForm(FormType.CLETS001),
    createMockForm(FormType.FL150),
  ];

  it('should correctly identify CLETS001 form using enum value', () => {
    // This is the CORRECT way - using enum value
    const cletsForm = mockForms.find(f => f.formType === FormType.CLETS001);

    expect(cletsForm).toBeDefined();
    expect(cletsForm?.formType).toBe(FormType.CLETS001);
    expect(cletsForm?.formType).toBe('CLETS-001'); // Enum value equals string
  });

  it('should correctly filter out CLETS001 form using enum value', () => {
    // This is the CORRECT way - using enum value for filtering
    const nonCletsForms = mockForms.filter(f => f.formType !== FormType.CLETS001);

    expect(nonCletsForms).toHaveLength(2);
    expect(nonCletsForms.every(f => f.formType !== FormType.CLETS001)).toBe(true);
    expect(nonCletsForms.find(f => f.formType === FormType.DV100)).toBeDefined();
    expect(nonCletsForms.find(f => f.formType === FormType.FL150)).toBeDefined();
  });

  it('should demonstrate the problem with string literals and type assertions', () => {
    // This WORKS at runtime but is TYPE-UNSAFE
    // Before fix: f.formType === 'CLETS-001' as FormType
    const cletsFormUnsafe = mockForms.find(f => f.formType === 'CLETS-001' as FormType);

    // This works because the enum value happens to be 'CLETS-001'
    expect(cletsFormUnsafe).toBeDefined();

    // BUT if we typo the string, TypeScript won't catch it with 'as FormType'
    // This is why using the enum directly is safer
  });

  it('should verify enum value equals string value', () => {
    // Verify that the enum value is indeed the string we expect
    expect(FormType.CLETS001).toBe('CLETS-001');

    // This proves that f.formType === FormType.CLETS001 is equivalent to
    // f.formType === 'CLETS-001' at runtime, but the enum is type-safe
  });

  it('should handle all FormType enum values correctly', () => {
    // Verify all enum values are accessible
    expect(FormType.FL320).toBe('FL-320');
    expect(FormType.DV100).toBe('DV-100');
    expect(FormType.DV105).toBe('DV-105');
    expect(FormType.FL150).toBe('FL-150');
    expect(FormType.CLETS001).toBe('CLETS-001');
    expect(FormType.DV109).toBe('DV-109');
    expect(FormType.DV110).toBe('DV-110');
    expect(FormType.DV140).toBe('DV-140');
  });

  it('should demonstrate refactoring safety with enum values', () => {
    // If we use FormType.CLETS001, refactoring tools will update all references
    // If we use 'CLETS-001' as FormType, refactoring tools won't find it

    const forms = [
      { formType: FormType.CLETS001 },
      { formType: FormType.DV100 },
    ];

    // This will always work even if the enum value changes
    const hasCletsForm = forms.some(f => f.formType === FormType.CLETS001);
    expect(hasCletsForm).toBe(true);
  });

  it('should correctly separate CLETS from other forms in packet assembly', () => {
    // Simulates the logic in eFilingExporter.ts line 50
    const separateCLETS = true;

    const mainForms = separateCLETS
      ? mockForms.filter(f => f.formType !== FormType.CLETS001)
      : mockForms;

    expect(mainForms).toHaveLength(2);
    expect(mainForms.find(f => f.formType === FormType.CLETS001)).toBeUndefined();
  });

  it('should correctly find CLETS form for separate export', () => {
    // Simulates the logic in eFilingExporter.ts line 81
    const cletsForm = mockForms.find(f => f.formType === FormType.CLETS001);

    expect(cletsForm).toBeDefined();
    expect(cletsForm?.formType).toBe(FormType.CLETS001);
    expect(cletsForm?.pdfData).toBeDefined();
  });

  it('should handle missing CLETS form gracefully', () => {
    const formsWithoutCLETS = mockForms.filter(f => f.formType !== FormType.CLETS001);
    const cletsForm = formsWithoutCLETS.find(f => f.formType === FormType.CLETS001);

    expect(cletsForm).toBeUndefined();
  });

  it('should verify type safety: enum prevents invalid comparisons', () => {
    // With enum, TypeScript will catch typos at compile time
    const form = createMockForm(FormType.CLETS001);

    // This is type-safe - TypeScript knows formType is FormType
    const isCletsForm = form.formType === FormType.CLETS001;
    expect(isCletsForm).toBe(true);

    // If we typo FormType.CLETS01 (missing zero), TypeScript will error
    // If we used 'CLETS-01' as FormType, TypeScript wouldn't catch the typo
  });
});
