"use client";

import { useState, type FormEvent } from "react";
import {
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/db/schema";
import type { FieldErrors } from "@/lib/validation/issue";

type IssueFormProps = {
  onCreated: () => void;
};

/** A create-issue form. POSTs to /api/issues and reports success upward. */
export function IssueForm({ onCreated }: IssueFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("TODO");
  const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, priority }),
      });

      if (response.status === 201) {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("MEDIUM");
        onCreated();
        return;
      }

      if (response.status === 400) {
        const body = await response.json();
        setFieldErrors(body.fieldErrors ?? {});
        setFormError(body.error ?? "Please fix the errors below.");
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
      className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4"
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        {fieldErrors.title?.map((message) => (
          <p key={message} className="text-xs text-red-600">
            {message}
          </p>
        ))}
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
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
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {ISSUE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
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
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {ISSUE_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create issue"}
      </button>
    </form>
  );
}
