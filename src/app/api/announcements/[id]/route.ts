import connectDB from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const announcement = await Announcement.findByIdAndUpdate(id, body, { new: true });
        if (!announcement) return Response.json({ message: "Not found" }, { status: 404 });
        return Response.json(announcement);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to update announcement" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const announcement = await Announcement.findByIdAndDelete(id);
        if (!announcement) return Response.json({ message: "Not found" }, { status: 404 });
        return Response.json({ message: "Deleted" });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to delete announcement" }, { status: 500 });
    }
}
