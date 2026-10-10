import "dotenv/config";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createSqliteDb, resolveDatabasePath } from "./connection";

/**
 * Applies committed migration files to the local SQLite database.
 * Run via `npm run db:migrate`.
 */
function main() {
  const dbPath = resolveDatabasePath();
  const { sqlite, db } = createSqliteDb(dbPath);

  migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

  sqlite.close();
  console.log(`Migrations applied to ${dbPath}`);
}

main();
