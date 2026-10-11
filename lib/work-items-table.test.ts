import { describe, expect, it } from "vitest";
import type { Issue } from "@/lib/db/schema";
import { filterAndSortIssues } from "./work-items-table";

function makeIssue(overrides: Partial<Issue> & { id: number }): Issue {
  return {
    title: `Issue ${overrides.id}`,
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    createdAt: "2024-01-01 00:00:00",
    updatedAt: "2024-01-01 00:00:00",
    ...overrides,
  };
}

const noFilters = { search: "", status: "ALL", priority: "ALL" } as const;

describe("filterAndSortIssues", () => {
  const issues = [
    makeIssue({ id: 1, title: "Fix login", status: "TODO", priority: "HIGH" }),
    makeIssue({
      id: 2,
      title: "Write docs",
      status: "DONE",
      priority: "LOW",
      updatedAt: "2024-05-01 00:00:00",
    }),
    makeIssue({
      id: 3,
      title: "Login page polish",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
    }),
  ];

  it("returns everything with no filters", () => {
    expect(
      filterAndSortIssues(issues, noFilters, { key: "id", direction: "asc" })
    ).toHaveLength(3);
  });

  it("searches titles case-insensitively", () => {
    const result = filterAndSortIssues(
      issues,
      { ...noFilters, search: "LOGIN" },
      { key: "id", direction: "asc" }
    );
    expect(result.map((issue) => issue.id)).toEqual([1, 3]);
  });

  it("combines status, priority and search filters", () => {
    const result = filterAndSortIssues(
      issues,
      { search: "login", status: "TODO", priority: "HIGH" },
      { key: "id", direction: "asc" }
    );
    expect(result.map((issue) => issue.id)).toEqual([1]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(
      filterAndSortIssues(
        issues,
        { ...noFilters, search: "zzz" },
        { key: "id", direction: "asc" }
      )
    ).toEqual([]);
  });

  it("sorts by id in both directions", () => {
    const asc = filterAndSortIssues(issues, noFilters, {
      key: "id",
      direction: "asc",
    });
    const desc = filterAndSortIssues(issues, noFilters, {
      key: "id",
      direction: "desc",
    });
    expect(asc.map((issue) => issue.id)).toEqual([1, 2, 3]);
    expect(desc.map((issue) => issue.id)).toEqual([3, 2, 1]);
  });

  it("sorts priority by importance, not alphabetically", () => {
    const result = filterAndSortIssues(issues, noFilters, {
      key: "priority",
      direction: "desc",
    });
    expect(result.map((issue) => issue.priority)).toEqual([
      "HIGH",
      "MEDIUM",
      "LOW",
    ]);
  });

  it("sorts status in workflow order", () => {
    const result = filterAndSortIssues(issues, noFilters, {
      key: "status",
      direction: "asc",
    });
    expect(result.map((issue) => issue.status)).toEqual([
      "TODO",
      "IN_PROGRESS",
      "DONE",
    ]);
  });

  it("sorts by title and by updated date", () => {
    const byTitle = filterAndSortIssues(issues, noFilters, {
      key: "title",
      direction: "asc",
    });
    expect(byTitle.map((issue) => issue.id)).toEqual([1, 3, 2]);

    const byUpdated = filterAndSortIssues(issues, noFilters, {
      key: "updatedAt",
      direction: "desc",
    });
    expect(byUpdated[0].id).toBe(2);
  });

  it("does not mutate the input array", () => {
    const input = [...issues];
    filterAndSortIssues(input, noFilters, { key: "id", direction: "desc" });
    expect(input.map((issue) => issue.id)).toEqual([1, 2, 3]);
  });
});
