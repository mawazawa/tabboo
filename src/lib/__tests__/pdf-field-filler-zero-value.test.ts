/**
 * PDF Field Filler - Zero Value Bug Regression Test
 *
 * BUG DESCRIPTION:
 * Line 47 originally used `if (!value || value === '') continue;` which incorrectly
 * skipped numeric zero values. This caused fields with value "0" to not appear in
 * exported PDFs, resulting in data loss for legal forms where zero is meaningful.
 *
 * EXAMPLES OF AFFECTED FIELDS:
 * - "Number of children: 0" (custody forms)
 * - "Amount owed: $0" (financial forms)
 * - "Years of marriage: 0" (marriage duration)
 * - Any field where zero has semantic meaning
 *
 * THE FIX:
 * Changed from falsy check to explicit null/undefined/empty string check:
 * Before: `if (!value || value === '') continue;`
 * After: `if (value === null || value === undefined || value === '') continue;`
 *
 * This test ensures numeric zero values are properly rendered in PDFs.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { fillPDFFields } from '../pdf-field-filler';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [
            {
              form_field_name: 'numberOfChildren',
              page_number: 1,
              position_top: '2.0',
              position_left: '1.0',
              field_width: '1.0',
              field_height: null,
              field_type: 'input',
            },
            {
              form_field_name: 'amountOwed',
              page_number: 1,
              position_top: '3.0',
              position_left: '1.0',
              field_width: '1.0',
              field_height: null,
              field_type: 'input',
            },
            {
              form_field_name: 'yearsMarried',
              page_number: 1,
              position_top: '4.0',
              position_left: '1.0',
              field_width: '1.0',
              field_height: null,
              field_type: 'input',
            },
          ],
          error: null,
        })),
      })),
    })),
  },
}));

// Mock fetch for PDF loading
global.fetch = vi.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
) as any;

// Shared mock page spy
let drawTextSpy: any;

// Mock PDFDocument
vi.mock('pdf-lib', async () => {
  const actual = await vi.importActual('pdf-lib');

  return {
    ...actual,
    PDFDocument: {
      load: vi.fn(() => {
        drawTextSpy = vi.fn(); // Create new spy for each load
        return Promise.resolve({
          registerFontkit: vi.fn(),
          embedFont: vi.fn(() => Promise.resolve({})),
          getPageCount: vi.fn(() => 1),
          getPage: vi.fn(() => ({
            getSize: () => ({ width: 612, height: 792 }),
            drawText: drawTextSpy,
          })),
          save: vi.fn(() => Promise.resolve(new Uint8Array())),
        });
      }),
    },
  };
});

describe('PDF Field Filler - Zero Value Bug Regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * CRITICAL REGRESSION TEST: Numeric zero should be rendered
   */
  test('renders numeric zero value in PDF (number type)', async () => {
    const formData = {
      numberOfChildren: 0, // Numeric zero
      amountOwed: 0,
      yearsMarried: 0,
    };

    await fillPDFFields({
      formData,
      pdfPath: '/test.pdf',
      formNumber: 'FL-320',
      fontSize: 12,
    });

    // Verify drawText was called 3 times (once for each zero value)
    expect(drawTextSpy).toHaveBeenCalledTimes(3);

    // Verify the zero values were drawn as "0"
    expect(drawTextSpy).toHaveBeenCalledWith(
      '0',
      expect.objectContaining({
        size: 12,
        maxWidth: expect.any(Number),
      })
    );
  });

  /**
   * VERIFICATION TEST: String "0" should also be rendered
   */
  test('renders string "0" value in PDF', async () => {
    const formData = {
      numberOfChildren: '0', // String zero
    };

    await fillPDFFields({
      formData,
      pdfPath: '/test.pdf',
      formNumber: 'FL-320',
      fontSize: 12,
    });

    // Verify drawText was called
    expect(drawTextSpy).toHaveBeenCalledTimes(1);
    expect(drawTextSpy).toHaveBeenCalledWith(
      '0',
      expect.any(Object)
    );
  });

  /**
   * EDGE CASE TEST: Empty string should still be skipped
   */
  test('skips empty string values (should not render)', async () => {
    const formData = {
      numberOfChildren: '', // Empty string - should skip
    };

    await fillPDFFields({
      formData,
      pdfPath: '/test.pdf',
      formNumber: 'FL-320',
      fontSize: 12,
    });

    // Verify drawText was NOT called
    expect(drawTextSpy).not.toHaveBeenCalled();
  });

  /**
   * EDGE CASE TEST: Null values should be skipped
   */
  test('skips null values (should not render)', async () => {
    const formData = {
      numberOfChildren: null, // Null - should skip
    };

    await fillPDFFields({
      formData,
      pdfPath: '/test.pdf',
      formNumber: 'FL-320',
      fontSize: 12,
    });

    // Verify drawText was NOT called
    expect(drawTextSpy).not.toHaveBeenCalled();
  });

  /**
   * EDGE CASE TEST: Undefined values should be skipped
   */
  test('skips undefined values (should not render)', async () => {
    const formData = {
      numberOfChildren: undefined, // Undefined - should skip
    };

    await fillPDFFields({
      formData,
      pdfPath: '/test.pdf',
      formNumber: 'FL-320',
      fontSize: 12,
    });

    // Verify drawText was NOT called
    expect(drawTextSpy).not.toHaveBeenCalled();
  });

  /**
   * COMPREHENSIVE TEST: Mixed values including zero
   */
  test('handles mixed values correctly (zero, empty, and valid)', async () => {
    const formData = {
      numberOfChildren: 0, // Should render as "0"
      amountOwed: '', // Should skip
      yearsMarried: 5, // Should render as "5"
    };

    await fillPDFFields({
      formData,
      pdfPath: '/test.pdf',
      formNumber: 'FL-320',
      fontSize: 12,
    });

    // Verify drawText was called exactly twice (for 0 and 5, skipping '')
    expect(drawTextSpy).toHaveBeenCalledTimes(2);

    // Verify the calls included "0" and "5"
    const calls = drawTextSpy.mock.calls;
    const drawnValues = calls.map((call: any) => call[0]);
    expect(drawnValues).toContain('0');
    expect(drawnValues).toContain('5');
  });

  /**
   * COMPARATIVE TEST: Demonstrates the bug fix
   */
  test('buggy vs fixed behavior comparison', () => {
    const value = 0;

    // BUGGY behavior (original code)
    const buggyCheck = !value || value === '';
    expect(buggyCheck).toBe(true); // Would skip zero!

    // FIXED behavior (new code)
    const fixedCheck = value === null || value === undefined || value === '';
    expect(fixedCheck).toBe(false); // Correctly allows zero!

    // Demonstrate the difference
    expect(buggyCheck).not.toBe(fixedCheck);
  });
});

/**
 * TECHNICAL NOTES:
 *
 * Why is this bug critical for legal forms?
 * - In custody forms: "Number of children: 0" is legally significant
 * - In financial forms: "$0 owed" vs missing data have different legal meanings
 * - Court forms must be accurate - missing zeros could invalidate documents
 *
 * JavaScript falsy values:
 * - false, 0, -0, 0n, "", null, undefined, NaN
 * - Of these, only 0 and "" are valid form field values
 * - 0 should render, "" should be skipped
 *
 * The fix:
 * - Explicitly checks for null, undefined, and empty string
 * - Allows all other falsy values (0, false) to proceed
 * - false is handled by formatFieldValue for checkboxes
 * - 0 is now correctly converted to string and rendered
 *
 * November 2025 best practices applied:
 * - Explicit null checking instead of falsy coercion
 * - Comprehensive edge case testing
 * - Comparative test showing bug vs fix
 * - Real-world scenario documentation
 */
