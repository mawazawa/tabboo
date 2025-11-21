/**
 * usePlaidLink Hook
 *
 * React hook for integrating Plaid Link into SwiftFill
 *
 * Features:
 * - Link token management
 * - Plaid Link initialization
 * - Success/error callbacks
 * - Connection state tracking
 *
 * Usage:
 * ```tsx
 * const { open, ready, loading, error } = usePlaidLink({
 *   onSuccess: (data) => {
 *     console.log('Connected:', data.institution.name);
 *   },
 *   onError: (err) => {
 *     console.error('Error:', err);
 *   },
 *   products: ['transactions', 'assets'],
 * });
 *
 * return (
 *   <Button onClick={open} disabled={!ready || loading}>
 *     Connect Bank Account
 *   </Button>
 * );
 * ```
 *
 * Sandbox Testing:
 * - Use user_good / pass_good
 * - Or user_transactions_dynamic / any password
 * - MFA code: 1234
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  createLinkToken,
  exchangePublicToken,
  type PublicTokenExchangeResponse,
} from '@/lib/plaidService';

// ============================================================================
// Types
// ============================================================================

export interface UsePlaidLinkOptions {
  /** Products to initialize (default: transactions, assets, liabilities) */
  products?: string[];
  /** Called on successful connection */
  onSuccess?: (data: PublicTokenExchangeResponse) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when user exits Link without connecting */
  onExit?: (metadata: PlaidLinkExitMetadata) => void;
  /** Called during Link events */
  onEvent?: (eventName: string, metadata: unknown) => void;
}

export interface UsePlaidLinkReturn {
  /** Open Plaid Link */
  open: () => void;
  /** Whether Plaid Link is ready to open */
  ready: boolean;
  /** Whether currently loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh link token */
  refresh: () => Promise<void>;
}

interface PlaidLinkMetadata {
  institution: {
    institution_id: string;
    name: string;
  };
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    subtype: string;
    mask: string;
  }>;
  link_session_id: string;
}

interface PlaidLinkExitMetadata {
  institution: {
    institution_id: string;
    name: string;
  } | null;
  status: string;
  link_session_id: string;
  request_id: string;
}

// Plaid Link handler type
interface PlaidLinkHandler {
  open: () => void;
  exit: (options?: { force: boolean }) => void;
  destroy: () => void;
}

// Global Plaid object
declare global {
  interface Window {
    Plaid?: {
      create: (config: {
        token: string;
        onSuccess: (publicToken: string, metadata: PlaidLinkMetadata) => void;
        onExit: (error: unknown, metadata: PlaidLinkExitMetadata) => void;
        onEvent?: (eventName: string, metadata: unknown) => void;
        onLoad?: () => void;
      }) => PlaidLinkHandler;
    };
  }
}

// ============================================================================
// Script Loading
// ============================================================================

let plaidScriptLoaded = false;
let plaidScriptLoading = false;
const scriptLoadCallbacks: Array<() => void> = [];

/**
 * Load Plaid Link script
 */
function loadPlaidScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (plaidScriptLoaded) {
      resolve();
      return;
    }

    if (plaidScriptLoading) {
      scriptLoadCallbacks.push(resolve);
      return;
    }

    plaidScriptLoading = true;

    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;

    script.onload = () => {
      plaidScriptLoaded = true;
      plaidScriptLoading = false;
      resolve();
      scriptLoadCallbacks.forEach(cb => cb());
      scriptLoadCallbacks.length = 0;
    };

    script.onerror = () => {
      plaidScriptLoading = false;
      reject(new Error('Failed to load Plaid Link script'));
    };

    document.head.appendChild(script);
  });
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function usePlaidLink(options: UsePlaidLinkOptions = {}): UsePlaidLinkReturn {
  const {
    products = ['transactions', 'assets', 'liabilities'],
    onSuccess,
    onError,
    onExit,
    onEvent,
  } = options;

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkHandler, setLinkHandler] = useState<PlaidLinkHandler | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch link token from backend
   */
  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create link token
      const response = await createLinkToken(user.id, products);
      setLinkToken(response.linkToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create link token';
      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    } finally {
      setLoading(false);
    }
  }, [products, onError]);

  /**
   * Initialize Plaid Link handler
   */
  useEffect(() => {
    if (!linkToken) return;

    let handler: PlaidLinkHandler | null = null;

    const initializePlaid = async () => {
      try {
        // Load Plaid script
        await loadPlaidScript();

        if (!window.Plaid) {
          throw new Error('Plaid not available');
        }

        // Create handler
        handler = window.Plaid.create({
          token: linkToken,

          onSuccess: async (publicToken, metadata) => {
            setLoading(true);
            try {
              // Exchange token
              const result = await exchangePublicToken(publicToken, metadata);
              onSuccess?.(result);
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to connect account';
              setError(message);
              onError?.(err instanceof Error ? err : new Error(message));
            } finally {
              setLoading(false);
            }
          },

          onExit: (err, metadata) => {
            if (err) {
              console.error('Plaid Link error:', err);
            }
            onExit?.(metadata);
          },

          onEvent: (eventName, metadata) => {
            onEvent?.(eventName, metadata);
          },

          onLoad: () => {
            setReady(true);
          },
        });

        setLinkHandler(handler);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize Plaid Link';
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    };

    initializePlaid();

    // Cleanup
    return () => {
      if (handler) {
        handler.destroy();
      }
      setLinkHandler(null);
      setReady(false);
    };
  }, [linkToken, onSuccess, onError, onExit, onEvent]);

  /**
   * Fetch link token on mount
   */
  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  /**
   * Open Plaid Link
   */
  const open = useCallback(() => {
    if (linkHandler && ready) {
      linkHandler.open();
    } else {
      console.warn('Plaid Link not ready');
    }
  }, [linkHandler, ready]);

  /**
   * Refresh link token
   */
  const refresh = useCallback(async () => {
    if (linkHandler) {
      linkHandler.destroy();
      setLinkHandler(null);
      setReady(false);
    }
    await fetchLinkToken();
  }, [linkHandler, fetchLinkToken]);

  return {
    open,
    ready,
    loading,
    error,
    refresh,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default usePlaidLink;
