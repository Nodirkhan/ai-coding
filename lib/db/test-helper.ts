import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { createSqliteDb } from "./connection";

/**
 * Creates a fresh, migrated, in-memory SQLite database for a single test
 * file. Each call returns an isolated database so tests never share state.
 */
export function createTestDatabase() {
  const { sqlite, db } = createSqliteDb(":memory:");
  migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

  return { db, close: () => sqlite.close() };
}
