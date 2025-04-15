import { integer, pgTable, AnyPgColumn, varchar, date } from "drizzle-orm/pg-core";
import { notesTable } from "./notes";

export const fileUploadsTable = pgTable("file_uploads", {
    uploadId: varchar('upload_id', {length: 255}).notNull().primaryKey(),
    noteId: varchar('note_id').references((): AnyPgColumn => notesTable.id),
    uploaded: integer().notNull(),
    total: integer().notNull(),
    fileName: varchar('file_name', {length: 255}).notNull(),
    partNumber: integer('part_number').notNull(),
    dateCreated: date('date_created').notNull().defaultNow()
});