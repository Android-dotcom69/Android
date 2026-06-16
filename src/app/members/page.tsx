"use client";

import Navbar from "@/components/Navbar";
import { useUser, Member } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useState, useEffect } from "react";

type RawTask = { assignee?: string; status?: string; projectId?: string };
type Project = { _id: string; name: string };

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
                        if (t.status === "done") {
                            done[t.assignee] = (done[t.assignee] ?? 0) + 1;
                        }
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
            <div>
                <Navbar />
                <p className="p-6 text-gray-400">Loading...</p>
            </div>
        );
    }

    const isHead = can(currentUser.role, "members:manage");

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto p-6">
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
        </div>
    );
}

/* ── Head View ─────────────────────────────────────────────────────── */

function HeadView({
    currentUser,
    members,
    taskCounts,
    doneCounts,
    allTasks,
    projects,
    refreshMembers,
    setCurrentUser,
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
        setName("");
        setEmail("");
        setRole("member");
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
        if (member._id === currentUser._id) {
            setCurrentUser({ ...currentUser, role: newRole });
        }
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-teal-200">Club Members</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your club roster</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                    { label: "Total Members", value: members.length, color: "border-teal-700" },
                    { label: "Club Heads",    value: heads.length,   color: "border-blue-700" },
                    { label: "Tasks Assigned", value: totalTasks,    color: "border-green-700" },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-black border ${stat.color} rounded-xl p-4 text-center`}>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Heads section */}
            <SectionLabel label="Club Heads" color="text-teal-400" />
            <div className="bg-black rounded-xl border border-teal-800 overflow-hidden mb-6">
                {heads.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4">No heads yet.</p>
                ) : heads.map((m) => (
                    <HeadMemberRow
                        key={m._id}
                        member={m}
                        isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0}
                        doneCount={doneCounts[m.name] ?? 0}
                        onDelete={handleDelete}
                        onRoleChange={handleRoleChange}
                    />
                ))}
            </div>

            {/* Members section */}
            <SectionLabel label="Members" color="text-gray-400" />
            <div className="bg-black rounded-xl border border-neutral-700 overflow-hidden mb-8">
                {regularMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4">No members yet.</p>
                ) : regularMembers.map((m) => (
                    <HeadMemberRow
                        key={m._id}
                        member={m}
                        isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0}
                        doneCount={doneCounts[m.name] ?? 0}
                        onDelete={handleDelete}
                        onRoleChange={handleRoleChange}
                    />
                ))}
            </div>

            {/* Project Progress */}
            <ProjectProgressSection
                currentUserName={currentUser.name}
                allTasks={allTasks}
                projects={projects}
            />

            {/* Add Member Form */}
            <div className="bg-black rounded-xl border border-teal-800 p-5">
                <h2 className="text-lg font-bold text-teal-200 mb-4">Add New Member</h2>
                <form onSubmit={handleAdd} className="flex flex-col gap-3">
                    <div className="flex gap-3 flex-wrap">
                        <input
                            type="text"
                            placeholder="Full name *"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="flex-1 min-w-36 p-2 rounded-lg bg-neutral-900 text-white border border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                        />
                        <input
                            type="email"
                            placeholder="Email (optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 min-w-36 p-2 rounded-lg bg-neutral-900 text-white border border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as "head" | "member")}
                            className="p-2 rounded-lg bg-neutral-900 text-white border border-teal-700 focus:outline-none text-sm"
                        >
                            <option value="member">Member</option>
                            <option value="head">Head</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="self-start px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 text-sm disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Member"}
                    </button>
                </form>
            </div>

            <p className="text-xs text-neutral-600 mt-6 text-center">
                Prototype role system — no real authentication. Would be replaced by secure auth in production.
            </p>
        </>
    );
}

/* ── Member (read-only) View ────────────────────────────────────────── */

function MemberView({
    members,
    currentUser,
    taskCounts,
    doneCounts,
    allTasks,
    projects,
}: {
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
                <h1 className="text-4xl font-bold text-teal-200">Club Roster</h1>
                <p className="text-gray-400 text-sm mt-1">{members.length} members in this club</p>
            </div>

            <SectionLabel label="Club Heads" color="text-teal-400" />
            <div className="bg-black rounded-xl border border-teal-800 overflow-hidden mb-6">
                {heads.map((m) => (
                    <ReadOnlyRow
                        key={m._id}
                        member={m}
                        isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0}
                        doneCount={doneCounts[m.name] ?? 0}
                    />
                ))}
            </div>

            <SectionLabel label="Members" color="text-gray-400" />
            <div className="bg-black rounded-xl border border-neutral-700 overflow-hidden mb-8">
                {regularMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4">No members yet.</p>
                ) : regularMembers.map((m) => (
                    <ReadOnlyRow
                        key={m._id}
                        member={m}
                        isSelf={m._id === currentUser._id}
                        taskCount={taskCounts[m.name] ?? 0}
                        doneCount={doneCounts[m.name] ?? 0}
                    />
                ))}
            </div>

            {/* Project Progress */}
            <ProjectProgressSection
                currentUserName={currentUser.name}
                allTasks={allTasks}
                projects={projects}
            />
        </>
    );
}

/* ── Project Progress Section ───────────────────────────────────────── */

function ProjectProgressSection({
    currentUserName,
    allTasks,
    projects,
}: {
    currentUserName: string;
    allTasks: RawTask[];
    projects: Project[];
}) {
    // Only projects where current user has at least one task
    const myProjectIds = new Set(
        allTasks
            .filter((t) => t.assignee === currentUserName && t.projectId)
            .map((t) => t.projectId as string)
    );

    const myProjects = projects.filter((p) => myProjectIds.has(p._id));

    if (myProjects.length === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-3">
                Project Progress
            </h2>
            <div className="flex flex-col gap-3">
                {myProjects.map((p) => {
                    const pts = allTasks.filter((t) => t.projectId === p._id);
                    const done = pts.filter((t) => t.status === "done").length;
                    const inProgress = pts.filter((t) => t.status === "in-progress").length;
                    const todo = pts.filter((t) => t.status === "todo").length;
                    const pct = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;

                    return (
                        <div
                            key={p._id}
                            className="bg-black border border-neutral-700 rounded-xl p-5 hover:border-teal-700 transition-colors"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white font-bold text-base">{p.name}</h3>
                                <span className="text-teal-300 font-bold text-lg">{pct}%</span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-2.5 mb-3">
                                <div
                                    className="bg-teal-500 h-2.5 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{pts.length} tasks total</span>
                                <div className="flex gap-3">
                                    <span className="text-gray-400">{todo} todo</span>
                                    <span className="text-blue-400">{inProgress} active</span>
                                    <span className="text-green-400">{done} done</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Shared sub-components ─────────────────────────────────────────── */

function SectionLabel({ label, color }: { label: string; color: string }) {
    return (
        <h2 className={`text-xs font-bold ${color} uppercase tracking-widest mb-3`}>
            {label}
        </h2>
    );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
                <div
                    className="bg-teal-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{done}/{total} done</span>
        </div>
    );
}

function Avatar({ name }: { name: string }) {
    return (
        <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {name[0].toUpperCase()}
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    return (
        <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${role === "head" ? "bg-teal-500 text-black" : "bg-neutral-600 text-white"}`}>
            {role === "head" ? "HEAD" : "MEMBER"}
        </span>
    );
}

function HeadMemberRow({
    member,
    isSelf,
    taskCount,
    doneCount,
    onDelete,
    onRoleChange,
}: {
    member: Member;
    isSelf: boolean;
    taskCount: number;
    doneCount: number;
    onDelete: (id: string) => void;
    onRoleChange: (member: Member, role: "head" | "member") => void;
}) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 last:border-0 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{member.name}</span>
                        {isSelf && <span className="text-xs text-gray-500">(you)</span>}
                    </div>
                    {member.email && (
                        <p className="text-xs text-gray-400">{member.email}</p>
                    )}
                    <ProgressBar done={doneCount} total={taskCount} />
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-neutral-800 text-teal-300 px-2 py-0.5 rounded-full">
                    {taskCount} task{taskCount !== 1 ? "s" : ""}
                </span>

                {isSelf ? (
                    <RoleBadge role={member.role} />
                ) : (
                    <select
                        value={member.role}
                        onChange={(e) => onRoleChange(member, e.target.value as "head" | "member")}
                        className="text-xs bg-neutral-800 text-white border border-neutral-600 rounded-lg px-2 py-1 focus:outline-none"
                    >
                        <option value="member">Member</option>
                        <option value="head">Head</option>
                    </select>
                )}

                {!isSelf && (
                    <button
                        onClick={() => onDelete(member._id)}
                        className="text-xs px-2 py-1 bg-red-800 text-white rounded-lg hover:bg-red-600"
                    >
                        Remove
                    </button>
                )}
            </div>
        </div>
    );
}

function ReadOnlyRow({
    member,
    isSelf,
    taskCount,
    doneCount,
}: {
    member: Member;
    isSelf: boolean;
    taskCount: number;
    doneCount: number;
}) {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 last:border-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{member.name}</span>
                        {isSelf && <span className="text-xs text-gray-500">(you)</span>}
                    </div>
                    {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
                    <ProgressBar done={doneCount} total={taskCount} />
                </div>
            </div>
            <RoleBadge role={member.role} />
        </div>
    );
}
