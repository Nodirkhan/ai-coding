import { Badge } from "@/components/ui/badge";
import type { IssuePriority } from "@/lib/db/schema";

const PRIORITY_VARIANTS: Record<IssuePriority, "neutral" | "amber" | "red"> = {
  LOW: "neutral",
  MEDIUM: "amber",
  HIGH: "red",
};

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge variant={PRIORITY_VARIANTS[priority]}>{priority}</Badge>;
}
