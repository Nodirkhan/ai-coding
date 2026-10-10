"use client";

import { use, useEffect, useState } from "react";
import { IssueForm } from "@/components/issues/issue-form";
import { PriorityBadge } from "@/components/issues/priority-badge";
import { StatusBadge } from "@/components/issues/status-badge";
import type { Issue } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";

type LoadState = "loading" | "ready" | "not-found" | "error";

type FetchResult =
  | { outcome: "ok"; issue: Issue }
  | { outcome: "not-found" }
  | { outcome: "error" };

async function fetchIssue(id: string): Promise<FetchResult> {
  try {
    const response = await fetch(`/api/issues/${id}`);
    if (response.status === 404) {
      return { outcome: "not-found" };
    }
    if (!response.ok) {
      return { outcome: "error" };
    }
    const issue: Issue = await response.json();
    return { outcome: "ok", issue };
  } catch {
    return { outcome: "error" };
  }
}

type IssueDetailsViewProps = {
  params: Promise<{ id: string }>;
};

/**
 * Resolves the route's `id` param (via `use`, inside the page's Suspense
 * boundary) and fetches the issue from the API. Kept as a client component so
 * data access goes through `fetch` like the rest of the app, rather than
 * calling the service layer directly from a server component.
 */
export function IssueDetailsView({ params }: IssueDetailsViewProps) {
  const { id } = use(params);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetchIssue(id).then((result) => {
      if (cancelled) return;
      if (result.outcome === "ok") {
        setIssue(result.issue);
        setIsEditing(false);
        setLoadState("ready");
      } else if (result.outcome === "not-found") {
        setLoadState("not-found");
      } else {
        setLoadState("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadState === "loading") {
    return <p className="text-sm text-zinc-500">Loading issue…</p>;
  }

  if (loadState === "not-found") {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-6 text-center">
        <p className="text-sm text-zinc-600">
          This issue doesn&apos;t exist or may have been deleted.
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Could not load this issue. Please try again.
      </div>
    );
  }

  if (!issue) {
    return null;
  }

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {issue.title}
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="self-start rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Edit issue
          </button>
        )}
      </header>

      {isEditing ? (
        <IssueForm
          issue={issue}
          onSuccess={(updatedIssue) => {
            setIssue(updatedIssue);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm text-zinc-700">
            {issue.description ?? (
              <span className="italic text-zinc-400">No description.</span>
            )}
          </p>

          <dl className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
            <div>
              <dt className="font-medium text-zinc-600">Created</dt>
              <dd>{formatDateTime(issue.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-600">Updated</dt>
              <dd>{formatDateTime(issue.updatedAt)}</dd>
            </div>
          </dl>
        </>
      )}
    </article>
  );
}
