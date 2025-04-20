import { AnyPgColumn, integer, pgTable, varchar, char } from "drizzle-orm/pg-core";

import { plannerTable } from './planner';

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  plannerId: integer('planner_id').references((): AnyPgColumn => plannerTable.id),
  lastIp: varchar('last_ip', {length: 255}),
  phoneNumber: char('phone_number', {length: 10}),
  zip: char('zip', {length: 5})
});