import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Resolves the SQLite file path from DATABASE_URL (relative to the project
 * root) and falls back to a sensible local default when unset.
 */
export function resolveDatabasePath(): string {
  const configured = process.env.DATABASE_URL ?? "./data/trackly.db";
  return path.resolve(process.cwd(), configured);
}

/**
 * Opens (creating the containing directory if needed) a better-sqlite3
 * connection at the given path and wraps it with Drizzle. Shared by the app,
 * the migration script, and the seed script so connection setup lives in one
 * place.
 */
export function createSqliteDb(dbPath: string) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");

  return { sqlite, db: drizzle(sqlite, { schema }) };
}
