"use client";

import AppLayout from "@/components/AppLayout";
import { useUser, Member } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useState, useEffect } from "react";

type RawTask = { assignee?: string; status?: string; projectId?: string };
type Project = { _id: string; name: string };

const inp = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

export default function MembersPage() {
    const { currentUser, members, refreshMembers, setCurrentUser } = useUser();
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [doneCounts, setDoneCounts] = useState<Record<string, number>>({});
    const [allTasks, setAllTasks] = useState<RawTask[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        Promise.all([fetch("/api/tasks"), fetch("/api/projects")])
            .then(([r1, r2]) => Promise.all([r1.json(), r2.json()]))
            .then(([tasks, projs]: [RawTask[], Project[]]) => {
                const counts: Record<string, number> = {};
                const done: Record<string, number> = {};
                tasks.forEach((t) => {
                    if (t.assignee) {
                        counts[t.assignee] = (counts[t.assignee] ?? 0) + 1;
                        if (t.status === "done") done[t.assignee] = (done[t.assignee] ?? 0) + 1;
                    }
                });
                setTaskCounts(counts);
                setDoneCounts(done);
                setAllTasks(tasks);
                setProjects(projs);
            });
    }, []);

    if (!currentUser) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-slate-500">Loading…</p>
                </div>
            </AppLayout>
        );
    }

    const isHead = can(currentUser.role, "members:manage");

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-6 py-8">
                {isHead ? (
                    <HeadView
                        currentUser={currentUser}
                        members={members}
                        taskCounts={taskCounts}
                        doneCounts={doneCounts}
                        allTasks={allTasks}
                        projects={projects}
                        refreshMembers={refreshMembers}
                        setCurrentUser={setCurrentUser}
                    />
                ) : (
                    <MemberView
                        members={members}
                        currentUser={currentUser}
                        taskCounts={taskCounts}
                        doneCounts={doneCounts}
                        allTasks={allTasks}
                        projects={projects}
                    />
                )}
            </div>
        </AppLayout>
    );
}

/* ── Head View ─────────────────────────────────────────────────────── */

function HeadView({
    currentUser, members, taskCounts, doneCounts, allTasks, projects, refreshMembers, setCurrentUser,
}: {
    currentUser: Member;
    members: Member[];
    taskCounts: Record<string, number>;
    doneCounts: Record<string, number>;
    allTasks: RawTask[];
    projects: Project[];
    refreshMembers: () => Promise<void>;
    setCurrentUser: (m: Member) => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"head" | "member">("member");
    const [loading, setLoading] = useState(false);

    const heads = members.filter((m) => m.role === "head");
    const regularMembers = members.filter((m) => m.role === "member");
    const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
        });
        setName(""); setEmail(""); setRole("member");
        await refreshMembers();
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (id === currentUser._id) { alert("You cannot remove yourself."); return; }
        await fetch(`/api/members/${id}`, { method: "DELETE" });
        await refreshMembers();
    }

    async function handleRoleChange(member: Member, newRole: "head" | "member") {
        await fetch(`/api/members/${member._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        });
        await refreshMembers();
        if (member._id === currentUser._id) setCurrentUser({ ...currentUser, role: newRole });
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-100">Club Members</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your club roster</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                    { label: "Total Members",  value: members.length },
                    { label: "Club Heads",     value: heads.length },
                    { label: "Tasks Assigned", value: totalTasks },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-slate-100">{s.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Heads */}
            <SectionLabel label="Club Heads" />
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-6">
                {heads.length === 0 ? (
                    <p className="text-slate-500 text-sm p-4">No heads yet.</p>
                ) : heads.map((m) => (
                    <HeadMemberRow key={m._id} member={m} isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0} doneCount={doneCounts[m.name] ?? 0}
                        onDelete={handleDelete} onRoleChange={handleRoleChange} />
                ))}
            </div>

            {/* Members */}
            <SectionLabel label="Members" />
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-8">
                {regularMembers.length === 0 ? (
                    <p className="text-slate-500 text-sm p-4">No members yet.</p>
                ) : regularMembers.map((m) => (
                    <HeadMemberRow key={m._id} member={m} isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0} doneCount={doneCounts[m.name] ?? 0}
                        onDelete={handleDelete} onRoleChange={handleRoleChange} />
                ))}
            </div>

            <ProjectProgressSection currentUserName={currentUser.name} allTasks={allTasks} projects={projects} />

            {/* Add member */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-4">Add New Member</h2>
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name *</label>
                            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className={inp} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
                            <input type="email" placeholder="Optional" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value as "head" | "member")} className={inp}>
                                <option value="member">Member</option>
                                <option value="head">Head</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm disabled:opacity-50 transition-colors">
                        {loading ? "Adding…" : "Add Member"}
                    </button>
                </form>
            </div>

            <p className="text-xs text-slate-700 mt-6 text-center">
                Prototype role system — no real authentication. Would be replaced by secure auth in production.
            </p>
        </>
    );
}

/* ── Member (read-only) View ─────────────────────────────────────── */

function MemberView({ members, currentUser, taskCounts, doneCounts, allTasks, projects }: {
    members: Member[];
    currentUser: Member;
    taskCounts: Record<string, number>;
    doneCounts: Record<string, number>;
    allTasks: RawTask[];
    projects: Project[];
}) {
    const heads = members.filter((m) => m.role === "head");
    const regularMembers = members.filter((m) => m.role === "member");

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-100">Club Roster</h1>
                <p className="text-slate-500 text-sm mt-1">{members.length} members in this club</p>
            </div>

            <SectionLabel label="Club Heads" />
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-6">
                {heads.map((m) => (
                    <ReadOnlyRow key={m._id} member={m} isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0} doneCount={doneCounts[m.name] ?? 0} />
                ))}
            </div>

            <SectionLabel label="Members" />
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-8">
                {regularMembers.length === 0 ? (
                    <p className="text-slate-500 text-sm p-4">No members yet.</p>
                ) : regularMembers.map((m) => (
                    <ReadOnlyRow key={m._id} member={m} isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0} doneCount={doneCounts[m.name] ?? 0} />
                ))}
            </div>

            <ProjectProgressSection currentUserName={currentUser.name} allTasks={allTasks} projects={projects} />
        </>
    );
}

/* ── Project Progress Section ───────────────────────────────────── */

function ProjectProgressSection({ currentUserName, allTasks, projects }: {
    currentUserName: string;
    allTasks: RawTask[];
    projects: Project[];
}) {
    const myProjectIds = new Set(
        allTasks.filter((t) => t.assignee === currentUserName && t.projectId).map((t) => t.projectId as string)
    );
    const myProjects = projects.filter((p) => myProjectIds.has(p._id));
    if (myProjects.length === 0) return null;

    return (
        <div className="mb-8">
            <SectionLabel label="Project Progress" />
            <div className="flex flex-col gap-3">
                {myProjects.map((p) => {
                    const pts = allTasks.filter((t) => t.projectId === p._id);
                    const done = pts.filter((t) => t.status === "done").length;
                    const inProgress = pts.filter((t) => t.status === "in-progress").length;
                    const todo = pts.filter((t) => t.status === "todo" || !t.status).length;
                    const pct = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;
                    return (
                        <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-slate-100 font-semibold text-sm">{p.name}</h3>
                                <span className="text-indigo-400 font-bold text-sm">{pct}%</span>
                            </div>
                            <ProgressBar pct={pct} />
                            <div className="flex justify-between text-xs text-slate-500 mt-2.5">
                                <span>{pts.length} tasks total</span>
                                <div className="flex gap-3">
                                    <span>{todo} todo</span>
                                    <span className="text-blue-400">{inProgress} active</span>
                                    <span className="text-emerald-400">{done} done</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Shared sub-components ─────────────────────────────────────── */

function SectionLabel({ label }: { label: string }) {
    return <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{label}</h2>;
}

function ProgressBar({ pct }: { pct: number }) {
    return (
        <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function ProgressBarWithLabel({ done, total }: { done: number; total: number }) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">{done}/{total}</span>
        </div>
    );
}

function Avatar({ name }: { name: string }) {
    return (
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
            {name[0].toUpperCase()}
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
            role === "head"
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "bg-slate-700 text-slate-400"
        }`}>
            {role === "head" ? "Head" : "Member"}
        </span>
    );
}

function HeadMemberRow({ member, isSelf, taskCount, doneCount, onDelete, onRoleChange }: {
    member: Member;
    isSelf: boolean;
    taskCount: number;
    doneCount: number;
    onDelete: (id: string) => void;
    onRoleChange: (member: Member, role: "head" | "member") => void;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 last:border-0 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-medium text-sm">{member.name}</span>
                        {isSelf && <span className="text-xs text-slate-600">(you)</span>}
                    </div>
                    {member.email && <p className="text-xs text-slate-500">{member.email}</p>}
                    <ProgressBarWithLabel done={doneCount} total={taskCount} />
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {taskCount} task{taskCount !== 1 ? "s" : ""}
                </span>
                {isSelf ? (
                    <RoleBadge role={member.role} />
                ) : (
                    <select
                        value={member.role}
                        onChange={(e) => onRoleChange(member, e.target.value as "head" | "member")}
                        className="text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="member">Member</option>
                        <option value="head">Head</option>
                    </select>
                )}
                {!isSelf && (
                    <button onClick={() => onDelete(member._id)} className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                        Remove
                    </button>
                )}
            </div>
        </div>
    );
}

function ReadOnlyRow({ member, isSelf, taskCount, doneCount }: {
    member: Member;
    isSelf: boolean;
    taskCount: number;
    doneCount: number;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 last:border-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-medium text-sm">{member.name}</span>
                        {isSelf && <span className="text-xs text-slate-600">(you)</span>}
                    </div>
                    {member.email && <p className="text-xs text-slate-500">{member.email}</p>}
                    <ProgressBarWithLabel done={doneCount} total={taskCount} />
                </div>
            </div>
            <RoleBadge role={member.role} />
        </div>
    );
}
