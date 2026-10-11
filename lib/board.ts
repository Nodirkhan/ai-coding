import {
  ISSUE_STATUSES,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/db/schema";

export type BoardColumns = Record<IssueStatus, Issue[]>;

export type DropResult = {
  issueId: number;
  status: IssueStatus;
  previousStatus: IssueStatus;
};

const PRIORITY_RANK: Record<IssuePriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

function compareForBoard(a: Issue, b: Issue): number {
  const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (byPriority !== 0) return byPriority;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return b.id - a.id;
}

/**
 * Groups issues into one column per status (empty columns included), each
 * sorted by priority (high first) and then newest first.
 */
export function groupIssuesByStatus(issues: Issue[]): BoardColumns {
  const columns = Object.fromEntries(
    ISSUE_STATUSES.map((status) => [status, [] as Issue[]])
  ) as BoardColumns;

  for (const issue of issues) {
    columns[issue.status].push(issue);
  }
  for (const status of ISSUE_STATUSES) {
    columns[status].sort(compareForBoard);
  }

  return columns;
}

export function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === "string" &&
    (ISSUE_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Works out what a drop should change. Returns `null` when nothing should
 * happen: no target, an invalid target, an unknown issue, or the issue was
 * dropped on the column it already belongs to.
 */
export function resolveDrop(
  issues: Issue[],
  issueId: number,
  targetStatus: unknown
): DropResult | null {
  if (!isIssueStatus(targetStatus)) return null;

  const issue = issues.find((candidate) => candidate.id === issueId);
  if (!issue || issue.status === targetStatus) return null;

  return { issueId, status: targetStatus, previousStatus: issue.status };
}
