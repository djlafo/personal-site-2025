import 'server-only';

import jwt from 'jsonwebtoken';

import { usersTable } from '@/db/schema/users';

import { cookies, headers } from 'next/headers';

const secretKey = process.env.AUTH_SECRET;

export interface JWTObjType {
    exp: number;
    data: typeof usersTable.$inferSelect;
}
export async function encrypt(obj: typeof usersTable.$inferSelect) {
    const token = jwt.sign({
        exp: Math.floor(getExpirationDefault()/1000),
        data: obj
    }, secretKey);

    return token;
}

export function decrypt(s: string) {
    return jwt.verify(s, secretKey);
}

export function getExpirationDefault() {
    return (Date.now() + (60 * 60 * 24 * 1000));
}

export async function getDecryptedJWT() {
    const decrypted = await decryptSession();
    if(decrypted) {
        return decrypted as JWTObjType;
    }
}

export async function getUser(): Promise<typeof usersTable.$inferSelect | undefined> {
    const decrypted = await decryptSession();
    if(decrypted) return decrypted.data as typeof usersTable.$inferSelect;
}

async function decryptSession() {
    const cookieStore = await cookies();
    const sessionHeader = cookieStore.get('session')?.value;
    if(sessionHeader) {
        try {
            return decrypt(sessionHeader);
        } catch {
            // invalid header
        }
    }
    // no header at all
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