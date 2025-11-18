import { useQuery } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { PersonalVaultData } from '@/utils/vaultFieldMatcher';
import { getAutofillableFields } from '@/utils/vaultFieldMatcher';

interface UseVaultDataReturn {
  vaultData: PersonalVaultData | null;
  isVaultLoading: boolean;
  autofillableCount: number;
  hasVaultData: boolean;
}

/**
 * Fetches and manages user's personal vault data
 */
export function useVaultData(user: User | null): UseVaultDataReturn {
  // Fetch vault data for AI Assistant context
  const { data: vaultData, isLoading: isVaultLoading } = useQuery({
    queryKey: ['vault-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // Error occurred fetching vault data (silently handled)
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: true,
  });

  const typedVaultData = (vaultData as PersonalVaultData | null) ?? null;
  const autofillableCount = typedVaultData ? getAutofillableFields(typedVaultData).length : 0;
  const hasVaultData = Boolean(typedVaultData);

  return {
    vaultData: typedVaultData,
    isVaultLoading,
    autofillableCount,
    hasVaultData,
  };
}
