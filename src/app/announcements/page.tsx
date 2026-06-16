"use client";

import Navbar from "@/components/Navbar";
import { useUser } from "@/context/UserContext";
import { can } from "@/lib/permissions";
import React, { useState, useEffect } from "react";

type Announcement = {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AnnouncementsPage() {
    const { currentUser } = useUser();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    // Create form state
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [creating, setCreating] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    async function fetchAnnouncements() {
        const res = await fetch("/api/announcements");
        setAnnouncements(await res.json());
        setLoading(false);
    }

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser) return;
        setCreating(true);
        await fetch("/api/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle.trim(),
                content: newContent.trim(),
                author: currentUser.name,
            }),
        });
        setNewTitle("");
        setNewContent("");
        setShowForm(false);
        setCreating(false);
        await fetchAnnouncements();
    }

    function startEdit(a: Announcement) {
        setEditingId(a._id);
        setEditTitle(a.title);
        setEditContent(a.content);
    }

    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingId) return;
        setSaving(true);
        const res = await fetch(`/api/announcements/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
        });
        const updated = await res.json();
        setAnnouncements((prev) =>
            prev.map((a) => (a._id === editingId ? { ...a, ...updated } : a))
        );
        setEditingId(null);
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this announcement?")) return;
        await fetch(`/api/announcements/${id}`, { method: "DELETE" });
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    }

    const isHead = can(currentUser?.role, "announcement:create");
    const inputClass =
        "w-full p-2 bg-neutral-900 text-white rounded-lg border border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm";

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-4xl font-bold text-teal-200">Announcements</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {isHead && (
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 text-sm"
                        >
                            {showForm ? "Cancel" : "+ New Announcement"}
                        </button>
                    )}
                </div>

                {/* Create Form */}
                {isHead && showForm && (
                    <form
                        onSubmit={handleCreate}
                        className="bg-black border border-teal-700 rounded-xl p-5 mb-6 flex flex-col gap-3"
                    >
                        <h2 className="text-base font-bold text-teal-200">New Announcement</h2>
                        <input
                            type="text"
                            placeholder="Title *"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            className={inputClass}
                        />
                        <textarea
                            placeholder="Write your announcement here..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            required
                            rows={4}
                            className={`${inputClass} resize-none`}
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="self-start px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 text-sm disabled:opacity-50"
                        >
                            {creating ? "Posting..." : "Post Announcement"}
                        </button>
                    </form>
                )}

                {/* Announcements List */}
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No announcements yet.</p>
                        {isHead && (
                            <p className="text-gray-600 text-sm mt-2">
                                Click &quot;+ New Announcement&quot; to post one.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {announcements.map((a) =>
                            editingId === a._id ? (
                                /* ── Inline Edit Form ── */
                                <form
                                    key={a._id}
                                    onSubmit={handleEdit}
                                    className="bg-black border border-teal-600 rounded-xl p-5 flex flex-col gap-3"
                                >
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                        className={inputClass}
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        required
                                        rows={4}
                                        className={`${inputClass} resize-none`}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-4 py-1.5 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-500 disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-1.5 bg-neutral-700 text-white text-sm font-bold rounded-lg hover:bg-neutral-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* ── Announcement Card ── */
                                <div
                                    key={a._id}
                                    className="bg-black border border-neutral-700 rounded-xl p-5 hover:border-teal-800 transition-colors"
                                >
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <h2 className="text-white font-bold text-lg leading-tight">
                                            {a.title}
                                        </h2>
                                        {isHead && (
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => startEdit(a)}
                                                    className="text-xs px-2.5 py-1 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a._id)}
                                                    className="text-xs px-2.5 py-1 bg-red-800 text-white rounded-lg hover:bg-red-600 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                                        {a.content}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-neutral-800 pt-3">
                                        <div className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                            {a.author[0].toUpperCase()}
                                        </div>
                                        <span className="text-teal-400 font-medium">{a.author}</span>
                                        <span>·</span>
                                        <span>{formatDate(a.createdAt)}</span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
