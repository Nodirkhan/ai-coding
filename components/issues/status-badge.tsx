import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/lib/db/schema";

export const STATUS_LABELS: Record<IssueStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const STATUS_VARIANTS: Record<IssueStatus, "neutral" | "blue" | "green"> = {
  TODO: "neutral",
  IN_PROGRESS: "blue",
  DONE: "green",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
