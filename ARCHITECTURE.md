# Architecture

Trackly is a small, layered full-stack app. Each layer has one job, and the
UI never talks to the database directly — everything goes through the API.

```
Browser
  → UI (app/page.tsx, app/issues/[id]/page.tsx, components/)
  → /api/issues, /api/issues/:id   (Route Handlers)
  → IssueService                   (lib/services/issue-service.ts)
  → Drizzle ORM                    (lib/db/schema.ts, lib/db/connection.ts)
  → SQLite                         (data/trackly.db)
```

## UI layer

Plain React Server/Client Components under `app/` and `components/`. Pages
fetch data from the API with `fetch(...)` (not by importing the service
layer directly), using local component state for loading/ready/error/empty
states. `components/issues/` holds issue-specific UI (list, form, badges,
stats); `components/ui/` holds small generic primitives.

## API layer

Next.js Route Handlers under `app/api/issues/`. They are intentionally
thin: parse the request, call a service function, map the result to an HTTP
response (status code + JSON body). They don't contain business rules —
that all lives one layer down.

- Validation errors from the service become `400` with a `fieldErrors` body.
- A missing issue becomes `404`.
- Any unexpected error is caught, logged server-side with `console.error`,
  and turned into a generic `500` response — no stack traces or internal
  details are sent to the client.

## Service layer

`lib/services/issue-service.ts` exports plain functions (`getIssues`,
`getIssueById`, `createIssue`, `updateIssue`, `deleteIssue`) that:

1. Validate input with the Zod schemas in `lib/validation/issue.ts`,
   throwing a `ValidationError` (carrying field-level messages) on failure.
2. Call Drizzle to read/write the `issues` table.

There's no repository, factory, or dependency-injection layer in between —
Drizzle's query builder is simple enough to call directly. Each service
function takes the database connection as an optional last parameter, which
is how tests substitute an in-memory SQLite database without mocking
frameworks.

## Database layer

`lib/db/schema.ts` defines the `issues` table (columns, defaults, and CHECK
constraints for `status`/`priority`/non-blank `title`) with Drizzle's SQLite
schema builder. `lib/db/connection.ts` opens a `better-sqlite3` connection
at the path from `DATABASE_URL` and wraps it with Drizzle. Migrations are
plain SQL files committed under `lib/db/migrations/`, generated with
`npm run db:generate` and applied with `npm run db:migrate`.

SQLite is a single file on disk — there's no database server process to
install, configure, or run.

## Request flow example: creating an issue

1. The create/edit form (`components/issues/issue-form.tsx`) submits a
   `POST`/`PUT` to `/api/issues` or `/api/issues/:id`.
2. The Route Handler parses the JSON body and calls `createIssue`/`updateIssue`.
3. The service validates the input with Zod. On success, it inserts/updates
   a row via Drizzle and returns the saved issue.
4. The Route Handler returns the issue as JSON with a `201`/`200` status (or
   a `400`/`404`/`500` on failure).
5. The UI updates its local state from the response.

## Why this is intentionally minimal

This project deliberately avoids:

- **Authentication/authorization** — it's a single-user local app; adding
  auth would add complexity without demonstrating anything the course
  needs yet.
- **External infrastructure** (hosted databases, queues, microservices,
  third-party APIs) — everything runs on one machine with one `npm install`,
  so the course can focus on application code, not deployment topology.
- **Unnecessary abstractions** (repository pattern, DI containers, generic
  "framework" layers on top of Drizzle/Next.js) — the codebase is small
  enough that an extra layer of indirection would cost more to read than it
  would ever save.

The goal is a codebase a single developer can hold in their head, with
obvious seams (UI / API / service / database) where future course exercises
— search, filtering, comments, better validation, more tests, a new
endpoint — can be added without restructuring what's already here.
