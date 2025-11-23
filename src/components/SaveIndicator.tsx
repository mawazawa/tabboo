/**
 * Save Indicator Component
 *
 * Shows a visual indicator when form data is saved.
 * Important for SRL users to reduce anxiety about data loss.
 *
 * "Every second of waiting is an opportunity to reassure, educate, or entertain your users."
 */

import { useState, useEffect } from 'react';
import { Check, Cloud, CloudOff, Loader2 } from '@/icons';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
  isOnline?: boolean;
  className?: string;
}

export function SaveIndicator({
  lastSaved,
  isSaving,
  isOnline = true,
  className,
}: SaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago every 10 seconds
  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (seconds < 10) {
        setTimeAgo('just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (!isOnline) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <CloudOff className="h-3.5 w-3.5" />
        <span>Offline - changes saved locally</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs text-muted-foreground',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs text-muted-foreground',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
        <span>
          Saved <span className="font-medium">{timeAgo}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
      role="status"
    >
      <Cloud className="h-3.5 w-3.5" />
      <span>Auto-save enabled</span>
    </div>
  );
}
