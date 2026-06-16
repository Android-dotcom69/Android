"use client";

import AppLayout from "@/components/AppLayout";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type Project = { _id: string; name: string; description: string; createdBy: string; createdAt: string };

const inp = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

export default function ProjectsPage() {
    const { currentUser } = useUser();
    const [projects, setProjects]     = useState<Project[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [showForm, setShowForm]     = useState(false);
    const [name, setName]             = useState("");
    const [description, setDesc]      = useState("");
    const [loading, setLoading]       = useState(false);

    async function fetchData() {
        const [projRes, tasksRes] = await Promise.all([fetch("/api/projects"), fetch("/api/tasks")]);
        const projs: Project[] = await projRes.json();
        const tasks: { projectId?: string }[] = await tasksRes.json();
        const counts: Record<string, number> = {};
        tasks.forEach((t) => { if (t.projectId) counts[t.projectId] = (counts[t.projectId] ?? 0) + 1; });
        setProjects(projs);
        setTaskCounts(counts);
    }

    useEffect(() => { fetchData(); }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !currentUser) return;
        setLoading(true);
        await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), description: description.trim(), createdBy: currentUser.name }) });
        setName(""); setDesc(""); setShowForm(false); setLoading(false);
        await fetchData();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this project and all its tasks?")) return;
        await fetch(`/api/projects/${id}`, { method: "DELETE" });
        await fetchData();
    }

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-100">Projects</h1>
                        <p className="text-slate-500 text-sm mt-1">{projects.length} active project{projects.length !== 1 ? "s" : ""}</p>
                    </div>
                    {can(currentUser?.role, "project:create") && (
                        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors">
                            {showForm ? "Cancel" : (
                                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>New Project</>
                            )}
                        </button>
                    )}
                </div>

                {/* Create form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex flex-col gap-4">
                        <h2 className="text-sm font-semibold text-slate-200">New Project</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name *</label>
                                <input type="text" placeholder="e.g. Club Website Redesign" value={name} onChange={(e) => setName(e.target.value)} required className={inp} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                                <input type="text" placeholder="Short description (optional)" value={description} onChange={(e) => setDesc(e.target.value)} className={inp} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm disabled:opacity-50 transition-colors">
                            {loading ? "Creating…" : "Create Project"}
                        </button>
                    </form>
                )}

                {/* Grid */}
                {projects.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-slate-500 text-base mb-2">No projects yet</p>
                        {can(currentUser?.role, "project:create") && <p className="text-slate-600 text-sm">Click "New Project" to get started.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div key={project._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h3.5L10 7h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>
                                        </div>
                                        <h2 className="text-slate-100 font-semibold text-sm leading-tight">{project.name}</h2>
                                    </div>
                                    {can(currentUser?.role, "project:delete") && (
                                        <button onClick={() => handleDelete(project._id)} className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                        </button>
                                    )}
                                </div>
                                {project.description && <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{project.description}</p>}
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                                    <span>by {project.createdBy}</span>
                                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">{taskCounts[project._id] ?? 0} tasks</span>
                                </div>
                                <Link href={`/projects/${project._id}`}>
                                    <button className="w-full py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors">
                                        Open Board →
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
