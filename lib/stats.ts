import { ISSUE_STATUSES, type Issue, type IssueStatus } from "@/lib/db/schema";

export type IssueStatusCounts = Record<IssueStatus, number>;

/** Counts issues by status, from an already-loaded list of issues. */
export function countIssuesByStatus(issues: Issue[]): IssueStatusCounts {
  const counts = Object.fromEntries(
    ISSUE_STATUSES.map((status) => [status, 0])
  ) as IssueStatusCounts;

  for (const issue of issues) {
    counts[issue.status] += 1;
  }

  return counts;
}
