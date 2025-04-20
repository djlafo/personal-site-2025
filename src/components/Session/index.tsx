'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { getUserInfo } from "@/actions/auth";

export interface UserInfo {
    username: string;
    exp: number;
    phone: string;
    token: string;
    zip: string;
    coords?: string;
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
                if(localStorage.getItem('zip') === u.zip) {
                    const coords = localStorage.getItem('coords');
                    if(coords) {
                        u = Object.assign({coords: coords}, u);
                    }   
                }
                const expiry = new Date(u.exp*1000);
                if(expiry < new Date()) {
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