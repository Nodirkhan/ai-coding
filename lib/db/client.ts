import { createSqliteDb, resolveDatabasePath } from "./connection";

export const db = createSqliteDb(resolveDatabasePath()).db;
