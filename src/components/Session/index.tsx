'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { getUserInfo } from "@/actions/auth";

export interface UserInfo {
    username: string;
    exp: number;
};
export type UserContextType = [
    user: UserInfo | undefined,
    setUser: (u?: UserInfo) => void,
    pending: boolean
];
const SessionContext = createContext<UserContextType>([undefined, (u?: UserInfo) => {
    console.log(u); // linter
    throw new Error('Session context not provided setter yet');
}, true]);

interface SessionProps {
    children: React.ReactNode;
    user?: UserInfo;
}
export function UserProvider(props: SessionProps) {
    const [user, setUser] = useState<UserInfo | undefined>(props.user);
    const [pending, setPending] = useState(true);

    const _value: UserContextType = [
        user,
        (u?: UserInfo) => setUser(u),
        pending
    ];

    useEffect(() => {
        getUserInfo().then(u => {
            if(u) {
                console.log(u);
                const expiry = new Date(u.exp*1000 - 1000*60*60*3);
                if(expiry < new Date()) {
                    // Login will expire in a few hours, just act like we dont have it on initial load
                    // to get user to relog and not get caught while doing other things
                    u = undefined;
                }
            }
            setUser(u);
            setPending(false);
        });
    }, []);

    return <SessionContext.Provider value={_value}>
        {props.children}
    </SessionContext.Provider>
}

export function useUser() {
    return useContext(SessionContext);
}