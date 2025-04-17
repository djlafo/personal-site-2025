'use server'

import db from '@/db';
import { usersTable } from '@/db/schema/users';
import { eq, or } from 'drizzle-orm';

import { decrypt, encrypt, getExpirationDefault, getSession, getUser } from '@/lib/sessions';
import bcrypt from 'bcrypt';

import { cookies, headers } from 'next/headers';

import { UserInfo } from '@/components/Session';
import { MyError, MyErrorObj } from '@/lib/myerror';

type FormState = {
    error?: string;
    username?: string;
} | undefined

async function userToUserInfo(): Promise<UserInfo | undefined> {
    const session = await getSession();
    if(session) {
        const fullJwt = decrypt(session);
        return {
            username: fullJwt.data.username,
            exp: fullJwt.exp,
            phone: fullJwt.data.phoneNumber || '',
            token: session
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

interface UpdateAccountProps {
    phoneNumber?: string;
}
export async function updateAccount({phoneNumber}: UpdateAccountProps): Promise<UserInfo | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not logged in', authRequired: true});
    if(phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) return MyError.create({message: 'Invalid format'}); 
    const resp = await db.update(usersTable).set({phoneNumber: phoneNumber}).where(eq(usersTable.id, user.id)).returning();
    if(resp.length!==1) return MyError.create({message: 'Failed to update'});
    const jwt = await encrypt(resp[0]);
    const cookieStore = await cookies();

    cookieStore.set('session', jwt, {
        httpOnly: true,
        secure: true,
        expires: getExpirationDefault(),
        sameSite: 'lax',
        path: '/'
    });

    const ui = await userToUserInfo();
    if(!ui) return MyError.create({message: 'Failed to get user info'});
    return ui;
}

export async function getUserInfo() {
    return await userToUserInfo();
}