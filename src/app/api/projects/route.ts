import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET() {
    try {
        await connectDB();
        const projects = await Project.find().sort({ createdAt: -1 });
        return Response.json(projects);
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const project = await Project.create(body);
        return Response.json(project, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to create project" }, { status: 500 });
    }
}
