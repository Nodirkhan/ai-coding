import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, check } from "drizzle-orm/sqlite-core";

/**
 * Status and priority are stored as text and constrained with a CHECK clause,
 * since SQLite has no native enum type.
 */
export const ISSUE_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const ISSUE_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export const issues = sqliteTable(
  "issues",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status")
      .notNull()
      .default("TODO")
      .$type<IssueStatus>(),
    priority: text("priority")
      .notNull()
      .default("MEDIUM")
      .$type<IssuePriority>(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    check(
      "issues_status_check",
      sql`${table.status} in ('TODO', 'IN_PROGRESS', 'DONE')`
    ),
    check(
      "issues_priority_check",
      sql`${table.priority} in ('LOW', 'MEDIUM', 'HIGH')`
    ),
    check("issues_title_not_blank_check", sql`trim(${table.title}) != ''`),
  ]
);

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
