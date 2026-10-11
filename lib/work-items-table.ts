import {
  ISSUE_STATUSES,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/db/schema";

export type SortKey = "id" | "title" | "status" | "priority" | "updatedAt";
export type SortDirection = "asc" | "desc";
export type SortState = { key: SortKey; direction: SortDirection };

export type TableFilters = {
  search: string;
  status: IssueStatus | "ALL";
  priority: IssuePriority | "ALL";
};

const PRIORITY_IMPORTANCE: Record<IssuePriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

function compareBy(key: SortKey, a: Issue, b: Issue): number {
  switch (key) {
    case "id":
      return a.id - b.id;
    case "title":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "status":
      return ISSUE_STATUSES.indexOf(a.status) - ISSUE_STATUSES.indexOf(b.status);
    case "priority":
      return PRIORITY_IMPORTANCE[a.priority] - PRIORITY_IMPORTANCE[b.priority];
    case "updatedAt":
      return a.updatedAt < b.updatedAt ? -1 : a.updatedAt > b.updatedAt ? 1 : 0;
  }
}

/**
 * Applies the table's title search and status/priority filters, then sorts.
 * Priority sorts by importance and status by workflow order, not by text.
 */
export function filterAndSortIssues(
  issues: Issue[],
  filters: TableFilters,
  sort: SortState
): Issue[] {
  const needle = filters.search.trim().toLowerCase();
  const sign = sort.direction === "asc" ? 1 : -1;

  return issues
    .filter(
      (issue) =>
        (!needle || issue.title.toLowerCase().includes(needle)) &&
        (filters.status === "ALL" || issue.status === filters.status) &&
        (filters.priority === "ALL" || issue.priority === filters.priority)
    )
    .sort((a, b) => sign * compareBy(sort.key, a, b) || b.id - a.id);
}
