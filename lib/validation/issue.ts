import { z } from "zod";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/db/schema";

/** Maps a field name to its list of human-readable validation messages. */
export type FieldErrors = Record<string, string[]>;

const titleSchema = z.string().trim().min(1, "Title is required");
const descriptionSchema = z
  .string()
  .trim()
  .transform((value) => (value ? value : undefined));

/**
 * Validates the payload for creating an issue. Status and priority are
 * optional since the database applies sensible defaults (TODO / MEDIUM). An
 * empty/whitespace-only description is normalized to undefined so it's
 * stored as null rather than an empty string.
 */
export const createIssueSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
});

/**
 * Validates issue updates. Every field is optional so callers can update only
 * the fields they need. Blank descriptions are normalized to `null`, which
 * clears the existing description.
 */
export const updateIssueSchema = z.object({
  title: titleSchema.optional(),
  description: z
    .string()
    .trim()
    .transform((value) => (value ? value : null))
    .optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
