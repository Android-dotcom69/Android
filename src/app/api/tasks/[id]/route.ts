import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const task = await Task.findByIdAndUpdate(id, body, { new: true });
        if (!task) return Response.json({ message: "Task not found" }, { status: 404 });
        return Response.json(task);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) return Response.json({ message: "Task not found" }, { status: 404 });
        return Response.json({ message: "Task deleted" });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to delete task" }, { status: 500 });
    }
}
