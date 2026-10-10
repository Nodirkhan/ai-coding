# Trackly

Trackly is a small, single-user issue tracker: create, view, edit, delete,
and track the status and priority of software-development issues. It's built
as the reference project for an AI Coding course — intentionally small,
explicit, and easy to read end-to-end.

There is no authentication, no multi-user support, and no external services.
It's a local full-stack web app backed by a SQLite file on disk.

## Technology stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) and [Drizzle ORM](https://orm.drizzle.team/)
- [Zod](https://zod.dev/) for request validation
- [Vitest](https://vitest.dev/) for tests
- npm as the package manager

## Prerequisites

- Node.js 20.9 or later
- npm (ships with Node.js)

No separate database server is required — SQLite is a single file on disk.

## Installation

```bash
git clone https://github.com/Nodirkhan/ai-coding.git
cd ai-coding
npm install
cp .env.example .env
```

`.env` only needs to set `DATABASE_URL`, the path to the SQLite file (see
`.env.example`). The default (`./data/trackly.db`) works out of the box.

## Database setup

The SQLite database is a single file, created automatically the first time
migrations run — there's nothing to install or configure.

### Migration command

```bash
npm run db:migrate
```

Applies the committed SQL migration(s) in `lib/db/migrations/` to create the
`issues` table. Safe to re-run; already-applied migrations are skipped.

### Seed command

```bash
npm run db:seed
```

Inserts a handful of sample issues (a mix of statuses and priorities) so the
app is immediately useful after setup.

## Development command

```bash
npm run dev
```

Starts the app at [http://localhost:3000](http://localhost:3000).

## Test command

```bash
npm run test
```

Runs the Vitest suite (service layer and pure helper functions).

## Production build command

```bash
npm run build
npm run start
```

`build` creates an optimized production build; `start` serves it.

## Project structure

```
app/
  api/issues/            Route Handlers (REST API)
    route.ts                GET /api/issues, POST /api/issues
    [id]/route.ts           GET/PUT/DELETE /api/issues/:id
  issues/[id]/page.tsx    Issue details page
  page.tsx                Home page (stats, list, create form)

components/
  issues/                 Issue-specific UI (list, form, badges, stats, ...)
  ui/                     Small generic UI primitives (e.g. Badge)

lib/
  db/                     Drizzle schema, connection, migrations, migrate script
  services/                Issue service — business logic, called by Route Handlers
  validation/              Zod schemas for create/update input
  api/                     Shared API helpers (error response shaping)
  stats.ts                 Pure stats computation used by the home page

scripts/
  seed.ts                 Sample data seed script

data/                     SQLite database file (gitignored, created on migrate)
```

Architecture and request flow are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## API endpoint overview

| Method | Path               | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/api/issues`      | List all issues                      |
| POST   | `/api/issues`      | Create an issue                      |
| GET    | `/api/issues/:id`  | Get a single issue                   |
| PUT    | `/api/issues/:id`  | Update an issue                      |
| DELETE | `/api/issues/:id`  | Delete an issue                      |

All endpoints return JSON (except `DELETE`, which returns `204 No Content`).
Validation failures return `400` with a `fieldErrors` object; missing issues
return `404`; unexpected failures return `500` without leaking internal
details.

## Scripts reference

| Script             | Purpose                                   |
| ------------------ | ------------------------------------------ |
| `npm run dev`       | Start the dev server                      |
| `npm run build`     | Create a production build                 |
| `npm run start`     | Serve the production build                |
| `npm run test`      | Run the test suite                        |
| `npm run lint`      | Lint the codebase                         |
| `npm run db:migrate`| Apply database migrations                 |
| `npm run db:seed`   | Insert sample issues                      |
| `npm run db:generate`| Generate a new migration from schema changes (for development) |

## License

MIT — see [`LICENSE`](./LICENSE).
