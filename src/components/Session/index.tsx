'use client'

import { createContext, useContext, useState } from "react";

import styles from './session.module.css';

export interface UserInfo {
    username: string;
};
export type UserContextType = [
    user: UserInfo | undefined,
    setUser: (u?: UserInfo) => void
];
const SessionContext = createContext<UserContextType>([undefined, (u?: UserInfo) => {
    throw new Error('Session context not provided setter yet');
}]);

interface SessionProps {
    children: React.ReactNode;
    user?: UserInfo;
}
export function UserProvider(props: SessionProps) {
    const [user, setUser] = useState<UserInfo | undefined>(props.user);

    const _value: UserContextType = [
        user,
        (u?: UserInfo) => setUser(u)
    ];

    return <SessionContext.Provider value={_value}>
        <div className='fadechildren'>
            {props.children}
        </div>
    </SessionContext.Provider>
}

export function useUser() {
    return useContext(SessionContext);
}