import 'server-only';

import jwt from 'jsonwebtoken';

import { usersTable } from '@/db/schema/users';

import { cookies } from 'next/headers';

const secretKey = process.env.AUTH_SECRET;

export async function encrypt(obj: typeof usersTable.$inferSelect) {
    const token = jwt.sign({
        exp: Math.floor(getExpiration()/1000),
        data: obj
    }, secretKey);

    return token;
}

export function decrypt(s: string) {
    return jwt.verify(s, secretKey);
}

export function getExpiration() {
    return (Date.now() + (60 * 60 * 24 * 1000));
}

export async function getUser() : Promise<typeof usersTable.$inferSelect | undefined> {
    const cookieStore = await cookies();
    const sessionHeader = cookieStore.get('session')?.value;
    if(sessionHeader) {
        try {
            const decrypted = decrypt(sessionHeader);
            return decrypted.data as typeof usersTable.$inferSelect;
        } catch (e) { 
            // invalid header
        }
    }
    // no header at all
}