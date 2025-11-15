import { CloudOff, Cloud, RefreshCw } from "@/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const OfflineIndicator = () => {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
        {!isOnline ? (
          <>
            <CloudOff className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">Offline Mode</span>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount} pending
              </Badge>
            )}
          </>
        ) : (
          <>
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {isSyncing ? 'Syncing...' : 'Online'}
            </span>
            {pendingCount > 0 && (
              <>
                <Badge variant="secondary" className="ml-2">
                  {pendingCount} pending
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={syncNow}
                      disabled={isSyncing}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync now</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </>
        )}
      </div>
  );
};
