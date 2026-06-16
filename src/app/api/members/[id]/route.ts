import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const member = await Member.findByIdAndUpdate(id, body, { new: true });
        if (!member) return Response.json({ message: "Member not found" }, { status: 404 });
        return Response.json(member);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to update member" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const member = await Member.findByIdAndDelete(id);
        if (!member) return Response.json({ message: "Member not found" }, { status: 404 });
        return Response.json({ message: "Member deleted" });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to delete member" }, { status: 500 });
    }
}
