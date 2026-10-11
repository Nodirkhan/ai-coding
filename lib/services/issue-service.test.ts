import { beforeEach, describe, expect, it } from "vitest";
import { issues } from "@/lib/db/schema";
import { createTestDatabase } from "@/lib/db/test-helper";
import {
  createIssue,
  deleteIssue,
  getIssueById,
  getIssues,
  updateIssue,
  ValidationError,
} from "./issue-service";

describe("issue service", () => {
  let testDb: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    testDb = createTestDatabase();
  });

  it("creates an issue with only a title and applies defaults", () => {
    const issue = createIssue({ title: "Fix login bug" }, testDb.db);

    expect(issue.id).toBeTypeOf("number");
    expect(issue.title).toBe("Fix login bug");
    expect(issue.description).toBeNull();
    expect(issue.status).toBe("TODO");
    expect(issue.priority).toBe("MEDIUM");
    expect(issue.createdAt).toBeTypeOf("string");
    expect(issue.updatedAt).toBeTypeOf("string");
  });

  it("creates an issue with all fields supplied", () => {
    const issue = createIssue(
      {
        title: "Write docs",
        description: "Document the API",
        status: "IN_PROGRESS",
        priority: "HIGH",
      },
      testDb.db
    );

    expect(issue.description).toBe("Document the API");
    expect(issue.status).toBe("IN_PROGRESS");
    expect(issue.priority).toBe("HIGH");
  });

  it("rejects a missing title with a ValidationError", () => {
    expect(() => createIssue({ title: "" }, testDb.db)).toThrow(
      ValidationError
    );
  });

  it("rejects an invalid status value", () => {
    expect(() =>
      createIssue({ title: "Valid title", status: "NOT_A_STATUS" }, testDb.db)
    ).toThrow(ValidationError);
  });

  it("rejects an invalid priority value", () => {
    expect(() =>
      createIssue(
        { title: "Valid title", priority: "NOT_A_PRIORITY" },
        testDb.db
      )
    ).toThrow(ValidationError);
  });

  it("stores an empty description as null, not an empty string", () => {
    const issue = createIssue(
      { title: "Valid title", description: "" },
      testDb.db
    );

    expect(issue.description).toBeNull();
  });

  it("lists issues ordered newest first", () => {
    createIssue({ title: "First" }, testDb.db);
    createIssue({ title: "Second" }, testDb.db);

    const issues = getIssues(testDb.db);

    expect(issues).toHaveLength(2);
    expect(issues[0].title).toBe("Second");
    expect(issues[1].title).toBe("First");
  });

  it("returns an empty list when there are no issues", () => {
    expect(getIssues(testDb.db)).toEqual([]);
  });

  it("fetches an existing issue by id", () => {
    const created = createIssue({ title: "Find me" }, testDb.db);

    const found = getIssueById(created.id, testDb.db);

    expect(found).toEqual(created);
  });

  it("returns undefined when the issue does not exist", () => {
    expect(getIssueById(999, testDb.db)).toBeUndefined();
  });

  it("deletes an existing issue", () => {
    const created = createIssue({ title: "Delete me" }, testDb.db);

    const deleted = deleteIssue(created.id, testDb.db);

    expect(deleted).toBe(true);
    expect(getIssueById(created.id, testDb.db)).toBeUndefined();
  });

  it("returns false when deleting a missing issue", () => {
    expect(deleteIssue(999, testDb.db)).toBe(false);
  });

  it("updates an existing issue and refreshes updatedAt", () => {
    const original = testDb.db
      .insert(issues)
      .values({
        title: "Original title",
        description: "Original description",
        status: "TODO",
        priority: "LOW",
        createdAt: "2024-01-01 00:00:00",
        updatedAt: "2024-01-01 00:00:00",
      })
      .returning()
      .get();

    const updated = updateIssue(
      original.id,
      {
        title: "Updated title",
        description: "",
        status: "DONE",
        priority: "HIGH",
      },
      testDb.db
    );

    expect(updated).toBeDefined();
    expect(updated).toMatchObject({
      id: original.id,
      title: "Updated title",
      description: null,
      status: "DONE",
      priority: "HIGH",
      createdAt: "2024-01-01 00:00:00",
    });
    expect(updated!.updatedAt).not.toBe(original.updatedAt);
    expect(updated!.updatedAt >= updated!.createdAt).toBe(true);
    expect(getIssueById(original.id, testDb.db)).toEqual(updated);
  });

  it("updates only the status when given a status-only payload", () => {
    const created = createIssue(
      { title: "Keep me", description: "Keep this too", priority: "HIGH" },
      testDb.db
    );

    const updated = updateIssue(created.id, { status: "DONE" }, testDb.db);

    expect(updated).toMatchObject({
      id: created.id,
      title: "Keep me",
      description: "Keep this too",
      priority: "HIGH",
      status: "DONE",
    });
  });

  it("rejects invalid updates with a ValidationError", () => {
    const created = createIssue({ title: "Valid title" }, testDb.db);

    expect(() =>
      updateIssue(created.id, { title: "   ", status: "NOT_A_STATUS" }, testDb.db)
    ).toThrow(ValidationError);
  });

  it("returns undefined when updating a missing issue", () => {
    expect(updateIssue(999, { title: "Missing" }, testDb.db)).toBeUndefined();
  });
});
