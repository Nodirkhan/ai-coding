"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { PriorityBadge } from "@/components/issues/priority-badge";
import { STATUS_LABELS } from "@/components/issues/status-badge";
import type { Issue, IssuePriority, IssueStatus } from "@/lib/db/schema";

const PRIORITY_STRIPE: Record<IssuePriority, string> = {
  HIGH: "border-l-red-600",
  MEDIUM: "border-l-amber-500",
  LOW: "border-l-zinc-400",
};

/** Presentational card, also rendered inside the drag overlay. */
export function CardContent({ issue }: { issue: Issue }) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-sm border border-l-4 border-zinc-200 bg-white p-3 shadow-sm ${PRIORITY_STRIPE[issue.priority]}`}
    >
      <div className="text-xs text-zinc-500">#{issue.id}</div>
      <div className="text-sm font-medium text-zinc-900">{issue.title}</div>
      <div>
        <PriorityBadge priority={issue.priority} />
      </div>
    </div>
  );
}

function BoardCard({ issue }: { issue: Issue }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-grab touch-none rounded-sm focus-visible:outline-2 focus-visible:outline-[#0078d4] ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <Link
        href={`/issues/${issue.id}`}
        draggable={false}
        aria-label={`Work item ${issue.id}: ${issue.title}`}
        className="block"
      >
        <CardContent issue={issue} />
      </Link>
    </div>
  );
}

function QuickAdd({
  status,
  onCreated,
}: {
  status: IssueStatus;
  onCreated: (issue: Issue) => void;
}) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status }),
      });
      if (response.ok) {
        onCreated((await response.json()) as Issue);
        setTitle("");
      } else if (response.status === 400) {
        const body = await response.json();
        setError(body.fieldErrors?.title?.[0] ?? "Invalid work item.");
      } else {
        setError("Could not add the work item. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={submitting}
        placeholder="+ Add work item"
        aria-label={`Add work item to ${STATUS_LABELS[status]}`}
        aria-invalid={Boolean(error)}
        className="rounded-sm border border-zinc-300 bg-white px-2 py-1.5 text-sm placeholder:text-zinc-500"
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

export function BoardColumn({
  status,
  issues,
  onCreated,
}: {
  status: IssueStatus;
  issues: Issue[];
  onCreated: (issue: Issue) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      aria-label={STATUS_LABELS[status]}
      className="flex w-72 shrink-0 flex-col gap-3 rounded-sm bg-zinc-200/60 p-3 md:w-auto md:min-w-64 md:flex-1"
    >
      <h2 className="flex items-center justify-between text-sm font-semibold text-zinc-800">
        {STATUS_LABELS[status]}
        <span className="rounded-full bg-zinc-300 px-2 py-0.5 text-xs font-medium">
          {issues.length}
        </span>
      </h2>

      <QuickAdd status={status} onCreated={onCreated} />

      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-1 flex-col gap-2 rounded-sm border-2 border-dashed p-1 ${
          isOver ? "border-[#0078d4] bg-blue-50" : "border-transparent"
        }`}
      >
        {issues.length === 0 && (
          <p className="p-3 text-center text-xs text-zinc-500">
            No work items. Drop one here.
          </p>
        )}
        {issues.map((issue) => (
          <BoardCard key={issue.id} issue={issue} />
        ))}
      </div>
    </section>
  );
}
