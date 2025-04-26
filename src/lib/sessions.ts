import 'server-only';

import jwt from 'jsonwebtoken';

import { usersTable } from '@/db/schema/users';

import { cookies, headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import db from '@/db';

const secretKey = process.env.AUTH_SECRET;

export interface JWTObjType {
    exp: number;
    data: JWTData;
}
export interface JWTData {
    username: string,
    id: number
}
export async function encrypt(obj: JWTData) {
    // eslint-disable-next-line
    const token = jwt.sign({
        exp: Math.floor(getExpirationDefault()/1000),
        data: obj
    }, secretKey);

    return token;
}

export function decrypt(s: string): JWTObjType | undefined {
    try {
        return jwt.verify(s, secretKey);
    } catch {}
}

export function getExpirationDefault() {
    return (Date.now() + (60 * 60 * 24 * 1000));
}

export async function getUser(): Promise<JWTData | undefined> {
    const session = await getSession()
    if(session) {
        const decrypted = decrypt(session);
        if(!decrypted) return;

            return decrypted.data as typeof usersTable.$inferSelect;
        }
}

export async function getFullUser(): Promise<Omit<typeof usersTable.$inferSelect, "password"> | undefined> {
    const user = await getUser();
    if(!user) return;
    const query = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
    if(query.length === 1) {
        // eslint-disable-next-line
        const {password, ...theRest} = query[0];
        return theRest;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionHeader = cookieStore.get('session')?.value;
    return sessionHeader;
}

export async function getIp() {
    const headerList = await headers();
    return headerList.get('x-forwarded-for') || '';
}

export async function getClientIdentifier() {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || '';
    const userAgent = headerList.get('user-agent') || '';
    let client = '';
    if(ip) client += `${ip}-`;
    if(userAgent) client += userAgent;
    return client;
}

export function checkWSAuth(req: Request) {
    const auth = req.headers.get('authorization');
    return (auth && auth === process.env.AUTH_SECRET);
}