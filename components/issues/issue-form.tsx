"use client";

import { useState, type FormEvent } from "react";
import {
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/db/schema";
import type { FieldErrors } from "@/lib/validation/issue";
import { STATUS_LABELS } from "./status-badge";

type IssueFormProps = {
  issue?: Issue;
  onSuccess: (issue: Issue) => void;
  onCancel?: () => void;
};

/** Creates or updates an issue via the matching API route. */
export function IssueForm({ issue, onSuccess, onCancel }: IssueFormProps) {
  const isEditing = Boolean(issue);
  const [title, setTitle] = useState(issue?.title ?? "");
  const [description, setDescription] = useState(issue?.description ?? "");
  const [status, setStatus] = useState<IssueStatus>(issue?.status ?? "TODO");
  const [priority, setPriority] = useState<IssuePriority>(
    issue?.priority ?? "MEDIUM"
  );
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await fetch(
        issue ? `/api/issues/${issue.id}` : "/api/issues",
        {
          method: issue ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, status, priority }),
        }
      );

      if (response.ok) {
        const savedIssue: Issue = await response.json();
        if (!isEditing) {
          setTitle("");
          setDescription("");
          setStatus("TODO");
          setPriority("MEDIUM");
        }
        onSuccess(savedIssue);
        return;
      }

      if (response.status === 400) {
        const body = await response.json();
        setFieldErrors(body.fieldErrors ?? {});
        setFormError(body.error ?? "Please fix the errors below.");
        return;
      }

      if (response.status === 404) {
        setFormError("This work item no longer exists.");
        return;
      }

      setFormError("Something went wrong. Please try again.");
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={submitting}
      className="flex flex-col gap-4 rounded-sm border border-zinc-200 p-4"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-sm border border-zinc-300 px-3 py-2 text-sm"
          required
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
        {fieldErrors.title && (
          <div id="title-error" role="alert">
            {fieldErrors.title.map((message) => (
              <p key={message} className="text-xs text-red-600">
                {message}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-sm border border-zinc-300 px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="status"
            className="text-sm font-medium text-zinc-700"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as IssueStatus)
            }
            className="rounded-sm border border-zinc-300 px-3 py-2 text-sm"
          >
            {ISSUE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="priority"
            className="text-sm font-medium text-zinc-700"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as IssuePriority)
            }
            className="rounded-sm border border-zinc-300 px-3 py-2 text-sm"
          >
            {ISSUE_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-sm bg-[#0078d4] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create work item"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-sm font-medium text-zinc-600 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
