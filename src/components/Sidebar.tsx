"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useState } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────
const ic = "w-4 h-4 shrink-0";

function IconDashboard() {
    return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
}
function IconFolders() {
    return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h3.5L10 7h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>;
}
function IconUsers() {
    return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconBell() {
    return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function IconChart() {
    return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IconPlus() {
    return <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconMenu() {
    return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function IconX() {
    return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

// ── Nav item data ──────────────────────────────────────────────────────────
const NAV = [
    { href: "/dashboard",     label: "Dashboard",     Icon: IconDashboard },
    { href: "/projects",      label: "Projects",      Icon: IconFolders },
    { href: "/members",       label: "Members",       Icon: IconUsers },
    { href: "/announcements", label: "Announcements", Icon: IconBell },
    { href: "/analytics",     label: "Analytics",     Icon: IconChart },
] as const;

type NavEntry = { href: string; label: string; Icon: () => React.ReactElement };

// ── NavItem ────────────────────────────────────────────────────────────────
function NavItem({ href, label, Icon, active, onClick }: NavEntry & { active: boolean; onClick?: () => void }) {
    return (
        <Link href={href} onClick={onClick}>
            <span className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"}`}>
                <Icon />
                {label}
            </span>
        </Link>
    );
}

// ── Logo mark ──────────────────────────────────────────────────────────────
function Logo() {
    return (
        <Link href="/">
            <div className="flex items-center gap-2.5 group">
                {/* Notepad / checklist icon */}
                <div className="w-7 h-7 shrink-0 relative">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="5" width="20" height="21" rx="2.5" fill="#4f46e5" fillOpacity="0.18" stroke="#6366f1" strokeWidth="1.2"/>
                        <circle cx="9" cy="5" r="1.8" fill="#020617" stroke="#6366f1" strokeWidth="1.2"/>
                        <circle cx="14" cy="5" r="1.8" fill="#020617" stroke="#6366f1" strokeWidth="1.2"/>
                        <circle cx="19" cy="5" r="1.8" fill="#020617" stroke="#6366f1" strokeWidth="1.2"/>
                        <rect x="7" y="11" width="3.5" height="3.5" rx="0.7" stroke="#6366f1" strokeWidth="1.1" fill="#4f46e5" fillOpacity="0.25"/>
                        <polyline points="7.6,12.8 8.8,14 10.7,11.8" stroke="#a5b4fc" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12.5" y1="12.75" x2="21" y2="12.75" stroke="#475569" strokeWidth="1.1" strokeLinecap="round"/>
                        <rect x="7" y="17" width="3.5" height="3.5" rx="0.7" stroke="#6366f1" strokeWidth="1.1" fill="#4f46e5" fillOpacity="0.25"/>
                        <polyline points="7.6,18.8 8.8,20 10.7,17.8" stroke="#a5b4fc" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12.5" y1="18.75" x2="21" y2="18.75" stroke="#475569" strokeWidth="1.1" strokeLinecap="round"/>
                        <rect x="7" y="22.5" width="3.5" height="3.5" rx="0.7" stroke="#334155" strokeWidth="1.1"/>
                        <line x1="12.5" y1="24.25" x2="18" y2="24.25" stroke="#334155" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                </div>
                <span className="text-slate-100 font-bold text-base tracking-tight group-hover:text-indigo-300 transition-colors">devChart</span>
            </div>
        </Link>
    );
}

// ── User selector bar ──────────────────────────────────────────────────────
function UserBar() {
    const { currentUser, setCurrentUser, members } = useUser();
    const initials = currentUser?.name
        ? currentUser.name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    return (
        <div className="p-3 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/50">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-indigo-300">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 leading-none mb-1">Viewing as</p>
                    <select
                        value={currentUser?._id ?? ""}
                        onChange={(e) => {
                            const sel = members.find((m) => m._id === e.target.value);
                            if (sel) setCurrentUser(sel);
                        }}
                        className="w-full bg-transparent text-slate-200 text-sm font-medium focus:outline-none cursor-pointer"
                    >
                        {members.map((m) => (
                            <option key={m._id} value={m._id} className="bg-slate-900 text-slate-200">
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${currentUser?.role === "head" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20" : "bg-slate-700 text-slate-300"}`}>
                    {currentUser?.role === "head" ? "Head" : "Mem"}
                </span>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-2 leading-relaxed px-1">
                Role switcher simulates auth · Production would use JWT / NextAuth
            </p>
        </div>
    );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────
export default function Sidebar() {
    const pathname = usePathname();
    const { currentUser } = useUser();
    const [open, setOpen] = useState(false);

    function isActive(href: string) {
        return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
    }

    function NavLinks({ onClick }: { onClick?: () => void }) {
        return (
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {(NAV as unknown as NavEntry[]).map((item) => (
                    <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={onClick} />
                ))}
                {can(currentUser?.role, "task:create") && (
                    <>
                        <div className="border-t border-slate-800 my-2" />
                        <NavItem href="/create-task" label="Create Task" Icon={IconPlus} active={pathname === "/create-task"} onClick={onClick} />
                    </>
                )}
            </nav>
        );
    }

    return (
        <>
            {/* ── Desktop sidebar ─────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-60 bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0 z-30">
                <div className="flex items-center gap-2.5 px-4 h-14 border-b border-slate-800 shrink-0">
                    <Logo />
                </div>
                <NavLinks />
                <UserBar />
            </aside>

            {/* ── Mobile top bar ──────────────────────────────────────── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800">
                <Logo />
                <button onClick={() => setOpen(true)} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
                    <IconMenu />
                </button>
            </header>

            {/* ── Mobile drawer ───────────────────────────────────────── */}
            {open && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <div className="relative w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800 shrink-0">
                            <Logo />
                            <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg">
                                <IconX />
                            </button>
                        </div>
                        <NavLinks onClick={() => setOpen(false)} />
                        <UserBar />
                    </div>
                </div>
            )}
        </>
    );
}
