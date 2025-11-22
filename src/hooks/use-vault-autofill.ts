/**
 * useVaultAutofill Hook
 *
 * Provides vault integration for form auto-fill functionality.
 * Handles saving validated data to vault and retrieving for forms.
 *
 * Usage:
 * ```tsx
 * const {
 *   saveAddress,
 *   saveFinancials,
 *   getAutoFillData,
 *   vaultStatus,
 * } = useVaultAutofill();
 *
 * // In AddressAutocomplete onAddressSelect
 * onAddressSelect={(address) => {
 *   saveAddress(address);
 *   // Also update local form state
 *   setFormData({ ...formData, city: address.city });
 * }}
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  saveValidatedAddress,
  savePlaidFinancialData,
  getFormAutoFillData,
  checkVaultStatus,
  type VaultAddress,
  type VaultFinancialData,
  type VaultUpdateResult,
} from '@/lib/vault-integration';
import type { AddressResult } from '@/lib/google-maps-service';
import type { FL150FinancialData } from '@/lib/plaid-service';

// ============================================================================
// Types
// ============================================================================

export interface VaultStatus {
  hasValidatedAddress: boolean;
  hasFinancialData: boolean;
  lastUpdated: string | null;
  loading: boolean;
}

export interface UseVaultAutofillReturn {
  /** Save a validated address to the vault */
  saveAddress: (
    address: AddressResult,
    addressType?: 'currentAddress' | 'mailingAddress' | 'employerAddress'
  ) => Promise<VaultUpdateResult>;

  /** Save Plaid financial data to the vault */
  saveFinancials: (
    data: FL150FinancialData,
    institution?: { id: string; name: string }
  ) => Promise<VaultUpdateResult>;

  /** Get all auto-fill data from vault */
  getAutoFillData: () => Promise<{
    address: VaultAddress | null;
    financial: VaultFinancialData | null;
  } | null>;

  /** Current vault status */
  vaultStatus: VaultStatus;

  /** Refresh vault status */
  refreshStatus: () => Promise<void>;

  /** Whether currently saving */
  saving: boolean;

  /** Last error */
  error: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVaultAutofill(): UseVaultAutofillReturn {
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>({
    hasValidatedAddress: false,
    hasFinancialData: false,
    lastUpdated: null,
    loading: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh vault status
   */
  const refreshStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVaultStatus({
          hasValidatedAddress: false,
          hasFinancialData: false,
          lastUpdated: null,
          loading: false,
        });
        return;
      }

      const status = await checkVaultStatus(user.id);
      setVaultStatus({
        ...status,
        loading: false,
      });
    } catch (err) {
      console.error('Error refreshing vault status:', err);
      setVaultStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  /**
   * Save validated address to vault
   */
  const saveAddress = useCallback(async (
    address: AddressResult,
    addressType: 'currentAddress' | 'mailingAddress' | 'employerAddress' = 'currentAddress'
  ): Promise<VaultUpdateResult> => {
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await saveValidatedAddress(user.id, address, addressType);

      if (result.success) {
        // Refresh status after save
        await refreshStatus();
      } else {
        setError(result.error || 'Failed to save address');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, updated: [], error: message };
    } finally {
      setSaving(false);
    }
  }, [refreshStatus]);

  /**
   * Save financial data to vault
   */
  const saveFinancials = useCallback(async (
    data: FL150FinancialData,
    institution?: { id: string; name: string }
  ): Promise<VaultUpdateResult> => {
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await savePlaidFinancialData(user.id, data, institution);

      if (result.success) {
        // Refresh status after save
        await refreshStatus();
      } else {
        setError(result.error || 'Failed to save financial data');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, updated: [], error: message };
    } finally {
      setSaving(false);
    }
  }, [refreshStatus]);

  /**
   * Get auto-fill data from vault
   */
  const getAutoFillData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const data = await getFormAutoFillData(user.id);
      return data ? {
        address: data.address,
        financial: data.financial,
      } : null;
    } catch (err) {
      console.error('Error getting auto-fill data:', err);
      return null;
    }
  }, []);

  return {
    saveAddress,
    saveFinancials,
    getAutoFillData,
    vaultStatus,
    refreshStatus,
    saving,
    error,
  };
}

export default useVaultAutofill;
