"use client";

import AppLayout from "@/components/AppLayout";
import TaskCard from "@/components/TaskCard";
import EditTaskModal from "@/components/EditTaskModal";
import { useUser } from "@/context/UserContext";
import { can, canMoveTask } from "@/lib/permissions";
import React, { useState, useEffect } from "react";

type Task = {
    _id: string;
    title: string;
    description: string;
    priority: string;
    completion: boolean;
    assignee?: string;
    dueDate?: string;
    status: "todo" | "in-progress" | "done";
    projectId?: string;
};

const COLUMNS: { key: Task["status"]; label: string; dot: string; count: string }[] = [
    { key: "todo",        label: "To Do",       dot: "bg-slate-500",   count: "bg-slate-800 text-slate-400"    },
    { key: "in-progress", label: "In Progress",  dot: "bg-blue-500",    count: "bg-blue-500/10 text-blue-400"   },
    { key: "done",        label: "Done",         dot: "bg-emerald-500", count: "bg-emerald-500/10 text-emerald-400" },
];

const NEXT: Record<Task["status"], Task["status"] | null> = { "todo": "in-progress", "in-progress": "done", "done": null };
const PREV: Record<Task["status"], Task["status"] | null> = { "todo": null, "in-progress": "todo", "done": "in-progress" };

export default function Dashboard() {
    const { currentUser, members } = useUser();
    const [tasks, setTasks]               = useState<Task[]>([]);
    const [searchQuery, setSearchQuery]   = useState("");
    const [filterPriority, setFilter]     = useState("all");
    const [editingTask, setEditingTask]   = useState<Task | null>(null);

    useEffect(() => {
        fetch("/api/tasks").then((r) => r.json()).then(setTasks);
    }, []);

    async function moveTask(id: string, status: Task["status"]) {
        await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
        setTasks((prev) => prev.map((t) => t._id === id ? { ...t, status } : t));
    }

    async function deleteTask(id: string) {
        await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        setTasks((prev) => prev.filter((t) => t._id !== id));
    }

    const filtered = tasks.filter((t) => {
        const q = searchQuery.toLowerCase();
        const matchSearch = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.assignee ?? "").toLowerCase().includes(q);
        const matchPriority = filterPriority === "all" || t.priority.toLowerCase() === filterPriority;
        return matchSearch && matchPriority;
    });

    return (
        <AppLayout>
            <div className="flex flex-col h-full min-h-screen">
                {/* Page header */}
                <div className="px-6 py-5 border-b border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-100">Board</h1>
                            <p className="text-slate-500 text-sm mt-0.5">{tasks.length} tasks across all projects</p>
                        </div>
                        {currentUser?.role === "member" && (
                            <p className="text-xs text-slate-500">
                                You can move tasks assigned to <span className="text-indigo-400 font-medium">{currentUser.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Search & filter */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <div className="relative flex-1 min-w-48">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            <input
                                type="text"
                                placeholder="Search tasks…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                            <option value="all">All priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        {(searchQuery || filterPriority !== "all") && (
                            <button onClick={() => { setSearchQuery(""); setFilter("all"); }} className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
                                Clear
                            </button>
                        )}
                        <span className="text-slate-600 text-xs ml-auto">{filtered.length} / {tasks.length}</span>
                    </div>
                </div>

                {/* Edit modal */}
                {editingTask && (
                    <EditTaskModal
                        task={editingTask}
                        members={members}
                        onClose={() => setEditingTask(null)}
                        onSave={(updated) => {
                            setTasks((prev) => prev.map((t) => t._id === updated._id ? { ...t, ...updated } as Task : t));
                            setEditingTask(null);
                        }}
                    />
                )}

                {/* Kanban */}
                <div className="flex gap-4 p-5 overflow-x-auto flex-1">
                    {COLUMNS.map((col) => {
                        const colTasks = filtered.filter((t) => (t.status ?? "todo") === col.key);
                        return (
                            <div key={col.key} className="shrink-0 w-72 flex flex-col bg-slate-900 rounded-xl border border-slate-800">
                                {/* Column header */}
                                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                                    <h2 className="text-slate-300 font-medium text-sm flex-1">{col.label}</h2>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.count}`}>{colTasks.length}</span>
                                </div>

                                {/* Cards */}
                                <div className="flex flex-col gap-2.5 p-3 flex-1">
                                    {colTasks.length === 0 ? (
                                        <p className="text-slate-600 text-xs text-center mt-6">No tasks</p>
                                    ) : (
                                        colTasks.map((task) => {
                                            const taskStatus = task.status ?? "todo";
                                            const userCanMove = canMoveTask(currentUser?.role, task.assignee, currentUser?.name ?? "");
                                            return (
                                                <TaskCard
                                                    key={task._id}
                                                    title={task.title}
                                                    description={task.description}
                                                    priority={task.priority}
                                                    completion={task.completion}
                                                    assignee={task.assignee}
                                                    dueDate={task.dueDate}
                                                    status={taskStatus}
                                                    onMoveForward={userCanMove && NEXT[taskStatus] ? () => moveTask(task._id, NEXT[taskStatus]!) : undefined}
                                                    onMoveBack={userCanMove && PREV[taskStatus] ? () => moveTask(task._id, PREV[taskStatus]!) : undefined}
                                                    onEdit={can(currentUser?.role, "task:edit") ? () => setEditingTask(task) : undefined}
                                                    onDelete={can(currentUser?.role, "task:delete") ? () => deleteTask(task._id) : undefined}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
