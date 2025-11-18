/**
 * EmptyDocumentState
 *
 * Empty state message shown when no documents are uploaded.
 *
 * Single Responsibility: Display empty state UI
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from '@/icons';

export const EmptyDocumentState = () => {
  return (
    <Alert>
      <Sparkles className="h-4 w-4" strokeWidth={1.5} />
      <AlertDescription className="text-xs">
        Upload your first document to unlock smart auto-fill. Each document helps build your personal data vault.
      </AlertDescription>
    </Alert>
  );
};
