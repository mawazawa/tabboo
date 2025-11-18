import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { prefetchUserData } from '@/utils/dataPrefetcher';
import { preloadCriticalRoutes } from '@/utils/routePreloader';
import type { User } from '@supabase/supabase-js';
import type { FormData, FieldPositions, ValidationRules } from '@/types/FormData';

interface LegalDocument {
  id: string;
  title: string;
  content: unknown;
  metadata: unknown;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface LegalDocumentMetadata {
  fieldPositions?: FieldPositions;
  validationRules?: ValidationRules;
}

interface UseDocumentPersistenceProps {
  formData: FormData;
  fieldPositions: FieldPositions;
  validationRules: ValidationRules;
  hasUnsavedChanges: React.MutableRefObject<boolean>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setFieldPositions: React.Dispatch<React.SetStateAction<FieldPositions>>;
  setValidationRules: React.Dispatch<React.SetStateAction<ValidationRules>>;
  setVaultSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseDocumentPersistenceReturn {
  user: User | null;
  loading: boolean;
  documentId: string | null;
  handleLogout: () => Promise<void>;
}

export function useDocumentPersistence({
  formData,
  fieldPositions,
  validationRules,
  hasUnsavedChanges,
  setFormData,
  setFieldPositions,
  setValidationRules,
  setVaultSheetOpen,
}: UseDocumentPersistenceProps): UseDocumentPersistenceReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Check authentication and prefetch data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        // Prefetch user data immediately for faster perceived performance
        prefetchUserData(queryClient, session.user);
        // Preload critical routes when idle
        preloadCriticalRoutes();
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        // Prefetch user data on auth state change
        prefetchUserData(queryClient, session.user);
        // Preload critical routes when idle
        preloadCriticalRoutes();
      } else {
        navigate("/auth");
      }
    });

    // Listen for vault sheet open event from command palette
    const handleOpenVaultSheet = () => {
      setVaultSheetOpen(true);
    };
    window.addEventListener('open-vault-sheet', handleOpenVaultSheet);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('open-vault-sheet', handleOpenVaultSheet);
    };
  }, [navigate, queryClient, setVaultSheetOpen]);

  // Load existing data when user is authenticated (use cached data if available)
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Try to get cached data first
      const cachedData = queryClient.getQueryData<LegalDocument>(['legal-document', user.id, 'FL-320 Form']);

      if (cachedData) {
        setDocumentId(cachedData.id);
        setFormData((cachedData.content as FormData) || {});
        const metadata = cachedData.metadata as LegalDocumentMetadata | null;
        setFieldPositions(metadata?.fieldPositions || {});
        setValidationRules(metadata?.validationRules || {});
        return;
      }

      // If not cached, fetch from database
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', 'FL-320 Form')
        .maybeSingle();

      if (data) {
        setDocumentId(data.id);
        setFormData((data.content as FormData) || {});
        const metadata = data.metadata as LegalDocumentMetadata | null;
        setFieldPositions(metadata?.fieldPositions || {});
        setValidationRules(metadata?.validationRules || {});
      } else if (!error) {
        // Create new document
        const { data: newDoc } = await supabase
          .from('legal_documents')
          .insert({
            title: 'FL-320 Form',
            content: {},
            metadata: { fieldPositions: {}, validationRules: {} },
            user_id: user.id
          })
          .select()
          .maybeSingle();

        if (newDoc) setDocumentId(newDoc.id);
      }
    };

    loadData();
  }, [user, queryClient, setFormData, setFieldPositions, setValidationRules]);

  // Autosave every 5 seconds
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      if (!documentId || !hasUnsavedChanges.current) return;

      const { error } = await supabase
        .from('legal_documents')
        .update({
          content: formData,
          metadata: { fieldPositions, validationRules },
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (!error) {
        hasUnsavedChanges.current = false;
      }
    };

    const interval = setInterval(saveData, 5000);
    return () => clearInterval(interval);
  }, [formData, fieldPositions, validationRules, documentId, user, hasUnsavedChanges]);

  // Warn user before leaving with unsaved changes (prevents data loss)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = ''; // Modern browsers show generic "Leave site?" message
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return {
    user,
    loading,
    documentId,
    handleLogout,
  };
}
