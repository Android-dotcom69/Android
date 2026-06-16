"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";

export default function Navbar() {
    const { currentUser, setCurrentUser, members } = useUser();

    return (
        <div className="flex justify-between items-center flex-wrap gap-3 font-bold bg-black text-teal-200 p-4">
            <Link href="/">
                <h1 className="text-2xl">devChart</h1>
            </Link>

            <div className="flex items-center gap-3 flex-wrap">
                {/* Viewing As selector */}
                <div className="flex items-center gap-2 bg-neutral-900 border border-teal-800 rounded-lg px-3 py-1.5">
                    <span className="text-gray-400 text-xs whitespace-nowrap">Viewing As:</span>
                    <select
                        value={currentUser?._id ?? ""}
                        onChange={(e) => {
                            const selected = members.find((m) => m._id === e.target.value);
                            if (selected) setCurrentUser(selected);
                        }}
                        className="bg-transparent text-teal-200 text-sm font-bold focus:outline-none"
                    >
                        {members.map((m) => (
                            <option key={m._id} value={m._id} className="bg-neutral-900 text-teal-200">
                                {m.name} ({m.role === "head" ? "Head" : "Member"})
                            </option>
                        ))}
                    </select>
                    <span
                        className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                            currentUser?.role === "head"
                                ? "bg-teal-500 text-black"
                                : "bg-neutral-600 text-white"
                        }`}
                    >
                        {currentUser?.role === "head" ? "HEAD" : "MEMBER"}
                    </span>
                </div>

                {/* Nav links */}
                <Link href="/projects">
                    <button className="rounded-lg py-1.5 px-3 bg-teal-200 text-black">
                        Projects
                    </button>
                </Link>

                <Link href="/dashboard">
                    <button className="rounded-lg py-1.5 px-3 bg-teal-200 text-black">
                        Dashboard
                    </button>
                </Link>

                {can(currentUser?.role, "task:create") && (
                    <Link href="/create-task">
                        <button className="rounded-lg py-1.5 px-3 bg-teal-200 text-black">
                            Create Task
                        </button>
                    </Link>
                )}

                {can(currentUser?.role, "members:manage") && (
                    <Link href="/members">
                        <button className="rounded-lg py-1.5 px-3 bg-teal-200 text-black">
                            Members
                        </button>
                    </Link>
                )}

                <Link href="/announcements">
                    <button className="rounded-lg py-1.5 px-3 bg-teal-200 text-black">
                        Announcements
                    </button>
                </Link>

                <Link href="/analytics">
                    <button className="rounded-lg py-1.5 px-3 bg-teal-200 text-black">
                        Analytics
                    </button>
                </Link>
            </div>
        </div>
    );
}
