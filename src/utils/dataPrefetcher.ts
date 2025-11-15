import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Prefetch user-related data to reduce perceived load times
 * This runs as soon as authentication is confirmed
 */
export const prefetchUserData = async (queryClient: QueryClient, user: User) => {
  // Prefetch vault data
  queryClient.prefetchQuery({
    queryKey: ['vault-data', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error prefetching vault data:', error);
        return null;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  // Prefetch document data
  queryClient.prefetchQuery({
    queryKey: ['legal-document', user.id, 'FL-320 Form'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', 'FL-320 Form')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error prefetching document:', error);
        return null;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
