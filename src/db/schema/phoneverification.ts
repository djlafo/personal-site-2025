import { integer, pgTable, AnyPgColumn, boolean, char } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const phoneVerificationTable = pgTable("phone_verification", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').references((): AnyPgColumn => usersTable.id).notNull(),
    phoneNumber: char('phone_number', {length: 10}).notNull(),
    verified: boolean().default(false).notNull()
});