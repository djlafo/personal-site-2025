import { integer, pgTable, AnyPgColumn, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { plannerTable } from "./planner";

export const plannerRowTable = pgTable("planner_row", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  plannerId: integer('planner_id').references((): AnyPgColumn => plannerTable.id).notNull(),
  label: varchar({length: 255}).notNull(),
  motivation: integer().notNull(),
  deadline: timestamp({ mode: 'string' }),
  done: boolean().notNull().default(false),
  textAt: timestamp({ mode: 'string' })
});