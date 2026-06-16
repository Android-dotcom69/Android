"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Member = {
    _id: string;
    name: string;
    role: "head" | "member";
    email?: string;
    createdAt: string;
};

type UserContextType = {
    currentUser: Member | null;
    setCurrentUser: (member: Member) => void;
    members: Member[];
    refreshMembers: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
    currentUser: null,
    setCurrentUser: () => {},
    members: [],
    refreshMembers: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [currentUser, setCurrentUserState] = useState<Member | null>(null);

    async function refreshMembers() {
        const res = await fetch("/api/members");
        const data: Member[] = await res.json();
        setMembers(data);
    }

    useEffect(() => {
        async function init() {
            const res = await fetch("/api/members");
            const data: Member[] = await res.json();
            setMembers(data);

            const saved = localStorage.getItem("devChart_currentUser");
            if (saved) {
                try {
                    const parsed: Member = JSON.parse(saved);
                    const found = data.find((m) => m._id === parsed._id);
                    setCurrentUserState(found ?? data[0] ?? null);
                } catch {
                    setCurrentUserState(data[0] ?? null);
                }
            } else {
                setCurrentUserState(data[0] ?? null);
            }
        }
        init();
    }, []);

    function setCurrentUser(member: Member) {
        setCurrentUserState(member);
        localStorage.setItem("devChart_currentUser", JSON.stringify(member));
    }

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, members, refreshMembers }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
