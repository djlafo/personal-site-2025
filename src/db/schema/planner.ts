import { integer, pgTable, json } from "drizzle-orm/pg-core";

export const plannerTable = pgTable("planner", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  data: json()
});