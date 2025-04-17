import 'server-only';

import jwt from 'jsonwebtoken';

import { usersTable } from '@/db/schema/users';

import { cookies, headers } from 'next/headers';

const secretKey = process.env.AUTH_SECRET;

export interface JWTObjType {
    exp: number;
    data: Omit<typeof usersTable.$inferSelect, "password">;
}
export async function encrypt(obj: typeof usersTable.$inferSelect) {
    const {password, ...withoutPW} = obj;
    const token = jwt.sign({
        exp: Math.floor(getExpirationDefault()/1000),
        data: withoutPW
    }, secretKey);

    return token;
}

export function decrypt(s: string): JWTObjType {
    try {
        return jwt.verify(s, secretKey);
    } catch {}
}

export function getExpirationDefault() {
    return (Date.now() + (60 * 60 * 24 * 1000));
}

export async function getUser(): Promise<Omit<typeof usersTable.$inferSelect, 'password'> | undefined> {
    const session = await getSession()
    if(session) {
        const decrypted = decrypt(session);
        if(!decrypted) return;
        return decrypted.data as typeof usersTable.$inferSelect;
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