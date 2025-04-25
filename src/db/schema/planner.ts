import { integer, pgTable } from "drizzle-orm/pg-core";

export const plannerTable = pgTable("planner", {
  id: integer().primaryKey().generatedAlwaysAsIdentity()
});