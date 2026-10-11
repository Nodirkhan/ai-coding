"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IssueStats } from "@/components/issues/issue-stats";
import { PriorityBadge } from "@/components/issues/priority-badge";
import { StatusBadge, STATUS_LABELS } from "@/components/issues/status-badge";
import { useIssues } from "@/components/issues/use-issues";
import {
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { countIssuesByStatus } from "@/lib/stats";
import {
  filterAndSortIssues,
  type SortKey,
  type SortState,
} from "@/lib/work-items-table";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "updatedAt", label: "Updated" },
];

const CONTROL_CLASSES =
  "rounded-sm border border-zinc-300 bg-white px-2 py-1.5 text-sm";

export function WorkItemsTable() {
  const router = useRouter();
  const { issues, loadState, retry } = useIssues();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IssueStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<IssuePriority | "ALL">("ALL");
  const [sort, setSort] = useState<SortState>({
    key: "updatedAt",
    direction: "desc",
  });

  const rows = useMemo(
    () => filterAndSortIssues(issues, { search, status, priority }, sort),
    [issues, search, status, priority, sort]
  );

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-zinc-900">Work Items</h1>

      {loadState === "loading" && (
        <p role="status" aria-live="polite" className="text-sm text-zinc-500">
          Loading work items…
        </p>
      )}

      {loadState === "error" && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>Could not load work items. Please try again.</span>
          <button type="button" onClick={retry} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {loadState === "ready" && (
        <>
          <IssueStats counts={countIssuesByStatus(issues)} />

          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles"
              aria-label="Search titles"
              className={`${CONTROL_CLASSES} w-full sm:w-64`}
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as IssueStatus | "ALL")
              }
              aria-label="Filter by status"
              className={CONTROL_CLASSES}
            >
              <option value="ALL">All statuses</option>
              {ISSUE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as IssuePriority | "ALL")
              }
              aria-label="Filter by priority"
              className={CONTROL_CLASSES}
            >
              <option value="ALL">All priorities</option>
              {ISSUE_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-sm border border-zinc-200 bg-white">
            <table className="w-full min-w-xl border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-600">
                <tr>
                  {COLUMNS.map((column) => {
                    const active = sort.key === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={
                          active
                            ? sort.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        className="border-b border-zinc-200 px-3 py-2 font-semibold"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className="flex items-center gap-1 hover:text-zinc-900"
                        >
                          {column.label}
                          <span aria-hidden="true">
                            {active ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={(event) => {
                      if (!(event.target as HTMLElement).closest("a")) {
                        router.push(`/issues/${issue.id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-blue-50"
                  >
                    <td className="px-3 py-2 text-zinc-500">{issue.id}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="font-medium text-[#0078d4] hover:underline"
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-3 py-2">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="px-3 py-2 text-zinc-500">
                      {formatDate(issue.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="p-6 text-center text-sm text-zinc-500">
                {issues.length === 0
                  ? "No work items yet. Create your first work item to get started."
                  : "No work items match your filters."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
