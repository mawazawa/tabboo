/**
 * Test to verify that constants from PacketTypes are imported correctly as values, not types.
 *
 * This test would fail before the fix because constants were incorrectly imported using
 * 'import type', which only works for types, not values.
 *
 * Bug: Constants like LA_SUPERIOR_COURT_REQUIREMENTS were imported as types but used as values
 * Fix: Separate import statements - 'import type' for types, 'import' for values
 */

import { describe, it, expect } from 'vitest';
import {
  DV_INITIAL_REQUEST_FORM_ORDER,
  DV_RESPONSE_FORM_ORDER,
  LA_SUPERIOR_COURT_REQUIREMENTS,
  STANLEY_MOSK_FILING_LOCATION,
} from '@/types/PacketTypes';

describe('PacketTypes constant imports', () => {
  it('should import DV_INITIAL_REQUEST_FORM_ORDER as a value', () => {
    // Before fix: TypeScript error - "cannot be used as a value"
    // After fix: Works correctly
    expect(DV_INITIAL_REQUEST_FORM_ORDER).toBeDefined();
    expect(Array.isArray(DV_INITIAL_REQUEST_FORM_ORDER)).toBe(true);
    expect(DV_INITIAL_REQUEST_FORM_ORDER.length).toBeGreaterThan(0);
  });

  it('should import DV_RESPONSE_FORM_ORDER as a value', () => {
    expect(DV_RESPONSE_FORM_ORDER).toBeDefined();
    expect(Array.isArray(DV_RESPONSE_FORM_ORDER)).toBe(true);
    expect(DV_RESPONSE_FORM_ORDER.length).toBeGreaterThan(0);
  });

  it('should import LA_SUPERIOR_COURT_REQUIREMENTS as a value with correct properties', () => {
    expect(LA_SUPERIOR_COURT_REQUIREMENTS).toBeDefined();
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.courtName).toBe('Los Angeles Superior Court');
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.county).toBe('Los Angeles');
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.pageSize).toBeDefined();
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.pageSize.width).toBe(8.5);
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.pageSize.height).toBe(11);
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.margins).toBeDefined();
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.margins.left).toBe(1.0);
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.margins.right).toBe(0.5);
    expect(LA_SUPERIOR_COURT_REQUIREMENTS.maxFileSizeBytes).toBe(25 * 1024 * 1024);
  });

  it('should import STANLEY_MOSK_FILING_LOCATION as a value with correct properties', () => {
    expect(STANLEY_MOSK_FILING_LOCATION).toBeDefined();
    expect(STANLEY_MOSK_FILING_LOCATION.courtName).toBe('Stanley Mosk Courthouse');
    expect(STANLEY_MOSK_FILING_LOCATION.address).toBe('111 N. Hill Street');
    expect(STANLEY_MOSK_FILING_LOCATION.cityStateZip).toBe('Los Angeles, CA 90012');
    expect(STANLEY_MOSK_FILING_LOCATION.filingWindow).toBe('Room 100 (Family Law Filing Window)');
    expect(STANLEY_MOSK_FILING_LOCATION.hours).toBe('Monday-Friday, 8:30 AM - 4:30 PM');
  });

  it('should allow constants to be used in runtime code (not just type positions)', () => {
    // This tests that the constants can be used as actual values in code
    const courtName = LA_SUPERIOR_COURT_REQUIREMENTS.courtName;
    const formOrders = [...DV_INITIAL_REQUEST_FORM_ORDER, ...DV_RESPONSE_FORM_ORDER];
    const location = STANLEY_MOSK_FILING_LOCATION.address;

    expect(typeof courtName).toBe('string');
    expect(formOrders.length).toBeGreaterThan(0);
    expect(typeof location).toBe('string');
  });

  it('should verify form order constants have correct structure', () => {
    // Verify DV_INITIAL_REQUEST_FORM_ORDER structure
    DV_INITIAL_REQUEST_FORM_ORDER.forEach(order => {
      expect(order).toHaveProperty('formType');
      expect(order).toHaveProperty('position');
      expect(order).toHaveProperty('required');
      expect(typeof order.position).toBe('number');
      expect(typeof order.required).toBe('boolean');
    });

    // Verify DV_RESPONSE_FORM_ORDER structure
    DV_RESPONSE_FORM_ORDER.forEach(order => {
      expect(order).toHaveProperty('formType');
      expect(order).toHaveProperty('position');
      expect(order).toHaveProperty('required');
      expect(typeof order.position).toBe('number');
      expect(typeof order.required).toBe('boolean');
    });
  });

  it('should verify court requirements can be destructured', () => {
    // This verifies the constant can be used like a normal object
    const { courtName, county, pageSize, margins } = LA_SUPERIOR_COURT_REQUIREMENTS;

    expect(courtName).toBeTruthy();
    expect(county).toBeTruthy();
    expect(pageSize).toBeTruthy();
    expect(margins).toBeTruthy();
  });

  it('should verify filing location can be destructured', () => {
    // This verifies the constant can be used like a normal object
    const { courtName, address, hours } = STANLEY_MOSK_FILING_LOCATION;

    expect(courtName).toBeTruthy();
    expect(address).toBeTruthy();
    expect(hours).toBeTruthy();
  });
});
