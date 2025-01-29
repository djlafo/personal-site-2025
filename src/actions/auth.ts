'use server'

import db from '@/db';
import { usersTable } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

import { encrypt, getExpiration, getUser } from '@/lib/sessions';
import bcrypt from 'bcrypt';

import { cookies } from 'next/headers'

import { UserInfo } from '@/components/Session';

type FormState = {
    error?: String;
    username?: String;
} | undefined

function userToUserInfo(u: typeof usersTable.$inferSelect) : UserInfo {
    return {
        username: u.username
    };
}

export async function login(state: FormState, formData: FormData) {
    const info = {
        username: formData.get('username') as string,
        password: formData.get('password') as string
    };

    const users = await db.select().from(usersTable).where(eq(usersTable.username, info.username));
    if(users.length === 1) {
        const user = users[0];
        const correctPass = await bcrypt.compare(info.password, user.password);
        if(correctPass) {
            const jwt = await encrypt(user);
            const cookieStore = await cookies();
    
            cookieStore.set('session', jwt, {
                httpOnly: true,
                secure: true,
                // expires: getExpiration(),
                sameSite: 'lax',
                path: '/'
            });
            return userToUserInfo(user);
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

export async function getUserInfo() {
    const user = await getUser();
    if(user) {
        return userToUserInfo(user);
    }
}