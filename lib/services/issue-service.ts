import { desc, eq, sql } from "drizzle-orm";
import { db as defaultDb } from "@/lib/db/client";
import type { AppDatabase } from "@/lib/db/connection";
import { issues, type Issue } from "@/lib/db/schema";
import {
  createIssueSchema,
  updateIssueSchema,
  type FieldErrors,
} from "@/lib/validation/issue";

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

/**
 * Validates and updates an existing issue. Returns `undefined` when no issue
 * exists for the given id, and throws {@link ValidationError} when `input`
 * fails validation.
 */
export function updateIssue(
  id: number,
  input: unknown,
  database: AppDatabase = defaultDb
): Issue | undefined {
  const result = updateIssueSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors);
  }

  return database
    .update(issues)
    .set({
      ...result.data,
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(issues.id, id))
    .returning()
    .get();
}
