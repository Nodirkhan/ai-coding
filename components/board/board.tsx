"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useIssues } from "@/components/issues/use-issues";
import { groupIssuesByStatus, resolveDrop } from "@/lib/board";
import { ISSUE_STATUSES, type Issue } from "@/lib/db/schema";
import { BoardColumn, CardContent } from "./board-column";

export function Board() {
  const { issues, setIssues, loadState, retry } = useIssues();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const columns = useMemo(() => groupIssuesByStatus(issues), [issues]);
  const activeIssue = issues.find((issue) => issue.id === activeId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const drop = resolveDrop(
      issues,
      Number(event.active.id),
      event.over?.id ?? null
    );
    if (!drop) return;

    const previousStatus = issues.find(
      (issue) => issue.id === drop.issueId
    )!.status;
    setMoveError(null);
    setIssues((current) =>
      current.map((issue) =>
        issue.id === drop.issueId ? { ...issue, status: drop.status } : issue
      )
    );

    try {
      const response = await fetch(`/api/issues/${drop.issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: drop.status }),
      });
      if (!response.ok) throw new Error("Save failed");
      const saved = (await response.json()) as Issue;
      setIssues((current) =>
        current.map((issue) => (issue.id === saved.id ? saved : issue))
      );
    } catch {
      setIssues((current) =>
        current.map((issue) =>
          issue.id === drop.issueId && issue.status === drop.status
            ? { ...issue, status: previousStatus }
            : issue
        )
      );
      setMoveError(
        `Could not move work item #${drop.issueId}. It was returned to its original column.`
      );
    }
  }

  function handleCreated(issue: Issue) {
    setIssues((current) => [issue, ...current]);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <h1 className="text-xl font-semibold text-zinc-900">Boards</h1>

      {loadState === "loading" && (
        <p role="status" aria-live="polite" className="text-sm text-zinc-500">
          Loading work items…
        </p>
      )}

      {loadState === "error" && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>Could not load work items. Please try again.</span>
          <button type="button" onClick={retry} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {moveError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span>{moveError}</span>
          <button
            type="button"
            onClick={() => setMoveError(null)}
            className="font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loadState === "ready" && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex flex-1 items-start gap-3 overflow-x-auto pb-2">
            {ISSUE_STATUSES.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                issues={columns[status]}
                onCreated={handleCreated}
              />
            ))}
          </div>
          <DragOverlay>
            {activeIssue ? <CardContent issue={activeIssue} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
