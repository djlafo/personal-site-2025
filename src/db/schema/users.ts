import { AnyPgColumn, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { plannerTable } from './planner';

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  plannerId: integer('planner_id').references((): AnyPgColumn => plannerTable.id),
  lastIp: varchar('last_ip', {length: 255})
});