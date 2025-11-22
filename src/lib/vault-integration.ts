/**
 * Vault Integration Service
 *
 * Populates the canonical_data_vault with data from external integrations
 * (Google Maps, Plaid) following the Single Source of Truth (SSOT) pattern.
 *
 * Architecture:
 * - Maps/Plaid → Populate canonical_data_vault
 * - Forms → Pull from canonical_data_vault
 *
 * This separation ensures:
 * - Data collection is independent of form logic
 * - User data follows them across all forms
 * - Single integration point for each data source
 * - Easy testing and maintenance
 */

import { supabase } from '@/integrations/supabase/client';
import type { AddressResult } from '@/lib/google-maps-service';
import type { FL150FinancialData, FL150ExpenseCategory } from '@/lib/plaid-service';

// ============================================================================
// Types
// ============================================================================

export interface VaultAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  country: string;
  validated: boolean;
  validatedAt: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isConfidential?: boolean;
  isSafeAtHome?: boolean;
}

export interface VaultFinancialData {
  // Income
  monthlyIncome: {
    total: number;
    sources: Array<{
      source: string;
      amount: number;
    }>;
  };

  // Expenses by FL-150 category
  monthlyExpenses: {
    total: number;
    categories: Array<{
      category: string;
      label: string;
      amount: number;
    }>;
  };

  // Assets
  assets: {
    checking: Array<{
      name: string;
      balance: number;
      mask?: string;
    }>;
    savings: Array<{
      name: string;
      balance: number;
      mask?: string;
    }>;
    totalLiquid: number;
  };

  // Liabilities
  liabilities: {
    creditCards: Array<{
      name: string;
      balance: number;
      limit?: number;
      minimumPayment?: number;
    }>;
    loans: Array<{
      name: string;
      type: string;
      balance: number;
      monthlyPayment: number;
    }>;
    totalDebt: number;
    totalMonthlyDebtPayments: number;
  };

  // Metadata
  lastSyncedAt: string;
  source: 'plaid' | 'manual';
  institutionName?: string;
  institutionId?: string;
}

export interface DataProvenance {
  source: 'google_maps' | 'plaid' | 'manual_entry' | 'document_scan' | 'voice_conversation';
  sourceId?: string;
  timestamp: string;
  confidence?: number;
  verified?: boolean;
  verifiedAt?: string;
}

export interface VaultUpdateResult {
  success: boolean;
  updated: string[];
  error?: string;
}

// ============================================================================
// Address Functions
// ============================================================================

/**
 * Save a validated address to the canonical vault
 *
 * @param userId - User ID
 * @param address - Validated address from Google Maps
 * @param addressType - Type of address (current, mailing, employer, etc.)
 * @returns Update result
 */
export async function saveValidatedAddress(
  userId: string,
  address: AddressResult,
  addressType: 'currentAddress' | 'mailingAddress' | 'employerAddress' = 'currentAddress'
): Promise<VaultUpdateResult> {
  try {
    // Get current vault data
    const { data: vault, error: fetchError } = await supabase
      .from('canonical_data_vault')
      .select('contact_info, data_provenance')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (vault doesn't exist yet)
      throw fetchError;
    }

    // Build the vault address object
    const vaultAddress: VaultAddress = {
      street: address.streetNumber && address.route
        ? `${address.streetNumber} ${address.route}`
        : (address.formattedAddress?.split(',')[0] || ''),
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      county: address.county,
      country: address.country || 'US',
      validated: true,
      validatedAt: new Date().toISOString(),
      placeId: address.placeId,
      coordinates: address.coordinates,
    };

    // Merge with existing contact_info
    const existingContactInfo = vault?.contact_info || {};
    const updatedContactInfo = {
      ...existingContactInfo,
      [addressType]: vaultAddress,
    };

    // Update provenance
    const existingProvenance = vault?.data_provenance || {};
    const updatedProvenance = {
      ...existingProvenance,
      [`contact_info.${addressType}`]: {
        source: 'google_maps',
        sourceId: address.placeId,
        timestamp: new Date().toISOString(),
        confidence: 1.0,
        verified: true,
        verifiedAt: new Date().toISOString(),
      } as DataProvenance,
    };

    // Upsert to vault
    const { error: updateError } = await supabase
      .from('canonical_data_vault')
      .upsert({
        user_id: userId,
        contact_info: updatedContactInfo,
        data_provenance: updatedProvenance,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      updated: [`contact_info.${addressType}`],
    };
  } catch (error) {
    console.error('Error saving validated address to vault:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : (error as { message?: string })?.message || 'Unknown error';
    return {
      success: false,
      updated: [],
      error: errorMessage,
    };
  }
}

/**
 * Get the current validated address from the vault
 *
 * @param userId - User ID
 * @param addressType - Type of address to retrieve
 * @returns Vault address or null
 */
export async function getValidatedAddress(
  userId: string,
  addressType: 'currentAddress' | 'mailingAddress' | 'employerAddress' = 'currentAddress'
): Promise<VaultAddress | null> {
  try {
    const { data: vault, error } = await supabase
      .from('canonical_data_vault')
      .select('contact_info')
      .eq('user_id', userId)
      .single();

    if (error || !vault?.contact_info) {
      return null;
    }

    return vault.contact_info[addressType] || null;
  } catch (error) {
    console.error('Error getting validated address from vault:', error);
    return null;
  }
}

// ============================================================================
// Financial Data Functions
// ============================================================================

/**
 * Save Plaid financial data to the canonical vault
 *
 * @param userId - User ID
 * @param financialData - FL-150 financial data from Plaid
 * @param institutionInfo - Institution metadata
 * @returns Update result
 */
export async function savePlaidFinancialData(
  userId: string,
  financialData: FL150FinancialData,
  institutionInfo?: { id: string; name: string }
): Promise<VaultUpdateResult> {
  try {
    // Get current vault data
    const { data: vault, error: fetchError } = await supabase
      .from('canonical_data_vault')
      .select('financial, data_provenance')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Build the vault financial data object
    const vaultFinancial: VaultFinancialData = {
      monthlyIncome: {
        total: financialData.income.total,
        sources: financialData.income.sources,
      },
      monthlyExpenses: {
        total: financialData.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        categories: financialData.expenses.map(exp => ({
          category: exp.category,
          label: exp.label,
          amount: exp.amount,
        })),
      },
      assets: {
        checking: (financialData.checkingAccounts || []).map(acc => ({
          name: acc.name,
          balance: acc.balances?.current || 0,
          mask: acc.mask,
        })),
        savings: (financialData.savingsAccounts || []).map(acc => ({
          name: acc.name,
          balance: acc.balances?.current || 0,
          mask: acc.mask,
        })),
        totalLiquid: financialData.totalLiquidAssets || 0,
      },
      liabilities: {
        creditCards: (financialData.creditCards || []).map(cc => ({
          name: cc.name,
          balance: cc.balance,
          limit: cc.limit,
          minimumPayment: cc.minimumPayment,
        })),
        loans: (financialData.loans || []).map(loan => ({
          name: loan.name,
          type: loan.type,
          balance: loan.balance,
          monthlyPayment: loan.monthlyPayment,
        })),
        totalDebt: financialData.totalDebt || 0,
        totalMonthlyDebtPayments: financialData.totalMonthlyDebtPayments || 0,
      },
      lastSyncedAt: new Date().toISOString(),
      source: 'plaid',
      institutionId: institutionInfo?.id,
      institutionName: institutionInfo?.name,
    };

    // Merge with existing financial data (keep historical data)
    const existingFinancial = vault?.financial || {};
    const updatedFinancial = {
      ...existingFinancial,
      ...vaultFinancial,
      // Keep history of syncs
      syncHistory: [
        ...(existingFinancial.syncHistory || []).slice(-4), // Keep last 5
        {
          syncedAt: new Date().toISOString(),
          totalIncome: vaultFinancial.monthlyIncome.total,
          totalExpenses: vaultFinancial.monthlyExpenses.total,
        },
      ],
    };

    // Update provenance
    const existingProvenance = vault?.data_provenance || {};
    const updatedProvenance = {
      ...existingProvenance,
      financial: {
        source: 'plaid',
        sourceId: institutionInfo?.id,
        timestamp: new Date().toISOString(),
        confidence: 1.0,
        verified: true,
        verifiedAt: new Date().toISOString(),
      } as DataProvenance,
    };

    // Upsert to vault
    const { error: updateError } = await supabase
      .from('canonical_data_vault')
      .upsert({
        user_id: userId,
        financial: updatedFinancial,
        data_provenance: updatedProvenance,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      updated: ['financial'],
    };
  } catch (error) {
    console.error('Error saving Plaid financial data to vault:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : (error as { message?: string })?.message || 'Unknown error';
    return {
      success: false,
      updated: [],
      error: errorMessage,
    };
  }
}

/**
 * Get financial data from the vault
 *
 * @param userId - User ID
 * @returns Vault financial data or null
 */
export async function getFinancialData(
  userId: string
): Promise<VaultFinancialData | null> {
  try {
    const { data: vault, error } = await supabase
      .from('canonical_data_vault')
      .select('financial')
      .eq('user_id', userId)
      .single();

    if (error || !vault?.financial) {
      return null;
    }

    return vault.financial as VaultFinancialData;
  } catch (error) {
    console.error('Error getting financial data from vault:', error);
    return null;
  }
}

/**
 * Get FL-150 formatted expense data from vault
 *
 * @param userId - User ID
 * @returns Expenses formatted for FL-150 form
 */
export async function getFL150Expenses(
  userId: string
): Promise<FL150ExpenseCategory[] | null> {
  const financial = await getFinancialData(userId);
  if (!financial) return null;

  return financial.monthlyExpenses.categories.map(cat => ({
    category: cat.category,
    label: cat.label,
    amount: cat.amount,
    transactions: [], // Not stored in vault for privacy
  }));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if vault has validated data
 *
 * @param userId - User ID
 * @returns Object indicating which data types are available
 */
export async function checkVaultStatus(
  userId: string
): Promise<{
  hasValidatedAddress: boolean;
  hasFinancialData: boolean;
  lastUpdated: string | null;
}> {
  try {
    const { data: vault, error } = await supabase
      .from('canonical_data_vault')
      .select('contact_info, financial, updated_at')
      .eq('user_id', userId)
      .single();

    if (error || !vault) {
      return {
        hasValidatedAddress: false,
        hasFinancialData: false,
        lastUpdated: null,
      };
    }

    return {
      hasValidatedAddress: !!vault.contact_info?.currentAddress?.validated,
      hasFinancialData: !!vault.financial?.lastSyncedAt,
      lastUpdated: vault.updated_at,
    };
  } catch (error) {
    console.error('Error checking vault status:', error);
    return {
      hasValidatedAddress: false,
      hasFinancialData: false,
      lastUpdated: null,
    };
  }
}

/**
 * Get data provenance for a specific field
 *
 * @param userId - User ID
 * @param field - Field path (e.g., 'contact_info.currentAddress')
 * @returns Provenance information or null
 */
export async function getDataProvenance(
  userId: string,
  field: string
): Promise<DataProvenance | null> {
  try {
    const { data: vault, error } = await supabase
      .from('canonical_data_vault')
      .select('data_provenance')
      .eq('user_id', userId)
      .single();

    if (error || !vault?.data_provenance) {
      return null;
    }

    return vault.data_provenance[field] || null;
  } catch (error) {
    console.error('Error getting data provenance:', error);
    return null;
  }
}

/**
 * Clear financial data from vault (for user privacy requests)
 *
 * @param userId - User ID
 * @returns Success status
 */
export async function clearFinancialData(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('canonical_data_vault')
      .update({
        financial: {},
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error clearing financial data:', error);
    return false;
  }
}

// ============================================================================
// Form Auto-Fill Helpers
// ============================================================================

/**
 * Get all auto-fill data for a form
 *
 * @param userId - User ID
 * @returns All vault data suitable for form auto-fill
 */
export async function getFormAutoFillData(userId: string): Promise<{
  address: VaultAddress | null;
  financial: VaultFinancialData | null;
  provenance: Record<string, DataProvenance>;
} | null> {
  try {
    const { data: vault, error } = await supabase
      .from('canonical_data_vault')
      .select('contact_info, financial, data_provenance')
      .eq('user_id', userId)
      .single();

    if (error || !vault) {
      return null;
    }

    return {
      address: vault.contact_info?.currentAddress || null,
      financial: vault.financial || null,
      provenance: vault.data_provenance || {},
    };
  } catch (error) {
    console.error('Error getting form auto-fill data:', error);
    return null;
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Address functions
  saveValidatedAddress,
  getValidatedAddress,

  // Financial functions
  savePlaidFinancialData,
  getFinancialData,
  getFL150Expenses,

  // Utility functions
  checkVaultStatus,
  getDataProvenance,
  clearFinancialData,
  getFormAutoFillData,
};
