import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import Link from "next/link";

type AnnouncementDoc = {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt: Date;
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ── Nav card config ────────────────────────────────────────────────────────
const NAV_CARDS = [
    {
        href: "/dashboard",
        label: "Dashboard",
        desc: "All tasks across every project",
        iconBg: "bg-indigo-500/15 border-indigo-500/25",
        iconColor: "text-indigo-400",
        hoverBorder: "hover:border-indigo-500/50",
        hoverBg: "hover:bg-indigo-500/5",
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1.5"/>
                <rect x="14" y="3" width="7" height="5" rx="1.5"/>
                <rect x="14" y="12" width="7" height="9" rx="1.5"/>
                <rect x="3" y="16" width="7" height="5" rx="1.5"/>
            </svg>
        ),
    },
    {
        href: "/projects",
        label: "Projects",
        desc: "Kanban boards for every initiative",
        iconBg: "bg-violet-500/15 border-violet-500/25",
        iconColor: "text-violet-400",
        hoverBorder: "hover:border-violet-500/50",
        hoverBg: "hover:bg-violet-500/5",
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h3.5L10 7h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
            </svg>
        ),
    },
    {
        href: "/members",
        label: "Members",
        desc: "Team roster and workload",
        iconBg: "bg-sky-500/15 border-sky-500/25",
        iconColor: "text-sky-400",
        hoverBorder: "hover:border-sky-500/50",
        hoverBg: "hover:bg-sky-500/5",
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    {
        href: "/announcements",
        label: "Announcements",
        desc: "Club-wide posts and updates",
        iconBg: "bg-amber-500/15 border-amber-500/25",
        iconColor: "text-amber-400",
        hoverBorder: "hover:border-amber-500/50",
        hoverBg: "hover:bg-amber-500/5",
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
        ),
    },
    {
        href: "/analytics",
        label: "Analytics",
        desc: "Progress, workload and insights",
        iconBg: "bg-emerald-500/15 border-emerald-500/25",
        iconColor: "text-emerald-400",
        hoverBorder: "hover:border-emerald-500/50",
        hoverBg: "hover:bg-emerald-500/5",
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
        ),
    },
];

// ── Notepad logo ───────────────────────────────────────────────────────────
function NotepadLogo({ size = 40 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="8" width="28" height="30" rx="3" fill="#4f46e5" opacity="0.15" stroke="#6366f1" strokeWidth="1.5"/>
            <circle cx="13" cy="8" r="2.5" fill="#020617" stroke="#6366f1" strokeWidth="1.5"/>
            <circle cx="20" cy="8" r="2.5" fill="#020617" stroke="#6366f1" strokeWidth="1.5"/>
            <circle cx="27" cy="8" r="2.5" fill="#020617" stroke="#6366f1" strokeWidth="1.5"/>
            <rect x="10" y="16" width="5" height="5" rx="1" stroke="#6366f1" strokeWidth="1.4" fill="#4f46e5" fillOpacity="0.2"/>
            <polyline points="11,18.5 12.5,20 14.5,17" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18" y1="18.5" x2="30" y2="18.5" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="10" y="24" width="5" height="5" rx="1" stroke="#6366f1" strokeWidth="1.4" fill="#4f46e5" fillOpacity="0.2"/>
            <polyline points="11,26.5 12.5,28 14.5,25" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18" y1="26.5" x2="30" y2="26.5" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="10" y="32" width="5" height="5" rx="1" stroke="#334155" strokeWidth="1.4"/>
            <line x1="18" y1="34.5" x2="26" y2="34.5" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
}

export default async function Home() {
    await connectDB();
    const raw = await Announcement.find().sort({ createdAt: -1 }).limit(3).lean();
    const latest = raw.map((a) => ({
        _id: String((a as { _id: unknown })._id),
        title: (a as AnnouncementDoc).title,
        content: (a as AnnouncementDoc).content,
        author: (a as AnnouncementDoc).author,
        createdAt: (a as AnnouncementDoc).createdAt,
    }));

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center">

            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="flex items-center gap-3 px-8 py-6 w-full justify-center">
                <NotepadLogo size={36} />
                <span className="text-slate-100 font-bold text-xl tracking-tight">devChart</span>
            </header>

            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="flex flex-col items-center text-center px-6 pt-6 pb-14 max-w-3xl w-full">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight tracking-tight mb-5">
                    Built for clubs.{" "}
                    <br className="hidden sm:block" />
                    <span className="text-indigo-400">Designed for impact.</span>
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
                    One place for every project, every task, and every member — so your club actually moves forward.
                </p>
            </section>

            {/* ── Nav cards ──────────────────────────────────────────── */}
            <section className="px-6 pb-16 w-full max-w-3xl">
                <div className="flex flex-wrap justify-center gap-4">
                    {NAV_CARDS.map((card) => (
                        <Link key={card.href} href={card.href} className="w-full sm:w-56">
                            <div className={`h-full group flex flex-col items-center text-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-7 cursor-pointer transition-all duration-200 ${card.hoverBorder} ${card.hoverBg}`}>
                                {/* Icon circle */}
                                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${card.iconBg} ${card.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                                    {card.icon}
                                </div>
                                {/* Text */}
                                <div>
                                    <p className={`font-semibold text-base text-slate-100 transition-colors duration-200 ${card.iconColor.replace("text-", "group-hover:text-")}`}>
                                        {card.label}
                                    </p>
                                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                                {/* Arrow */}
                                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-slate-700 group-hover:text-slate-400 transition-colors duration-200">
                                    Open
                                    <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Latest Announcements ───────────────────────────────── */}
            {latest.length > 0 && (
                <section className="px-6 pb-16 w-full max-w-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Latest Announcements
                        </h2>
                        <Link href="/announcements">
                            <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                View all →
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        {latest.map((a) => (
                            <div key={a._id} className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 hover:border-slate-700 transition-colors">
                                <h3 className="text-slate-100 font-semibold text-sm mb-1">{a.title}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{a.content}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0 text-[10px]">
                                        {a.author[0].toUpperCase()}
                                    </div>
                                    <span className="text-indigo-400 font-medium">{a.author}</span>
                                    <span>·</span>
                                    <span>{formatDate(a.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
