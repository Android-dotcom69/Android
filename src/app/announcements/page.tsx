"use client";

import AppLayout from "@/components/AppLayout";
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

const inp = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
const lbl = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide";

export default function AnnouncementsPage() {
    const { currentUser } = useUser();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    const [emailBanner, setEmailBanner] = useState<{ msg: string; ok: boolean } | null>(null);

    async function fetchAnnouncements() {
        const res = await fetch("/api/announcements");
        setAnnouncements(await res.json());
        setLoading(false);
    }

    useEffect(() => { fetchAnnouncements(); }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser) return;
        setCreating(true);
        const res = await fetch("/api/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim(), author: currentUser.name }),
        });
        const data = await res.json();
        setNewTitle(""); setNewContent(""); setShowForm(false); setCreating(false);
        await fetchAnnouncements();

        if (data.emailSent) {
            setEmailBanner({ msg: `Notification sent to ${data.emailCount} member${data.emailCount !== 1 ? "s" : ""}.`, ok: true });
        } else if (data.emailReason === "no_api_key") {
            setEmailBanner({ msg: "Email not configured — add RESEND_API_KEY to .env.local and restart.", ok: false });
        } else if (data.emailReason === "no_valid_emails") {
            setEmailBanner({ msg: "No members with a valid email address. Add emails in the Members page.", ok: false });
        } else {
            setEmailBanner({ msg: "Announcement posted but email delivery failed. Check server logs.", ok: false });
        }
        setTimeout(() => setEmailBanner(null), 6000);
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
        setAnnouncements((prev) => prev.map((a) => (a._id === editingId ? { ...a, ...updated } : a)));
        setEditingId(null);
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this announcement?")) return;
        await fetch(`/api/announcements/${id}`, { method: "DELETE" });
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    }

    const isHead = can(currentUser?.role, "announcement:create");

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-100">Announcements</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {isHead && (
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors"
                        >
                            {showForm ? "Cancel" : (
                                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>New Announcement</>
                            )}
                        </button>
                    )}
                </div>

                {/* Email banner */}
                {emailBanner && (
                    <div className={`text-sm font-medium px-4 py-3 rounded-xl mb-5 border ${
                        emailBanner.ok
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                        {emailBanner.ok ? "✓ " : "⚠ "}{emailBanner.msg}
                    </div>
                )}

                {/* Create form */}
                {isHead && showForm && (
                    <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 flex flex-col gap-4">
                        <h2 className="text-sm font-semibold text-slate-200">New Announcement</h2>
                        <div>
                            <label className={lbl}>Title *</label>
                            <input type="text" placeholder="e.g. Hackathon registration open" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className={inp} />
                        </div>
                        <div>
                            <label className={lbl}>Content *</label>
                            <textarea placeholder="Write your announcement here…" value={newContent} onChange={(e) => setNewContent(e.target.value)} required rows={4} className={`${inp} resize-none`} />
                        </div>
                        <button type="submit" disabled={creating} className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm disabled:opacity-50 transition-colors">
                            {creating ? "Posting…" : "Post Announcement"}
                        </button>
                    </form>
                )}

                {/* List */}
                {loading ? (
                    <p className="text-slate-500 text-sm">Loading…</p>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900 border border-slate-800 rounded-xl">
                        <p className="text-slate-500">No announcements yet.</p>
                        {isHead && <p className="text-slate-600 text-sm mt-2">Click "New Announcement" to post one.</p>}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {announcements.map((a) =>
                            editingId === a._id ? (
                                <form key={a._id} onSubmit={handleEdit} className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 flex flex-col gap-4">
                                    <div>
                                        <label className={lbl}>Title</label>
                                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Content</label>
                                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} required rows={4} className={`${inp} resize-none`} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                                            {saving ? "Saving…" : "Save"}
                                        </button>
                                        <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div key={a._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <h2 className="text-slate-100 font-semibold text-base leading-tight">{a.title}</h2>
                                        {isHead && (
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => startEdit(a)} className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(a._id)} className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap mb-4">{a.content}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800 pt-3">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                                            {a.author[0].toUpperCase()}
                                        </div>
                                        <span className="text-indigo-400 font-medium">{a.author}</span>
                                        <span>·</span>
                                        <span>{formatDate(a.createdAt)}</span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
