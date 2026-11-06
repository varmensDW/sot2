import { Badge } from "@/components/ui/badge";
import { actionLabels, type ActionKind } from "@/lib/types";

export function IssueBadge({ action }: { action: ActionKind }) {
  return <Badge variant="secondary" className={`issue-badge issue-${action}`}><span className="status-dot"/>{actionLabels[action]}</Badge>;
}
