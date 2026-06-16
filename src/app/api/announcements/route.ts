import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export async function GET() {
    try {
        await connectDB();
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        return Response.json(announcements);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to fetch announcements" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const announcement = await Announcement.create(body);
        return Response.json(announcement, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to create announcement" }, { status: 500 });
    }
}
