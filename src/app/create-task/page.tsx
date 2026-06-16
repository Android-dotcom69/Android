"use client";

import AppLayout from "@/components/AppLayout";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Project = { _id: string; name: string };

const inp = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
const lbl = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

function CreateTaskForm() {
    const { currentUser, members } = useUser();
    const searchParams = useSearchParams();
    const preselectedProjectId = searchParams.get("projectId") ?? "";

    const [projects, setProjects]   = useState<Project[]>([]);
    const [title, setTitle]         = useState("");
    const [description, setDesc]    = useState("");
    const [priority, setPriority]   = useState("low");
    const [assignee, setAssignee]   = useState("");
    const [dueDate, setDueDate]     = useState("");
    const [projectId, setProjectId] = useState(preselectedProjectId);
    const [successMsg, setSuccess]  = useState("");

    useEffect(() => {
        fetch("/api/projects").then((r) => r.json()).then((data: Project[]) => {
            setProjects(data);
            if (!projectId && data.length > 0) setProjectId(data[0]._id);
        });
    }, []);

    if (!currentUser) return (
        <AppLayout>
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-slate-500">Loading…</p>
            </div>
        </AppLayout>
    );

    if (!can(currentUser.role, "task:create")) return (
        <AppLayout>
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-400 mb-2">Access Denied</p>
                    <p className="text-slate-500 text-sm">Only club heads can create tasks.</p>
                </div>
            </div>
        </AppLayout>
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!projectId) { alert("Please select a project."); return; }
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, priority, assignee, dueDate: dueDate || undefined, projectId }),
            });
            const data = await res.json();
            setTitle(""); setDesc(""); setPriority("low"); setAssignee(""); setDueDate("");
            const emailNote = assignee ? (data.emailSent ? " · Email notification sent." : " · Email could not be sent.") : "";
            setSuccess(`Task created successfully!${emailNote}`);
            setTimeout(() => setSuccess(""), 5000);
        } catch {
            alert("Failed to create task.");
        }
    }

    const selectedProject = projects.find((p) => p._id === projectId);

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-100">Create Task</h1>
                    <p className="text-slate-500 text-sm mt-1">Add a new task to a project board</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
                    {/* Project */}
                    <div className="p-6">
                        <label className={lbl}>Project *</label>
                        {projects.length === 0 ? (
                            <p className="text-red-400 text-sm">No projects found. Create a project first.</p>
                        ) : (
                            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className={inp}>
                                <option value="">— Select a project —</option>
                                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        )}
                        {selectedProject && (
                            <p className="text-xs text-indigo-400 mt-2">→ {selectedProject.name}</p>
                        )}
                    </div>

                    {/* Title & Description */}
                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className={lbl}>Task Name *</label>
                            <input type="text" placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} required className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Description *</label>
                            <textarea placeholder="Describe the task in detail…" value={description} onChange={(e) => setDesc(e.target.value)} required rows={4} className={`${inp} resize-none`} />
                        </div>
                    </div>

                    {/* Priority, Assignee, Due Date */}
                    <div className="p-6 grid sm:grid-cols-3 gap-5">
                        <div>
                            <label className={lbl}>Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inp}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Assigned To</label>
                            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inp}>
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                    <option key={m._id} value={m.name}>{m.name} · {m.role === "head" ? "Head" : "Member"}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={lbl}>Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inp} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 flex items-center gap-4">
                        <button type="submit" disabled={projects.length === 0} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors">
                            Create Task
                        </button>
                        {successMsg && (
                            <p className={`text-sm font-medium ${successMsg.includes("could not") ? "text-amber-400" : "text-emerald-400"}`}>
                                {successMsg}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

export default function CreateTask() {
    return (
        <Suspense fallback={
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-slate-500">Loading…</p>
                </div>
            </AppLayout>
        }>
            <CreateTaskForm />
        </Suspense>
    );
}
