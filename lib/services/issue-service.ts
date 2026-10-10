import { desc, eq } from "drizzle-orm";
import { db as defaultDb } from "@/lib/db/client";
import type { AppDatabase } from "@/lib/db/connection";
import { issues, type Issue } from "@/lib/db/schema";
import { createIssueSchema, type FieldErrors } from "@/lib/validation/issue";

/**
 * Thrown when input fails validation. `fieldErrors` maps a field name to its
 * list of human-readable error messages, ready to send back to the client.
 */
export class ValidationError extends Error {
  constructor(public readonly fieldErrors: FieldErrors) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

/** Returns every issue, most recently created first. */
export function getIssues(database: AppDatabase = defaultDb): Issue[] {
  return database.select().from(issues).orderBy(desc(issues.id)).all();
}

/** Returns the issue with the given id, or `undefined` if none exists. */
export function getIssueById(
  id: number,
  database: AppDatabase = defaultDb
): Issue | undefined {
  return database.select().from(issues).where(eq(issues.id, id)).get();
}

/** Deletes the issue with the given id, returning `true` when a row changed. */
export function deleteIssue(
  id: number,
  database: AppDatabase = defaultDb
): boolean {
  const result = database.delete(issues).where(eq(issues.id, id)).run();
  return result.changes > 0;
}

/**
 * Validates and persists a new issue. Throws {@link ValidationError} when
 * `input` fails validation.
 */
export function createIssue(
  input: unknown,
  database: AppDatabase = defaultDb
): Issue {
  const result = createIssueSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors);
  }

  return database.insert(issues).values(result.data).returning().get();
}
