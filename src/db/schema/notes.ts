import { integer, varchar, pgTable, AnyPgColumn, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notesTable = pgTable("notes", {
    id: varchar({length: 255}).primaryKey().notNull(),
    userId: integer('user_id').references((): AnyPgColumn => usersTable.id),
    text: varchar({length: 50000}).notNull(),
    public: boolean().default(false).notNull()
});