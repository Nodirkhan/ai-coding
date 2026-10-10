import "dotenv/config";
import { db } from "../lib/db/client";
import { issues, type NewIssue } from "../lib/db/schema";

/**
 * Inserts a handful of sample issues covering a mix of statuses and
 * priorities, so the app is immediately useful after setup.
 * Run via `npm run db:seed`.
 */
function main() {
  const sampleIssues: NewIssue[] = [
    {
      title: "Set up project repository",
      description: "Initialize the repo, add README, and configure tooling.",
      status: "DONE",
      priority: "MEDIUM",
    },
    {
      title: "Design issue list page",
      description: "Sketch the layout for the main issues list view.",
      status: "DONE",
      priority: "LOW",
    },
    {
      title: "Implement create issue form",
      description: "Add a form for creating new issues with validation.",
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
    {
      title: "Add issue detail page",
      description: "Show full issue details including description and timestamps.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
    },
    {
      title: "Wire up delete confirmation",
      description: null,
      status: "TODO",
      priority: "LOW",
    },
    {
      title: "Write service layer tests",
      description: "Cover create, update, delete, validation, and not-found cases.",
      status: "TODO",
      priority: "HIGH",
    },
    {
      title: "Polish empty and error states",
      description: "Make sure the UI handles no-data and failure cases gracefully.",
      status: "TODO",
      priority: "MEDIUM",
    },
  ];

  db.insert(issues).values(sampleIssues).run();

  console.log(`Seeded ${sampleIssues.length} sample issues.`);
}

main();
