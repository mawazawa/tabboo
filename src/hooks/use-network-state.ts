/**
 * Network State Hook
 *
 * Detects online/offline status with real-time updates.
 * Essential for auto-save indicator and offline sync.
 *
 * Research: November 2025 best practice - uses navigator.onLine + event listeners
 * for reliable detection across all browsers.
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect online/offline network status
 * @returns boolean - true if online, false if offline
 */
export function useNetworkState(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler for going online
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handler for going offline
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
