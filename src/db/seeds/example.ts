import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema/users';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {

    const user: typeof usersTable.$inferInsert = {
        username: 'user',
        password: 'hash'
    };

    await db.insert(usersTable).values(user);

    const users = await db.select().from(usersTable);

    await db.update(usersTable).set({
        password: 'anotherhash'
    }).where(eq(usersTable.username, user.username));

    await db.delete(usersTable).where(eq(usersTable.username, user.username));
}

main();