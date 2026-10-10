import type { Issue } from "@/lib/db/schema";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";

function formatCreatedDate(createdAt: string): string {
  // SQLite's current_timestamp is UTC but has no timezone suffix; add one so
  // the browser renders it in the viewer's local time instead of treating it
  // as local already.
  const date = new Date(`${createdAt.replace(" ", "T")}Z`);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type IssueListProps = {
  issues: Issue[];
};

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
        No issues yet. Create your first issue to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className="flex flex-wrap items-center justify-between gap-3 p-4"
        >
          <div>
            <p className="font-medium text-zinc-900">{issue.title}</p>
            <p className="text-xs text-zinc-500">
              Created {formatCreatedDate(issue.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
        </li>
      ))}
    </ul>
  );
}
