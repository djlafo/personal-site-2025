import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { pollOptionsTable, pollsTable } from '@/db/schema/polls';
import { usersTable } from '../schema/users';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
    const me = await db.select().from(usersTable).where(eq(usersTable.username, 'dylan')).limit(1);
    if(me.length !== 1) throw new Error('I dont exist in this database');
    const poll = await db.insert(pollsTable).values({
        uuid: 'example',
        userId: me[0].id,
        title: 'Visitor count',
        guestAddable: false,  
    }).returning({uuid: pollsTable.uuid})
    await db.insert(pollOptionsTable).values({
        pollUuid: poll[0].uuid,
        text: 'Click here'
    });
}

main();