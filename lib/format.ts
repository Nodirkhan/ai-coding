/**
 * SQLite's `current_timestamp` default produces `"YYYY-MM-DD HH:MM:SS"` in
 * UTC with no timezone suffix. Appending "Z" tells `Date` to parse it as UTC
 * instead of the browser's local time.
 */
function toDate(sqliteTimestamp: string): Date {
  return new Date(`${sqliteTimestamp.replace(" ", "T")}Z`);
}

export function formatDate(sqliteTimestamp: string): string {
  return toDate(sqliteTimestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(sqliteTimestamp: string): string {
  return toDate(sqliteTimestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
