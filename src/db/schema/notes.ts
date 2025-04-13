import { integer, varchar, pgTable, AnyPgColumn, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notesTable = pgTable("notes", {
    id: varchar({length: 255}).primaryKey().notNull(),
    parentId: varchar('parent_id', {length: 255}).references((): AnyPgColumn => notesTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references((): AnyPgColumn => usersTable.id),
    text: varchar().notNull(),
    public: boolean().default(false).notNull()
});