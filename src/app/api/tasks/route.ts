import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const query = projectId ? { projectId } : {};
        const tasks = await Task.find(query);
        return Response.json(tasks);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const task = await Task.create(body);
        return Response.json(task, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to create task" }, { status: 500 });
    }
}
