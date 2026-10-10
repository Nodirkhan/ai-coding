import { describe, expect, it } from "vitest";
import { countIssuesByStatus } from "@/lib/stats";
import type { Issue } from "@/lib/db/schema";

function makeIssue(status: Issue["status"]): Issue {
  return {
    id: 1,
    title: "Example",
    description: null,
    status,
    priority: "MEDIUM",
    createdAt: "2024-01-01 00:00:00",
    updatedAt: "2024-01-01 00:00:00",
  };
}

describe("countIssuesByStatus", () => {
  it("returns zero counts for an empty list", () => {
    expect(countIssuesByStatus([])).toEqual({
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    });
  });

  it("counts issues by status", () => {
    const issues = [
      makeIssue("TODO"),
      makeIssue("TODO"),
      makeIssue("IN_PROGRESS"),
      makeIssue("DONE"),
      makeIssue("DONE"),
      makeIssue("DONE"),
    ];

    expect(countIssuesByStatus(issues)).toEqual({
      TODO: 2,
      IN_PROGRESS: 1,
      DONE: 3,
    });
  });
});
