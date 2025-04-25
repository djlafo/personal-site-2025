import { integer, pgTable, AnyPgColumn, varchar, check, boolean } from "drizzle-orm/pg-core";

export const plannerTable = pgTable("planner_row", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  plannerId: integer('planner_id').references((): AnyPgColumn => plannerTable.id).notNull(),
  label: varchar({length: 255}).notNull(),
  motivation: integer().notNull(),
  deadline: integer().notNull().default(0),
  done: boolean().notNull().default(false),
  text: boolean().notNull().default(false)
});