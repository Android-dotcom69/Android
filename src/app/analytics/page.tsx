"use client";

import AppLayout from "@/components/AppLayout";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useEffect, useState } from "react";

type Task = {
    _id: string;
    title: string;
    status: "todo" | "in-progress" | "done";
    assignee?: string;
    dueDate?: string;
    projectId?: string;
};

type Member = { _id: string; name: string; role: string };
type Project = { _id: string; name: string };

function isOverdue(task: Task): boolean {
    return !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <p className={`text-4xl font-bold ${accent ?? "text-slate-100"}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">{label}</p>
        </div>
    );
}

function ProgressBar({ pct }: { pct: number }) {
    return (
        <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
    );
}

export default function AnalyticsPage() {
    const { currentUser } = useUser();
    const [tasks, setTasks]     = useState<Task[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [tasksRes, membersRes, projectsRes] = await Promise.all([
                fetch("/api/tasks"), fetch("/api/members"), fetch("/api/projects"),
            ]);
            setTasks(await tasksRes.json());
            setMembers(await membersRes.json());
            setProjects(await projectsRes.json());
            setLoading(false);
        }
        load();
    }, []);

    if (!currentUser || loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-slate-500">Loading analytics…</p>
                </div>
            </AppLayout>
        );
    }

    const isHead = can(currentUser.role, "task:edit");
    const now = new Date();

    /* ── Head view ───────────────────────────────────────────────────── */
    if (isHead) {
        const total          = tasks.length;
        const todoCount      = tasks.filter((t) => t.status === "todo").length;
        const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
        const doneCount      = tasks.filter((t) => t.status === "done").length;
        const overdueCount   = tasks.filter(isOverdue).length;
        const unassigned     = tasks.filter((t) => !t.assignee || t.assignee === "").length;

        const memberStats = members.map((m) => {
            const mine = tasks.filter((t) => t.assignee === m.name);
            return {
                name: m.name, role: m.role,
                total: mine.length,
                todo: mine.filter((t) => t.status === "todo").length,
                inProgress: mine.filter((t) => t.status === "in-progress").length,
                done: mine.filter((t) => t.status === "done").length,
                overdue: mine.filter(isOverdue).length,
            };
        });

        const projectStats = projects.map((p) => {
            const pts  = tasks.filter((t) => t.projectId === p._id);
            const done = pts.filter((t) => t.status === "done").length;
            const pct  = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;
            return {
                name: p.name, total: pts.length, done,
                inProgress: pts.filter((t) => t.status === "in-progress").length,
                todo: pts.filter((t) => t.status === "todo").length,
                pct,
            };
        });

        return (
            <AppLayout>
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-slate-100">Analytics</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Club-wide overview · {now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>

                    {/* Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                        <StatCard label="Total Tasks"  value={total} />
                        <StatCard label="To Do"        value={todoCount} />
                        <StatCard label="In Progress"  value={inProgressCount} accent="text-blue-400" />
                        <StatCard label="Done"         value={doneCount}       accent="text-emerald-400" />
                        <StatCard label="Overdue"      value={overdueCount}    accent={overdueCount > 0 ? "text-red-400" : undefined} />
                    </div>

                    {/* Member Workload */}
                    <div className="mb-10">
                        <h2 className="text-sm font-semibold text-slate-200 mb-4">Member Workload</h2>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-6 text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 border-b border-slate-800">
                                <span className="col-span-2">Member</span>
                                <span className="text-center">Total</span>
                                <span className="text-center">To Do</span>
                                <span className="text-center">In Progress</span>
                                <span className="text-center">Done</span>
                            </div>
                            {memberStats.length === 0 ? (
                                <p className="text-slate-500 text-sm p-5">No members found.</p>
                            ) : memberStats.map((m) => (
                                <div key={m.name} className="grid grid-cols-6 items-center px-5 py-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                                            {m.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-slate-200 text-sm font-medium">{m.name}</p>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                                m.role === "head"
                                                    ? "bg-indigo-500/10 text-indigo-400"
                                                    : "bg-slate-700 text-slate-400"
                                            }`}>
                                                {m.role === "head" ? "Head" : "Member"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-center text-slate-100 font-bold">{m.total}</span>
                                    <span className="text-center text-slate-400">{m.todo}</span>
                                    <span className="text-center text-blue-400">{m.inProgress}</span>
                                    <span className="text-center text-emerald-400">{m.done}</span>
                                </div>
                            ))}
                            {unassigned > 0 && (
                                <div className="grid grid-cols-6 items-center px-5 py-4 border-t border-slate-800 bg-slate-800/30">
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">?</div>
                                        <p className="text-slate-500 text-sm italic">Unassigned</p>
                                    </div>
                                    <span className="text-center text-slate-400 font-bold">{unassigned}</span>
                                    <span className="text-center text-slate-700">—</span>
                                    <span className="text-center text-slate-700">—</span>
                                    <span className="text-center text-slate-700">—</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Progress */}
                    <div>
                        <h2 className="text-sm font-semibold text-slate-200 mb-4">Project Progress</h2>
                        {projectStats.length === 0 ? (
                            <p className="text-slate-500 text-sm">No projects yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {projectStats.map((p) => (
                                    <div key={p.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-slate-100 font-semibold text-sm leading-tight">{p.name}</h3>
                                            <span className="text-indigo-400 font-bold text-sm ml-3 shrink-0">{p.pct}%</span>
                                        </div>
                                        <ProgressBar pct={p.pct} />
                                        <div className="flex justify-between text-xs text-slate-500 mt-2.5">
                                            <span>{p.total} tasks</span>
                                            <div className="flex gap-3">
                                                <span>{p.todo} todo</span>
                                                <span className="text-blue-400">{p.inProgress} active</span>
                                                <span className="text-emerald-400">{p.done} done</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    /* ── Member view (own stats only) ───────────────────────────────── */
    const myTasks      = tasks.filter((t) => t.assignee === currentUser.name);
    const myTodo       = myTasks.filter((t) => t.status === "todo");
    const myInProgress = myTasks.filter((t) => t.status === "in-progress");
    const myDone       = myTasks.filter((t) => t.status === "done");
    const myOverdue    = myTasks.filter(isOverdue);

    const myProjectIds = new Set(myTasks.filter((t) => t.projectId).map((t) => t.projectId as string));
    const myProjectStats = projects.filter((p) => myProjectIds.has(p._id)).map((p) => {
        const pts  = tasks.filter((t) => t.projectId === p._id);
        const done = pts.filter((t) => t.status === "done").length;
        const pct  = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;
        return {
            name: p.name, total: pts.length, done,
            inProgress: pts.filter((t) => t.status === "in-progress").length,
            todo: pts.filter((t) => t.status === "todo").length,
            pct,
        };
    });

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-100">My Stats</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Your personal task overview · {now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                    <StatCard label="Total"       value={myTasks.length} />
                    <StatCard label="To Do"        value={myTodo.length} />
                    <StatCard label="In Progress"  value={myInProgress.length} accent="text-blue-400" />
                    <StatCard label="Done"         value={myDone.length}       accent="text-emerald-400" />
                </div>

                {myOverdue.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-red-400 mb-3">Overdue ({myOverdue.length})</h2>
                        <div className="bg-slate-900 border border-red-500/20 rounded-xl overflow-hidden">
                            {myOverdue.map((t) => (
                                <div key={t._id} className="flex justify-between items-center px-5 py-3 border-b border-slate-800 last:border-0">
                                    <p className="text-slate-200 text-sm font-medium truncate">{t.title}</p>
                                    <span className="text-xs text-red-400 font-semibold shrink-0 ml-3">
                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {myInProgress.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-blue-400 mb-3">In Progress</h2>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                            {myInProgress.map((t) => (
                                <div key={t._id} className="flex justify-between items-center px-5 py-3 border-b border-slate-800 last:border-0">
                                    <p className="text-slate-200 text-sm font-medium truncate">{t.title}</p>
                                    {t.dueDate && (
                                        <span className="text-xs text-slate-500 shrink-0 ml-3">
                                            Due {new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {myTasks.length === 0 && (
                    <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-slate-500">No tasks assigned to you yet.</p>
                    </div>
                )}

                {myProjectStats.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-slate-200 mb-4">Project Progress</h2>
                        <div className="flex flex-col gap-3">
                            {myProjectStats.map((p) => (
                                <div key={p.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-slate-100 font-semibold text-sm">{p.name}</h3>
                                        <span className="text-indigo-400 font-bold text-sm">{p.pct}%</span>
                                    </div>
                                    <ProgressBar pct={p.pct} />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2.5">
                                        <span>{p.total} tasks</span>
                                        <div className="flex gap-3">
                                            <span>{p.todo} todo</span>
                                            <span className="text-blue-400">{p.inProgress} active</span>
                                            <span className="text-emerald-400">{p.done} done</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
