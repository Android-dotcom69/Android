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
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [priority, setPriority] = useState(task.priority);
    const [assignee, setAssignee] = useState(task.assignee ?? "");
    const [dueDate, setDueDate] = useState(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    const [saving, setSaving] = useState(false);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch(`/api/tasks/${task._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                priority,
                assignee,
                dueDate: dueDate || undefined,
            }),
        });
        const updated = await res.json();
        onSave({ ...task, ...updated });
        setSaving(false);
        onClose();
    }

    const inputClass =
        "w-full p-2 bg-neutral-800 text-white rounded-lg border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-2xl border border-teal-700 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-teal-200">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wide">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wide">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wide">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={inputClass}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wide">Assigned To</label>
                        <select
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m._id} value={m.name}>
                                    {m.name} ({m.role === "head" ? "Head" : "Member"})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block uppercase tracking-wide">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 text-sm disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
