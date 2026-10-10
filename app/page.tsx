"use client";

import { useEffect, useState } from "react";
import { IssueForm } from "@/components/issues/issue-form";
import { IssueList } from "@/components/issues/issue-list";
import type { Issue } from "@/lib/db/schema";

type LoadState = "loading" | "ready" | "error";
type FetchResult =
  | { ok: true; issues: Issue[] }
  | { ok: false };

async function fetchIssues(): Promise<FetchResult> {
  try {
    const response = await fetch("/api/issues");
    if (!response.ok) {
      return { ok: false };
    }
    const data: Issue[] = await response.json();
    return { ok: true, issues: data };
  } catch {
    return { ok: false };
  }
}

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [showForm, setShowForm] = useState(false);

  // Triggered by user actions (retry button, after creating an issue), never
  // called synchronously from an effect body.
  async function reloadIssues() {
    setLoadState("loading");
    const result = await fetchIssues();
    if (result.ok) {
      setIssues(result.issues);
      setLoadState("ready");
    } else {
      setLoadState("error");
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchIssues().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setIssues(result.issues);
        setLoadState("ready");
      } else {
        setLoadState("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-6 py-12 font-sans">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Trackly
        </h1>
        <p className="mt-2 max-w-xl text-base text-zinc-600">
          A small issue tracker for keeping track of what needs doing,
          what&apos;s in progress, and what&apos;s done.
        </p>
      </header>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900">Issues</h2>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "Create issue"}
        </button>
      </div>

      {showForm && (
        <IssueForm
          onCreated={() => {
            setShowForm(false);
            reloadIssues();
          }}
        />
      )}

      {loadState === "loading" && (
        <p className="text-sm text-zinc-500">Loading issues…</p>
      )}

      {loadState === "error" && (
        <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>Could not load issues. Please try again.</span>
          <button
            type="button"
            onClick={reloadIssues}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {loadState === "ready" && <IssueList issues={issues} />}
    </div>
  );
}
