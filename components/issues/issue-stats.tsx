import { ISSUE_STATUSES } from "@/lib/db/schema";
import { STATUS_LABELS } from "./status-badge";
import type { IssueStatusCounts } from "@/lib/stats";

type IssueStatsProps = {
  counts: IssueStatusCounts;
};

/** Shows the number of issues in each status, computed from the issue list. */
export function IssueStats({ counts }: IssueStatsProps) {
  return (
    <dl className="grid grid-cols-3 gap-3">
      {ISSUE_STATUSES.map((status) => (
        <div
          key={status}
          className="rounded-md border border-zinc-200 p-4 text-center"
        >
          <dt className="text-xs font-medium text-zinc-500">
            {STATUS_LABELS[status]}
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-zinc-900">
            {counts[status]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
