/**
 * Unit tests for Google Maps Service
 *
 * Tests address validation, autocomplete, court finder, and privacy utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isPoBox,
  isSafeAtHomeAddress,
  maskAddressForLogging,
  clearAutocompleteSession,
  CALIFORNIA_COURTS,
  type AddressResult,
} from '@/lib/google-maps-service';

// ============================================================================
// Privacy Utility Tests
// ============================================================================

describe('isPoBox', () => {
  it('should detect standard PO Box formats', () => {
    expect(isPoBox('PO Box 123')).toBe(true);
    expect(isPoBox('P.O. Box 456')).toBe(true);
    expect(isPoBox('P O Box 789')).toBe(true);
    expect(isPoBox('Post Office Box 101')).toBe(true);
    expect(isPoBox('POB 202')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isPoBox('po box 123')).toBe(true);
    expect(isPoBox('PO BOX 456')).toBe(true);
    expect(isPoBox('Po Box 789')).toBe(true);
  });

  it('should not match regular addresses', () => {
    expect(isPoBox('123 Main Street')).toBe(false);
    expect(isPoBox('456 Oak Avenue')).toBe(false);
    expect(isPoBox('789 Boxer Lane')).toBe(false); // Contains "box" but not PO Box
  });

  it('should handle edge cases', () => {
    expect(isPoBox('')).toBe(false);
    expect(isPoBox('   ')).toBe(false);
    expect(isPoBox('P.O.Box 123')).toBe(true); // Standard format with space
  });
});

describe('isSafeAtHomeAddress', () => {
  it('should detect California Safe at Home addresses', () => {
    expect(isSafeAtHomeAddress('P.O. Box 531297, Sacramento, CA 95853')).toBe(true);
    expect(isSafeAtHomeAddress('PO Box 531297')).toBe(true);
    expect(isSafeAtHomeAddress('Sacramento, CA 95853')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isSafeAtHomeAddress('sacramento, ca 95853')).toBe(true);
    expect(isSafeAtHomeAddress('SACRAMENTO, CA 95853')).toBe(true);
  });

  it('should not match similar but different addresses', () => {
    expect(isSafeAtHomeAddress('P.O. Box 531298')).toBe(false);
    expect(isSafeAtHomeAddress('Sacramento, CA 95854')).toBe(false);
    expect(isSafeAtHomeAddress('123 Main St, Sacramento, CA')).toBe(false);
  });
});

describe('maskAddressForLogging', () => {
  it('should return only city and county', () => {
    const address: AddressResult = {
      formattedAddress: '123 Main St, Los Angeles, CA 90001',
      streetNumber: '123',
      route: 'Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      county: 'Los Angeles',
      country: 'US',
      placeId: 'abc123',
      latitude: 34.0522,
      longitude: -118.2437,
    };

    expect(maskAddressForLogging(address)).toBe('Los Angeles, Los Angeles');
  });

  it('should fallback to state if county is empty', () => {
    const address: AddressResult = {
      formattedAddress: '123 Main St, San Francisco, CA',
      streetNumber: '123',
      route: 'Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      county: '',
      country: 'US',
      placeId: 'def456',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    expect(maskAddressForLogging(address)).toBe('San Francisco, CA');
  });

  it('should not expose street address', () => {
    const address: AddressResult = {
      formattedAddress: '1600 Pennsylvania Avenue NW, Washington, DC 20500',
      streetNumber: '1600',
      route: 'Pennsylvania Avenue NW',
      city: 'Washington',
      state: 'DC',
      zipCode: '20500',
      county: 'District of Columbia',
      country: 'US',
      placeId: 'ghi789',
      latitude: 38.8977,
      longitude: -77.0365,
    };

    const masked = maskAddressForLogging(address);
    expect(masked).not.toContain('1600');
    expect(masked).not.toContain('Pennsylvania');
    expect(masked).toBe('Washington, District of Columbia');
  });
});

// ============================================================================
// Session Management Tests
// ============================================================================

describe('clearAutocompleteSession', () => {
  it('should clear without throwing', () => {
    expect(() => clearAutocompleteSession()).not.toThrow();
  });

  it('should be idempotent', () => {
    clearAutocompleteSession();
    clearAutocompleteSession();
    clearAutocompleteSession();
    // Should not throw
    expect(true).toBe(true);
  });
});

// ============================================================================
// Input Validation Tests
// ============================================================================

describe('Input edge cases', () => {
  describe('isPoBox edge cases', () => {
    it('should handle special characters', () => {
      expect(isPoBox('P.O. Box #123')).toBe(true);
      expect(isPoBox('PO Box 123-A')).toBe(true);
    });

    it('should handle multi-line addresses', () => {
      expect(isPoBox('John Doe\nPO Box 123\nCity, ST 12345')).toBe(true);
    });

    it('should not match "boxer" or "boxing"', () => {
      expect(isPoBox('123 Boxer Street')).toBe(false);
      expect(isPoBox('Boxing Gym, 456 Main St')).toBe(false);
    });
  });
});

// ============================================================================
// California Courts Data Tests
// ============================================================================

describe('California Courts Data Integrity', () => {
  it('should have at least 10 courts', () => {
    expect(CALIFORNIA_COURTS.length).toBeGreaterThanOrEqual(10);
  });

  it('should have valid coordinates for all courts', () => {
    for (const court of CALIFORNIA_COURTS) {
      expect(court.coordinates.lat).toBeGreaterThan(32); // Southern CA
      expect(court.coordinates.lat).toBeLessThan(42); // Northern CA
      expect(court.coordinates.lng).toBeGreaterThan(-125); // Western CA
      expect(court.coordinates.lng).toBeLessThan(-114); // Eastern CA
    }
  });

  it('should have required fields for all courts', () => {
    for (const court of CALIFORNIA_COURTS) {
      expect(court.county).toBeTruthy();
      expect(court.name).toBeTruthy();
      expect(court.address).toBeTruthy();
      expect(court.city).toBeTruthy();
      expect(court.zipCode).toMatch(/^\d{5}$/);
      expect(court.phone).toBeTruthy();
      expect(court.hours).toBeTruthy();
      expect(court.filingUrl).toMatch(/^https?:\/\//);
    }
  });

  it('should have unique county names', () => {
    const counties = CALIFORNIA_COURTS.map((c: { county: string }) => c.county.toLowerCase());
    const uniqueCounties = new Set(counties);
    expect(uniqueCounties.size).toBe(counties.length);
  });

  it('should include major counties', () => {
    const counties = CALIFORNIA_COURTS.map((c: { county: string }) => c.county.toLowerCase());
    expect(counties).toContain('los angeles');
    expect(counties).toContain('san diego');
    expect(counties).toContain('orange');
    expect(counties).toContain('san francisco');
    expect(counties).toContain('sacramento');
  });
});
