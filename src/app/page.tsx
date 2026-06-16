import Navbar from "@/components/Navbar";
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
        month: "long",
        year: "numeric",
    });
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
        <div>
            <Navbar />

            {/* Hero */}
            <div className="flex flex-wrap items-center justify-center m-3">
                <div className="max-w-xl">
                    <h1 className="text-9xl font-bold text-teal-200 mx-18 mt-18 text-outline-black">
                        devChart
                    </h1>
                    <div className="mx-18 font-medium text-2xl mt-5">
                        <h3>An easy tool for managing your tasks and collaborating with your team!!</h3>
                        <h2>Have a Nice Time Building...</h2>
                    </div>
                </div>
                <img src="/logo.svg" alt="Logo" className="w-xl h-auto mx-auto my-6" />
            </div>

            {/* Latest Announcements */}
            <div className="max-w-3xl mx-auto px-6 pb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-teal-200">Latest Announcements</h2>
                    <Link href="/announcements">
                        <span className="text-sm text-teal-400 hover:text-teal-300 font-medium">
                            View all →
                        </span>
                    </Link>
                </div>

                {latest.length === 0 ? (
                    <div className="bg-black border border-neutral-800 rounded-xl p-6 text-center">
                        <p className="text-gray-500 text-sm">No announcements yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {latest.map((a) => (
                            <div
                                key={a._id}
                                className="bg-black border border-neutral-700 rounded-xl p-5 hover:border-teal-800 transition-colors"
                            >
                                <h3 className="text-white font-bold text-base mb-1">{a.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
                                    {a.content}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-5 h-5 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                        {a.author[0].toUpperCase()}
                                    </div>
                                    <span className="text-teal-400 font-medium">{a.author}</span>
                                    <span>·</span>
                                    <span>{formatDate(a.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
