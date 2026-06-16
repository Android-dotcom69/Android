"use client";

import Navbar from "@/components/Navbar";
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

type Member = {
    _id: string;
    name: string;
    role: string;
};

type Project = {
    _id: string;
    name: string;
};

function isOverdue(task: Task): boolean {
    return (
        !!task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "done"
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className={`bg-black border ${color} rounded-xl p-5 text-center`}>
            <p className="text-4xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide">{label}</p>
        </div>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="w-full bg-neutral-800 rounded-full h-2">
            <div
                className="bg-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default function AnalyticsPage() {
    const { currentUser } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [tasksRes, membersRes, projectsRes] = await Promise.all([
                fetch("/api/tasks"),
                fetch("/api/members"),
                fetch("/api/projects"),
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
            <div>
                <Navbar />
                <p className="p-6 text-gray-400">Loading analytics...</p>
            </div>
        );
    }

    const isHead = can(currentUser.role, "task:edit");
    const now = new Date();

    /* ── Head analytics ─────────────────────────────────────────────── */
    if (isHead) {
        const total = tasks.length;
        const todoCount = tasks.filter((t) => t.status === "todo").length;
        const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
        const doneCount = tasks.filter((t) => t.status === "done").length;
        const overdueCount = tasks.filter(isOverdue).length;

        // Per-member stats
        const memberStats = members.map((m) => {
            const mine = tasks.filter((t) => t.assignee === m.name);
            return {
                name: m.name,
                role: m.role,
                total: mine.length,
                todo: mine.filter((t) => t.status === "todo").length,
                inProgress: mine.filter((t) => t.status === "in-progress").length,
                done: mine.filter((t) => t.status === "done").length,
                overdue: mine.filter(isOverdue).length,
            };
        });

        // Per-project stats
        const projectStats = projects.map((p) => {
            const pts = tasks.filter((t) => t.projectId === p._id);
            const done = pts.filter((t) => t.status === "done").length;
            const pct = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;
            return {
                name: p.name,
                total: pts.length,
                done,
                inProgress: pts.filter((t) => t.status === "in-progress").length,
                todo: pts.filter((t) => t.status === "todo").length,
                pct,
            };
        });

        const unassigned = tasks.filter((t) => !t.assignee || t.assignee === "").length;

        return (
            <div>
                <Navbar />
                <div className="max-w-5xl mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-teal-200">Analytics</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Club-wide workload overview — {now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                        <StatCard label="Total Tasks"  value={total}          color="border-teal-700"    />
                        <StatCard label="To Do"        value={todoCount}      color="border-neutral-600" />
                        <StatCard label="In Progress"  value={inProgressCount} color="border-blue-700"  />
                        <StatCard label="Done"         value={doneCount}      color="border-green-700"  />
                        <StatCard label="Overdue"      value={overdueCount}   color="border-red-700"    />
                    </div>

                    {/* Member Workload Table */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold text-teal-200 mb-4">Member Workload</h2>
                        <div className="bg-black border border-neutral-700 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-6 text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3 border-b border-neutral-800">
                                <span className="col-span-2">Member</span>
                                <span className="text-center">Total</span>
                                <span className="text-center">To Do</span>
                                <span className="text-center">In Progress</span>
                                <span className="text-center">Done</span>
                            </div>
                            {memberStats.length === 0 ? (
                                <p className="text-gray-500 text-sm p-5">No members found.</p>
                            ) : (
                                memberStats.map((m) => (
                                    <div
                                        key={m.name}
                                        className="grid grid-cols-6 items-center px-5 py-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-900"
                                    >
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {m.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{m.name}</p>
                                                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${m.role === "head" ? "bg-teal-500 text-black" : "bg-neutral-700 text-white"}`}>
                                                    {m.role === "head" ? "HEAD" : "MEMBER"}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-center text-white font-bold">{m.total}</span>
                                        <span className="text-center text-gray-300">{m.todo}</span>
                                        <span className="text-center text-blue-300">{m.inProgress}</span>
                                        <span className="text-center text-green-400">{m.done}</span>
                                    </div>
                                ))
                            )}
                            {unassigned > 0 && (
                                <div className="grid grid-cols-6 items-center px-5 py-4 border-t border-neutral-800 bg-neutral-900">
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            ?
                                        </div>
                                        <p className="text-gray-400 text-sm italic">Unassigned</p>
                                    </div>
                                    <span className="text-center text-gray-400 font-bold">{unassigned}</span>
                                    <span className="text-center text-gray-600">—</span>
                                    <span className="text-center text-gray-600">—</span>
                                    <span className="text-center text-gray-600">—</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Statistics */}
                    <div>
                        <h2 className="text-lg font-bold text-teal-200 mb-4">Project Progress</h2>
                        {projectStats.length === 0 ? (
                            <p className="text-gray-500 text-sm">No projects yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {projectStats.map((p) => (
                                    <div
                                        key={p.name}
                                        className="bg-black border border-neutral-700 rounded-xl p-5 hover:border-teal-700 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-white font-bold text-base leading-tight">{p.name}</h3>
                                            <span className="text-teal-300 font-bold text-lg ml-3 flex-shrink-0">
                                                {p.pct}%
                                            </span>
                                        </div>
                                        <ProgressBar value={p.pct} />
                                        <div className="flex justify-between text-xs text-gray-500 mt-3">
                                            <span>{p.total} tasks total</span>
                                            <div className="flex gap-3">
                                                <span className="text-gray-400">{p.todo} todo</span>
                                                <span className="text-blue-400">{p.inProgress} active</span>
                                                <span className="text-green-400">{p.done} done</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Member view (own stats only) ───────────────────────────────── */
    const myTasks = tasks.filter((t) => t.assignee === currentUser.name);
    const myTodo = myTasks.filter((t) => t.status === "todo");
    const myInProgress = myTasks.filter((t) => t.status === "in-progress");
    const myDone = myTasks.filter((t) => t.status === "done");
    const myOverdue = myTasks.filter(isOverdue);

    // Projects the current member is involved in
    const myProjectIds = new Set(
        myTasks.filter((t) => t.projectId).map((t) => t.projectId as string)
    );
    const myProjectStats = projects
        .filter((p) => myProjectIds.has(p._id))
        .map((p) => {
            const pts = tasks.filter((t) => t.projectId === p._id);
            const done = pts.filter((t) => t.status === "done").length;
            const inProgress = pts.filter((t) => t.status === "in-progress").length;
            const todo = pts.filter((t) => t.status === "todo").length;
            const pct = pts.length > 0 ? Math.round((done / pts.length) * 100) : 0;
            return { name: p.name, total: pts.length, done, inProgress, todo, pct };
        });

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-teal-200">My Stats</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Your personal task overview as of {now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                    <StatCard label="Total"       value={myTasks.length}      color="border-teal-700"    />
                    <StatCard label="To Do"        value={myTodo.length}       color="border-neutral-600" />
                    <StatCard label="In Progress"  value={myInProgress.length} color="border-blue-700"   />
                    <StatCard label="Done"         value={myDone.length}       color="border-green-700"  />
                </div>

                {/* Overdue Tasks */}
                {myOverdue.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-base font-bold text-red-400 mb-3">
                            Overdue ({myOverdue.length})
                        </h2>
                        <div className="bg-black border border-red-800 rounded-xl overflow-hidden">
                            {myOverdue.map((t) => (
                                <div
                                    key={t._id}
                                    className="flex justify-between items-center px-5 py-3 border-b border-neutral-800 last:border-0"
                                >
                                    <p className="text-white text-sm font-medium truncate">{t.title}</p>
                                    <span className="text-xs text-red-400 font-bold flex-shrink-0 ml-3">
                                        {t.dueDate
                                            ? new Date(t.dueDate).toLocaleDateString("en-IN", {
                                                  day: "numeric",
                                                  month: "short",
                                              })
                                            : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* In-progress tasks */}
                {myInProgress.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-base font-bold text-blue-400 mb-3">In Progress</h2>
                        <div className="bg-black border border-blue-900 rounded-xl overflow-hidden">
                            {myInProgress.map((t) => (
                                <div
                                    key={t._id}
                                    className="flex justify-between items-center px-5 py-3 border-b border-neutral-800 last:border-0"
                                >
                                    <p className="text-white text-sm font-medium truncate">{t.title}</p>
                                    {t.dueDate && (
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-3">
                                            Due {new Date(t.dueDate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {myTasks.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No tasks assigned to you yet.</p>
                    </div>
                )}

                {/* Project Progress — only projects this member is part of */}
                {myProjectStats.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-teal-200 mb-4">Project Progress</h2>
                        <div className="flex flex-col gap-3">
                            {myProjectStats.map((p) => (
                                <div
                                    key={p.name}
                                    className="bg-black border border-neutral-700 rounded-xl p-5 hover:border-teal-700 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-white font-bold text-base">{p.name}</h3>
                                        <span className="text-teal-300 font-bold text-lg">{p.pct}%</span>
                                    </div>
                                    <ProgressBar value={p.pct} />
                                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                                        <span>{p.total} tasks total</span>
                                        <div className="flex gap-3">
                                            <span className="text-gray-400">{p.todo} todo</span>
                                            <span className="text-blue-400">{p.inProgress} active</span>
                                            <span className="text-green-400">{p.done} done</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
