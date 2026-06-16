"use client";

import React, { useState } from "react";
import { Member } from "@/context/UserContext";

type Task = {
    _id: string;
    title: string;
    description: string;
    priority: string;
    assignee?: string;
    dueDate?: string;
    status: string;
    projectId?: string;
    completion: boolean;
};

const input = "w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
const label = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

export default function EditTaskModal({
    task,
    members,
    onClose,
    onSave,
}: {
    task: Task;
    members: Member[];
    onClose: () => void;
    onSave: (updated: Task) => void;
}) {
    const [title, setTitle]       = useState(task.title);
    const [description, setDesc]  = useState(task.description);
    const [priority, setPriority] = useState(task.priority);
    const [assignee, setAssignee] = useState(task.assignee ?? "");
    const [dueDate, setDueDate]   = useState(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    const [saving, setSaving] = useState(false);
    const [emailNotice, setEmailNotice] = useState<string | null>(null);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch(`/api/tasks/${task._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, priority, assignee, dueDate: dueDate || undefined }),
        });
        const updated = await res.json();
        onSave({ ...task, ...updated });
        setSaving(false);
        if (updated.emailSent === true) {
            setEmailNotice("✓ Notification email sent");
            setTimeout(() => { setEmailNotice(null); onClose(); }, 1500);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-base font-semibold text-slate-100">Edit Task</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                    <div>
                        <label className={label}>Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={input} />
                    </div>

                    <div>
                        <label className={label}>Description</label>
                        <textarea value={description} onChange={(e) => setDesc(e.target.value)} required rows={3} className={`${input} resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={label}>Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={input}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className={label}>Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={input} />
                        </div>
                    </div>

                    <div>
                        <label className={label}>Assigned To</label>
                        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={input}>
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m._id} value={m.name}>
                                    {m.name} · {m.role === "head" ? "Head" : "Member"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {emailNotice && (
                        <p className="text-sm text-emerald-400 font-medium text-center">{emailNotice}</p>
                    )}

                    <div className="flex gap-3 justify-end pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 transition-colors">
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
