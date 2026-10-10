import { z } from "zod";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/db/schema";

/** Maps a field name to its list of human-readable validation messages. */
export type FieldErrors = Record<string, string[]>;

/**
 * Validates the payload for creating an issue. Status and priority are
 * optional since the database applies sensible defaults (TODO / MEDIUM). An
 * empty/whitespace-only description is normalized to undefined so it's
 * stored as null rather than an empty string.
 */
export const createIssueSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
