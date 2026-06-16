"use client";

import Navbar from "@/components/Navbar";
import TaskCard from "@/components/TaskCard";
import EditTaskModal from "@/components/EditTaskModal";
import { useUser } from "@/context/UserContext";
import { can, canMoveTask } from "@/lib/permissions";
import Link from "next/link";
import { useParams } from "next/navigation";
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
    projectId: string;
};

type Project = {
    _id: string;
    name: string;
    description: string;
    createdBy: string;
};

const COLUMNS: { key: Task["status"]; label: string; headerColor: string }[] = [
    { key: "todo",        label: "To Do",      headerColor: "bg-neutral-700" },
    { key: "in-progress", label: "In Progress", headerColor: "bg-blue-700"   },
    { key: "done",        label: "Done",        headerColor: "bg-green-700"  },
];

const NEXT_STATUS: Record<Task["status"], Task["status"] | null> = {
    "todo":        "in-progress",
    "in-progress": "done",
    "done":        null,
};

const PREV_STATUS: Record<Task["status"], Task["status"] | null> = {
    "todo":        null,
    "in-progress": "todo",
    "done":        "in-progress",
};

export default function ProjectBoard() {
    const params = useParams<{ id: string }>();
    const projectId = params.id;
    const { currentUser, members } = useUser();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState("all");
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        async function load() {
            const [projRes, tasksRes] = await Promise.all([
                fetch(`/api/projects/${projectId}`),
                fetch(`/api/tasks?projectId=${projectId}`),
            ]);
            setProject(await projRes.json());
            setTasks(await tasksRes.json());
        }
        load();
    }, [projectId]);

    async function moveTask(id: string, newStatus: Task["status"]) {
        await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        setTasks((prev) =>
            prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
        );
    }

    async function deleteTask(id: string) {
        await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        setTasks((prev) => prev.filter((t) => t._id !== id));
    }

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.assignee ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority =
            filterPriority === "all" || task.priority.toLowerCase() === filterPriority;
        return matchesSearch && matchesPriority;
    });

    return (
        <>
            <Navbar />

            {/* Project Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mx-3 mt-4 mb-2">
                <div className="flex items-center gap-3">
                    <Link href="/projects">
                        <button className="text-sm text-gray-400 hover:text-teal-300 font-medium">
                            ← Projects
                        </button>
                    </Link>
                    <span className="text-gray-600">/</span>
                    <h1 className="text-2xl font-bold text-teal-200">
                        {project?.name ?? "Loading..."}
                    </h1>
                </div>
                {project?.description && (
                    <p className="text-gray-400 text-sm hidden sm:block">{project.description}</p>
                )}
                {can(currentUser?.role, "task:create") && (
                    <Link href={`/create-task?projectId=${projectId}`}>
                        <button className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500">
                            + Add Task
                        </button>
                    </Link>
                )}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 m-3 p-3 bg-black rounded-xl border border-teal-700">
                <input
                    type="text"
                    placeholder="Search tasks, descriptions, or assignees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-48 p-2 rounded-lg bg-neutral-900 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500 text-sm"
                />
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="p-2 rounded-lg bg-neutral-900 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                {(searchQuery || filterPriority !== "all") && (
                    <button
                        onClick={() => { setSearchQuery(""); setFilterPriority("all"); }}
                        className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500"
                    >
                        Clear
                    </button>
                )}
                <span className="text-gray-400 text-sm ml-auto">
                    {filteredTasks.length} of {tasks.length} tasks
                </span>
            </div>

            {/* Role notice for members */}
            {currentUser?.role === "member" && (
                <p className="text-xs text-neutral-500 mx-3 mb-1">
                    You can move tasks assigned to{" "}
                    <span className="text-teal-400 font-semibold">{currentUser.name}</span>.
                </p>
            )}

            {/* Edit Modal */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    members={members}
                    onClose={() => setEditingTask(null)}
                    onSave={(updated) => {
                        setTasks((prev) => prev.map((t) => (t._id === updated._id ? { ...t, ...updated } as Task : t)));
                        setEditingTask(null);
                    }}
                />
            )}

            {/* Kanban Board */}
            <div className="flex gap-4 p-3 overflow-x-auto">
                {COLUMNS.map((col) => {
                    const colTasks = filteredTasks.filter(
                        (t) => (t.status ?? "todo") === col.key
                    );
                    return (
                        <div
                            key={col.key}
                            className="flex-shrink-0 w-72 flex flex-col rounded-xl border border-neutral-700 overflow-hidden"
                        >
                            <div className={`${col.headerColor} px-4 py-3 flex justify-between items-center`}>
                                <h2 className="text-white font-bold text-base">{col.label}</h2>
                                <span className="bg-black bg-opacity-30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {colTasks.length}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 p-3 bg-neutral-900 min-h-40 flex-1">
                                {colTasks.length === 0 ? (
                                    <p className="text-neutral-600 text-sm text-center mt-4">
                                        No tasks here
                                    </p>
                                ) : (
                                    colTasks.map((task) => {
                                        const taskStatus = task.status ?? "todo";
                                        const userCanMove = canMoveTask(
                                            currentUser?.role,
                                            task.assignee,
                                            currentUser?.name ?? ""
                                        );
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
                                                onMoveForward={
                                                    userCanMove && NEXT_STATUS[taskStatus]
                                                        ? () => moveTask(task._id, NEXT_STATUS[taskStatus]!)
                                                        : undefined
                                                }
                                                onMoveBack={
                                                    userCanMove && PREV_STATUS[taskStatus]
                                                        ? () => moveTask(task._id, PREV_STATUS[taskStatus]!)
                                                        : undefined
                                                }
                                                onEdit={
                                                    can(currentUser?.role, "task:edit")
                                                        ? () => setEditingTask(task)
                                                        : undefined
                                                }
                                                onDelete={
                                                    can(currentUser?.role, "task:delete")
                                                        ? () => deleteTask(task._id)
                                                        : undefined
                                                }
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
