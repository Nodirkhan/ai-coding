import { describe, expect, it } from "vitest";
import { createTestDatabase } from "./test-helper";
import { issues } from "./schema";

describe("test database helper", () => {
  it("creates an isolated, migrated database that can insert and read rows", () => {
    const { db, close } = createTestDatabase();

    db.insert(issues).values({ title: "Sample issue" }).run();
    const rows = db.select().from(issues).all();

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Sample issue",
      status: "TODO",
      priority: "MEDIUM",
    });

    close();
  });

  it("rejects a blank title via the database check constraint", () => {
    const { db, close } = createTestDatabase();

    expect(() => db.insert(issues).values({ title: "   " }).run()).toThrow();

    close();
  });
});
