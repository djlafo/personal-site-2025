import { AnyPgColumn, integer, pgTable, boolean, varchar, date } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const pollsTable = pgTable("polls", {
  uuid: varchar({length: 255}).primaryKey().notNull(),
  userId: integer('user_id').references((): AnyPgColumn => usersTable.id).notNull(),
  title: varchar({length:255}).notNull(),
  guestAddable: boolean('guest_addable').default(false).notNull(),
  dateCreated: date('date_created').notNull().defaultNow(),
  active: boolean().default(true).notNull(),
  rankedChoice: boolean('ranked_choice').default(false).notNull()
});

export const pollOptionsTable = pgTable("poll_options", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  pollUuid: varchar('poll_uuid', {length: 255}).references((): AnyPgColumn => pollsTable.uuid).notNull(),
  userId: integer('user_id').references((): AnyPgColumn => usersTable.id),
  text: varchar({length: 255}).notNull(),
  active: boolean().default(true)
});

export const pollVotesTable = pgTable('poll_votes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  pollOptionId: integer('poll_option_id').references((): AnyPgColumn => pollOptionsTable.id).notNull(),
  userId: integer('user_id').references((): AnyPgColumn => usersTable.id),
  ip: varchar({length:255}).notNull(),
  rank: integer()
});