import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OnlineStatusBadgeProps {
  isOnline: boolean;
  isSyncing?: boolean;
}

export function OnlineStatusBadge({ isOnline, isSyncing }: OnlineStatusBadgeProps) {
  if (isSyncing) {
    return (
      <Badge variant="outline" className="gap-1 border-primary/50 text-primary">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Sincronizzazione...
      </Badge>
    );
  }

  if (!isOnline) {
    return (
      <Badge variant="outline" className="gap-1 border-warning/50 text-warning">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 border-success/50 text-success">
      <Wifi className="h-3 w-3" />
      Online
    </Badge>
  );
}
