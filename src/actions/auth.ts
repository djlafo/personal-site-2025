'use server'

import db from '@/db';
import { usersTable } from '@/db/schema/users';
import { eq, or, and } from 'drizzle-orm';

import { decrypt, encrypt, getExpirationDefault, getFullUser, getSession, getUser } from '@/lib/sessions';
import bcrypt from 'bcrypt';

import { cookies, headers } from 'next/headers';

import { UserInfo } from '@/components/Session';
import { MyError, MyErrorObj } from '@/lib/myerror';
import { phoneVerificationTable } from '@/db/schema/phoneverification';
import { sendText } from '@/lib/twilio';

type FormState = {
    error?: string;
    username?: string;
} | undefined

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
            const jwt = await encrypt({
                username: user.username,
                id: user.id
            });
            const cookieStore = await cookies();

            cookieStore.set('session', jwt, {
                httpOnly: true,
                secure: true,
                expires: getExpirationDefault(),
                sameSite: 'lax',
                path: '/'
            });

            await updatedIp;
            return await getUserInfo();
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
        return getUserInfo()
    } else {
        return {
            error: 'Failed to create'
        };
    }
}

interface UpdateAccountProps {
    phoneNumber?: string;
    zip?: string;
}
export async function updateAccount({phoneNumber, zip}: UpdateAccountProps) {
    const user = await getFullUser();
    if(!user) return MyError.create({message: 'Not logged in', authRequired: true});
    if(phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) return MyError.create({message: 'Invalid telephone format'}); 
    if(zip && !/^[0-9]{5}$/.test(zip)) return MyError.create({message: 'Invalid ZIP format'});

    let updateObj: any = {phoneNumber: phoneNumber || null, zip: zip || null};
    if(phoneNumber && user.phoneNumber !== phoneNumber) {
        updateObj = {zip: zip || null};
        const current = await db.select().from(phoneVerificationTable)
            .where(and(
                eq(phoneVerificationTable.verified, false),
                eq(phoneVerificationTable.userId, user.id),
                eq(phoneVerificationTable.phoneNumber, phoneNumber)
            ));
        if(current.length !== 0) {
            return MyError.create({message: 'You haven\'t answered the verification text yet'});
        } else {
            await db.insert(phoneVerificationTable).values({
                userId: user.id,
                phoneNumber: phoneNumber
            })
            await sendText('From dylanlafont.com: your number has been added to account '
                + `${user.username}, respond \'yes ${user.id}\' to confirm.  Respond \'stop\' to stop all messages from this number.`, phoneNumber);
        }
    }

    const resp = await db.update(usersTable).set(updateObj).where(eq(usersTable.id, user.id)).returning();
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

    const ui = await getFullUserInfo();
    if(!ui) return MyError.create({message: 'Failed to get user info'});
    return ui;
}

export async function getUserInfo(): Promise<UserInfo | undefined> {
    const session = await getSession();
    if(session) {
        const fullJwt = decrypt(session);
        if(!fullJwt) return;
        return {
            username: fullJwt.data.username,
            exp: fullJwt.exp,
            token: session
        };
    }
}

export async function getFullUserInfo() {
    return await getFullUser();
}