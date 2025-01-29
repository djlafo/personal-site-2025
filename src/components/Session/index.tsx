'use client'

// import { getUserInfo } from "@/actions/auth";
import { createContext, useContext, useState } from "react";

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
        {props.children}
    </SessionContext.Provider>
}

export function useUser() {
    return useContext(SessionContext);
}