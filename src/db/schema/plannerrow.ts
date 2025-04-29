import { integer, pgTable, AnyPgColumn, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { plannerTable } from "./planner";

export const plannerRowTable = pgTable("planner_row", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  plannerId: integer('planner_id').references((): AnyPgColumn => plannerTable.id).notNull(),
  label: varchar({length: 255}).notNull(),
  motivation: integer().notNull(),
  deadline: timestamp({ mode: 'string' }),
  done: boolean().notNull().default(false),
  textAt: timestamp('text_at', { mode: 'string' }),
  lastText: timestamp('last_text', { mode: 'string' }),
  recurMonths: integer('recur_months').notNull().default(0),
  recurDays: integer('recur_days').notNull().default(0),
});