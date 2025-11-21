/**
 * Unit tests for Vault Integration Service
 *
 * Tests the canonical data vault population from Maps and Plaid
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/integrations/supabase/client';
import {
  saveValidatedAddress,
  getValidatedAddress,
  savePlaidFinancialData,
  getFinancialData,
  checkVaultStatus,
  getFormAutoFillData,
  clearFinancialData,
} from '../vaultIntegration';
import type { AddressResult } from '../googleMapsService';
import type { FL150FinancialData } from '../plaidService';

// ============================================================================
// Test Data
// ============================================================================

const mockAddressResult: AddressResult = {
  formattedAddress: '123 Main Street, Los Angeles, CA 90001',
  streetNumber: '123',
  route: 'Main Street',
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90001',
  county: 'Los Angeles',
  country: 'US',
  placeId: 'ChIJ123abc',
  coordinates: { lat: 34.05, lng: -118.24 },
};

const mockFL150Data: FL150FinancialData = {
  expenses: [
    { category: 'rent_mortgage', label: 'Rent', amount: 2000, transactions: [] },
    { category: 'food_household', label: 'Food', amount: 500, transactions: [] },
  ],
  income: {
    total: 5000,
    sources: [{ source: 'Employer Inc', amount: 5000 }],
  },
  checkingAccounts: [
    {
      accountId: 'acc1',
      name: 'Checking',
      type: 'depository',
      subtype: 'checking',
      mask: '1234',
      balances: { current: 3000, available: 2800 },
    },
  ],
  savingsAccounts: [
    {
      accountId: 'acc2',
      name: 'Savings',
      type: 'depository',
      subtype: 'savings',
      mask: '5678',
      balances: { current: 10000 },
    },
  ],
  creditCards: [
    {
      accountId: 'cc1',
      name: 'Credit Card',
      balance: 1500,
      limit: 5000,
      minimumPayment: 50,
      apr: 19.99,
    },
  ],
  loans: [
    {
      accountId: 'loan1',
      name: 'Auto Loan',
      type: 'auto',
      balance: 15000,
      monthlyPayment: 350,
      interestRate: 5.5,
      originationDate: '2023-01-01',
    },
  ],
  totalLiquidAssets: 13000,
  totalDebt: 16500,
  totalMonthlyDebtPayments: 400,
};

// ============================================================================
// Tests
// ============================================================================

describe('vaultIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Address Functions
  // ==========================================================================

  describe('saveValidatedAddress', () => {
    it('should save address to vault successfully', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { contact_info: {}, data_provenance: {} },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table) => {
        if (table === 'canonical_data_vault') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          };
        }
        return {};
      });

      const result = await saveValidatedAddress('user-123', mockAddressResult);

      expect(result.success).toBe(true);
      expect(result.updated).toContain('contact_info.currentAddress');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should handle upsert error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // No rows
          }),
        }),
      });

      const mockUpsert = vi.fn().mockResolvedValue({
        error: { message: 'Database error' },
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      const result = await saveValidatedAddress('user-123', mockAddressResult);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should support different address types', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { contact_info: {}, data_provenance: {} },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      const result = await saveValidatedAddress('user-123', mockAddressResult, 'mailingAddress');

      expect(result.success).toBe(true);
      expect(result.updated).toContain('contact_info.mailingAddress');
    });
  });

  describe('getValidatedAddress', () => {
    it('should retrieve address from vault', async () => {
      const mockAddress = {
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        validated: true,
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { contact_info: { currentAddress: mockAddress } },
              error: null,
            }),
          }),
        }),
      });

      const result = await getValidatedAddress('user-123');

      expect(result).toEqual(mockAddress);
    });

    it('should return null when no address exists', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { contact_info: {} },
              error: null,
            }),
          }),
        }),
      });

      const result = await getValidatedAddress('user-123');

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // Financial Functions
  // ==========================================================================

  describe('savePlaidFinancialData', () => {
    it('should save financial data to vault', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { financial: {}, data_provenance: {} },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      const result = await savePlaidFinancialData(
        'user-123',
        mockFL150Data,
        { id: 'ins_123', name: 'Test Bank' }
      );

      expect(result.success).toBe(true);
      expect(result.updated).toContain('financial');
    });

    it('should calculate totals correctly', async () => {
      let savedData: any = null;

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { financial: {}, data_provenance: {} },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockImplementation((data) => {
        savedData = data;
        return Promise.resolve({ error: null });
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      await savePlaidFinancialData('user-123', mockFL150Data);

      // Verify expense total
      expect(savedData.financial.monthlyExpenses.total).toBe(2500); // 2000 + 500

      // Verify income
      expect(savedData.financial.monthlyIncome.total).toBe(5000);

      // Verify assets
      expect(savedData.financial.assets.totalLiquid).toBe(13000);

      // Verify liabilities
      expect(savedData.financial.liabilities.totalDebt).toBe(16500);
    });

    it('should preserve sync history', async () => {
      const existingFinancial = {
        syncHistory: [
          { syncedAt: '2025-11-01', totalIncome: 4000 },
          { syncedAt: '2025-11-10', totalIncome: 4500 },
        ],
      };

      let savedData: any = null;

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { financial: existingFinancial, data_provenance: {} },
            error: null,
          }),
        }),
      });

      const mockUpsert = vi.fn().mockImplementation((data) => {
        savedData = data;
        return Promise.resolve({ error: null });
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      await savePlaidFinancialData('user-123', mockFL150Data);

      // Should have 3 entries in history
      expect(savedData.financial.syncHistory).toHaveLength(3);
    });
  });

  describe('getFinancialData', () => {
    it('should retrieve financial data from vault', async () => {
      const mockFinancial = {
        monthlyIncome: { total: 5000, sources: [] },
        monthlyExpenses: { total: 2500, categories: [] },
        lastSyncedAt: '2025-11-21',
        source: 'plaid',
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { financial: mockFinancial },
              error: null,
            }),
          }),
        }),
      });

      const result = await getFinancialData('user-123');

      expect(result).toEqual(mockFinancial);
    });
  });

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  describe('checkVaultStatus', () => {
    it('should return correct status when vault has data', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                contact_info: { currentAddress: { validated: true } },
                financial: { lastSyncedAt: '2025-11-21' },
                updated_at: '2025-11-21T12:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await checkVaultStatus('user-123');

      expect(result.hasValidatedAddress).toBe(true);
      expect(result.hasFinancialData).toBe(true);
      expect(result.lastUpdated).toBe('2025-11-21T12:00:00Z');
    });

    it('should return false when vault is empty', async () => {
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const result = await checkVaultStatus('user-123');

      expect(result.hasValidatedAddress).toBe(false);
      expect(result.hasFinancialData).toBe(false);
      expect(result.lastUpdated).toBeNull();
    });
  });

  describe('getFormAutoFillData', () => {
    it('should return combined data for form auto-fill', async () => {
      const mockData = {
        contact_info: {
          currentAddress: {
            street: '123 Main St',
            city: 'Los Angeles',
            validated: true,
          },
        },
        financial: {
          monthlyIncome: { total: 5000 },
          lastSyncedAt: '2025-11-21',
        },
        data_provenance: {
          'contact_info.currentAddress': { source: 'google_maps' },
          financial: { source: 'plaid' },
        },
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      const result = await getFormAutoFillData('user-123');

      expect(result).not.toBeNull();
      expect(result?.address).toEqual(mockData.contact_info.currentAddress);
      expect(result?.financial).toEqual(mockData.financial);
    });
  });

  describe('clearFinancialData', () => {
    it('should clear financial data from vault', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: mockUpdate,
      });

      const result = await clearFinancialData('user-123');

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ financial: {} })
      );
    });
  });
});
