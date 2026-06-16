import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Task from "@/models/Tasks";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const project = await Project.findById(id);
        if (!project) return Response.json({ message: "Project not found" }, { status: 404 });
        return Response.json(project);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to fetch project" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) return Response.json({ message: "Project not found" }, { status: 404 });
        // Cascade delete all tasks belonging to this project
        await Task.deleteMany({ projectId: id });
        return Response.json({ message: "Project and its tasks deleted" });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to delete project" }, { status: 500 });
    }
}
