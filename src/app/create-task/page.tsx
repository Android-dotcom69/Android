"use client";

import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Project = {
    _id: string;
    name: string;
};

const inputClass =
    "w-full p-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none text-black";

function CreateTaskForm() {
    const { currentUser, members } = useUser();
    const searchParams = useSearchParams();
    const preselectedProjectId = searchParams.get("projectId") ?? "";

    const [projects, setProjects] = useState<Project[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("low");
    const [assignee, setAssignee] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [projectId, setProjectId] = useState(preselectedProjectId);

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then((data: Project[]) => {
                setProjects(data);
                if (!projectId && data.length > 0) setProjectId(data[0]._id);
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

    if (!can(currentUser.role, "task:create")) {
        return (
            <div>
                <Navbar />
                <div className="p-10 text-center">
                    <h2 className="text-3xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-gray-400">Only club heads can create tasks.</p>
                </div>
            </div>
        );
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!projectId) { alert("Please select a project."); return; }
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title, description, priority, assignee,
                    dueDate: dueDate || undefined,
                    projectId,
                }),
            });
            const data = await response.json();
            console.log(data);
            setTitle("");
            setDescription("");
            setPriority("low");
            setAssignee("");
            setDueDate("");
            alert("Task created successfully!");
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task.");
        }
    }

    const selectedProject = projects.find((p) => p._id === projectId);

    return (
        <div>
            <Navbar />
            <h1 className="text-6xl font-bold m-3 p-3 text-teal-200">
                Want to create a new task?
            </h1>

            <form onSubmit={handleSubmit} className="flex justify-center flex-col gap-4 m-4 p-3">

                <h3 className="text-2xl">Which project?</h3>
                {projects.length === 0 ? (
                    <p className="text-red-400 text-sm">No projects found. Create a project first.</p>
                ) : (
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">— Select a project —</option>
                        {projects.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                )}

                {selectedProject && (
                    <p className="text-xs text-teal-400 -mt-2">
                        Task will be added to: <span className="font-bold">{selectedProject.name}</span>
                    </p>
                )}

                <h3 className="text-2xl">Whats the task name?</h3>
                <input
                    type="text"
                    placeholder="Task name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={inputClass}
                />

                <h3 className="text-2xl">Describe it!!</h3>
                <textarea
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className={inputClass}
                />

                <h3 className="text-2xl">How important is it?</h3>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <h3 className="text-2xl">Who is handling this?</h3>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                        <option key={m._id} value={m.name}>
                            {m.name} ({m.role === "head" ? "Head" : "Member"})
                        </option>
                    ))}
                </select>

                <h3 className="text-2xl">When is it due?</h3>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClass}
                />

                <button
                    type="submit"
                    disabled={projects.length === 0}
                    className="w-full p-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                >
                    Create Task
                </button>
            </form>
        </div>
    );
}

export default function CreateTask() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
            <CreateTaskForm />
        </Suspense>
    );
}
