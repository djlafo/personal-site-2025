'use server'

import db from '@/db';
import { usersTable } from '@/db/schema/users';
import { eq, or } from 'drizzle-orm';

import { encrypt, getDecryptedJWT, getExpirationDefault, getUser, JWTObjType } from '@/lib/sessions';
import bcrypt from 'bcrypt';

import { cookies, headers } from 'next/headers';

import { UserInfo } from '@/components/Session';

type FormState = {
    error?: String;
    username?: String;
} | undefined

async function userToUserInfo() : Promise<UserInfo | undefined> {
    const fullJwt = await getDecryptedJWT();
    if(fullJwt) {
        return {
            username: fullJwt.data.username,
            exp: fullJwt.exp
        };
    }
}

export async function login(state: FormState, formData: FormData) {
    const info = {
        username: formData.get('username')?.toString().toLowerCase(),
        password: formData.get('password')?.toString()
    };

    if(!info.username || !info.password) return {
        error: 'Username and password required'
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.username, info.username)).limit(1);
    if(users.length === 1) {
        const user = users[0];
        const correctPass = await bcrypt.compare(info.password, user.password);
        if(correctPass) {
            const headerList = await headers();
            const updatedIp = db.update(usersTable).set({lastIp: headerList.get('x-forwarded-for')}).where(eq(usersTable.username, info.username));
            const jwt = await encrypt(user);
            const cookieStore = await cookies();

            cookieStore.set('session', jwt, {
                httpOnly: true,
                secure: true,
                expires: getExpirationDefault(),
                sameSite: 'lax',
                path: '/'
            });

            await updatedIp;
            return await userToUserInfo();
        }

    }
    return {
        error: 'Incorrect login'
    };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}

export async function register(state: FormState, formData: FormData) {
    const info = {
        username: formData.get('username')?.toString().toLowerCase(),
        password: formData.get('password')?.toString()
    };
    if(!info.username || !info.password) return {
        error: 'Username and password required'
    }

    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for');
    if(ip) {
        const otherAccounts = await db.select().from(usersTable).where(or(
                eq(usersTable.lastIp, ip || 'impossible'),
                eq(usersTable.username, info.username)
            )
        );
        if(otherAccounts.length > 5) {
            return {
                error: 'You already have enough accounts'
            };
        }
    }
    const newUser = await db.insert(usersTable).values({
        username: info.username,
        password: await bcrypt.hash(info.password, 10),
        lastIp: ip
    }).returning();

    
    if(newUser.length === 1) {
        const cookieStore = await cookies();
        const jwt = await encrypt(newUser[0]);
        cookieStore.set('session', jwt, {
            httpOnly: true,
            secure: true,
            expires: getExpirationDefault(),
            sameSite: 'lax',
            path: '/'
        });
        return userToUserInfo()
    } else {
        return {
            error: 'Failed to create'
        };
    }
}

export async function getUserInfo() {
    return await userToUserInfo();
}