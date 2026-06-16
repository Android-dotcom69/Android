import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import Member from "@/models/Member";
import { sendAnnouncementEmails } from "@/lib/email";

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

        // Send emails to all members with valid emails
        let emailSent = false;
        let emailCount = 0;
        let emailReason: string = "no_valid_emails";
        try {
            const members = await Member.find({ email: { $nin: ["", null] } });
            const recipients = members
                .filter((m) => m.email && m.email.trim() !== "")
                .map((m) => ({ name: m.name, email: m.email }));

            if (recipients.length === 0) {
                emailReason = "no_valid_emails";
            } else {
                const result = await sendAnnouncementEmails({
                    recipients,
                    title: announcement.title,
                    content: announcement.content,
                    author: announcement.author,
                    postedAt: announcement.createdAt,
                });
                emailSent = result.sent > 0;
                emailCount = result.sent;
                emailReason = result.reason;
            }
        } catch (emailErr) {
            console.error("[announcements/POST] Email error:", emailErr);
            emailReason = "error";
        }

        return Response.json(
            { ...announcement.toObject(), emailSent, emailCount, emailReason },
            { status: 201 }
        );
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to create announcement" }, { status: 500 });
    }
}
