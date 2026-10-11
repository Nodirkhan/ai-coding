import { describe, expect, it } from "vitest";
import type { Issue } from "@/lib/db/schema";
import { groupIssuesByStatus, resolveDrop } from "./board";

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

describe("groupIssuesByStatus", () => {
  it("returns all three columns even when there are no issues", () => {
    expect(groupIssuesByStatus([])).toEqual({
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    });
  });

  it("groups issues by their status", () => {
    const todo = makeIssue({ id: 1, status: "TODO" });
    const active = makeIssue({ id: 2, status: "IN_PROGRESS" });
    const done = makeIssue({ id: 3, status: "DONE" });

    const columns = groupIssuesByStatus([done, todo, active]);

    expect(columns.TODO).toEqual([todo]);
    expect(columns.IN_PROGRESS).toEqual([active]);
    expect(columns.DONE).toEqual([done]);
  });

  it("sorts each column by priority, then newest first", () => {
    const lowNew = makeIssue({
      id: 1,
      priority: "LOW",
      createdAt: "2024-03-01 00:00:00",
    });
    const highOld = makeIssue({
      id: 2,
      priority: "HIGH",
      createdAt: "2024-01-01 00:00:00",
    });
    const highNew = makeIssue({
      id: 3,
      priority: "HIGH",
      createdAt: "2024-02-01 00:00:00",
    });
    const medium = makeIssue({ id: 4, priority: "MEDIUM" });

    const columns = groupIssuesByStatus([lowNew, highOld, medium, highNew]);

    expect(columns.TODO.map((issue) => issue.id)).toEqual([3, 2, 4, 1]);
  });

  it("breaks creation-time ties with the higher id first", () => {
    const first = makeIssue({ id: 1 });
    const second = makeIssue({ id: 2 });

    expect(groupIssuesByStatus([first, second]).TODO.map((i) => i.id)).toEqual([
      2, 1,
    ]);
  });

  it("does not mutate the input array", () => {
    const input = [
      makeIssue({ id: 1, priority: "LOW" }),
      makeIssue({ id: 2, priority: "HIGH" }),
    ];
    groupIssuesByStatus(input);
    expect(input.map((issue) => issue.id)).toEqual([1, 2]);
  });
});

describe("resolveDrop", () => {
  const issues = [
    makeIssue({ id: 1, status: "TODO" }),
    makeIssue({ id: 2, status: "IN_PROGRESS" }),
  ];

  it("returns the target status when dropped on a different column", () => {
    expect(resolveDrop(issues, 1, "DONE")).toEqual({
      issueId: 1,
      status: "DONE",
      previousStatus: "TODO",
    });
  });

  it("is a no-op when dropped on the same column", () => {
    expect(resolveDrop(issues, 2, "IN_PROGRESS")).toBeNull();
  });

  it("is a no-op when there is no drop target", () => {
    expect(resolveDrop(issues, 1, null)).toBeNull();
  });

  it("is a no-op when the target is not a valid status", () => {
    expect(resolveDrop(issues, 1, "ARCHIVED")).toBeNull();
  });

  it("is a no-op when the dragged issue does not exist", () => {
    expect(resolveDrop(issues, 99, "DONE")).toBeNull();
  });
});
