"use client";

import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type Project = {
    _id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
};

export default function ProjectsPage() {
    const { currentUser } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    async function fetchData() {
        const [projRes, tasksRes] = await Promise.all([
            fetch("/api/projects"),
            fetch("/api/tasks"),
        ]);
        const projs: Project[] = await projRes.json();
        const tasks: { projectId?: string }[] = await tasksRes.json();

        const counts: Record<string, number> = {};
        tasks.forEach((t) => {
            if (t.projectId) counts[t.projectId] = (counts[t.projectId] ?? 0) + 1;
        });

        setProjects(projs);
        setTaskCounts(counts);
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !currentUser) return;
        setLoading(true);
        await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim(), description: description.trim(), createdBy: currentUser.name }),
        });
        setName("");
        setDescription("");
        setShowForm(false);
        setLoading(false);
        await fetchData();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this project and all its tasks?")) return;
        await fetch(`/api/projects/${id}`, { method: "DELETE" });
        await fetchData();
    }

    return (
        <div>
            <Navbar />

            <div className="max-w-5xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-4xl font-bold text-teal-200">Projects</h1>
                        <p className="text-gray-400 text-sm mt-1">{projects.length} active projects</p>
                    </div>
                    {can(currentUser?.role, "project:create") && (
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500"
                        >
                            {showForm ? "Cancel" : "+ New Project"}
                        </button>
                    )}
                </div>

                {/* Create Project Form */}
                {showForm && (
                    <form
                        onSubmit={handleCreate}
                        className="bg-black border border-teal-700 rounded-xl p-5 mb-6 flex flex-col gap-3"
                    >
                        <h2 className="text-lg font-bold text-teal-200">New Project</h2>
                        <input
                            type="text"
                            placeholder="Project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 bg-neutral-900 text-white rounded-xl border border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                        />
                        <textarea
                            placeholder="Short description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full p-3 bg-neutral-900 text-white rounded-xl border border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm resize-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="self-start px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 disabled:opacity-50 text-sm"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                    </form>
                )}

                {/* Project Grid */}
                {projects.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No projects yet.</p>
                        {can(currentUser?.role, "project:create") && (
                            <p className="text-gray-600 text-sm mt-2">Click "+ New Project" to get started.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div
                                key={project._id}
                                className="bg-black border border-neutral-700 rounded-xl p-5 flex flex-col gap-3 hover:border-teal-700 transition-colors"
                            >
                                {/* Project header */}
                                <div className="flex justify-between items-start gap-2">
                                    <h2 className="text-white font-bold text-lg leading-tight">{project.name}</h2>
                                    {can(currentUser?.role, "project:delete") && (
                                        <button
                                            onClick={() => handleDelete(project._id)}
                                            className="text-xs px-2 py-1 bg-red-800 text-white rounded-lg hover:bg-red-600 flex-shrink-0"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {/* Description */}
                                {project.description && (
                                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                                )}

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                                    <span>by {project.createdBy}</span>
                                    <span className="bg-neutral-800 text-teal-300 px-2 py-0.5 rounded-full font-medium">
                                        {taskCounts[project._id] ?? 0} tasks
                                    </span>
                                </div>

                                {/* Open button */}
                                <Link href={`/projects/${project._id}`}>
                                    <button className="w-full py-2 bg-teal-700 text-white text-sm font-bold rounded-lg hover:bg-teal-600">
                                        Open Board →
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
