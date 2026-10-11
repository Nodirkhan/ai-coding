"use client";

import { useEffect, useState } from "react";
import { useAppShell } from "@/components/layout/app-shell";
import type { Issue } from "@/lib/db/schema";

export type LoadState = "loading" | "ready" | "error";

async function fetchIssues(): Promise<Issue[] | null> {
  try {
    const response = await fetch("/api/issues");
    if (!response.ok) return null;
    return (await response.json()) as Issue[];
  } catch {
    return null;
  }
}

/**
 * Loads all issues through the API and reloads whenever the shell signals a
 * change (e.g. after creating one from the menu bar). `setIssues` lets pages
 * apply optimistic updates.
 */
export function useIssues() {
  const { refreshKey } = useAppShell();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchIssues().then((result) => {
      if (cancelled) return;
      if (result) {
        setIssues(result);
        setLoadState("ready");
      } else {
        setLoadState((current) => (current === "ready" ? current : "error"));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, retryKey]);

  function retry() {
    setLoadState("loading");
    setRetryKey((key) => key + 1);
  }

  return { issues, setIssues, loadState, retry };
}
