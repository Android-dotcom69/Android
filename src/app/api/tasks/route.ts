import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import Member from "@/models/Member";
import Project from "@/models/Project";
import { sendTaskAssignmentEmail } from "@/lib/email";

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

        // Send assignment email if a member is assigned
        let emailSent = false;
        if (body.assignee && body.assignee !== "") {
            try {
                const [member, project] = await Promise.all([
                    Member.findOne({ name: body.assignee }),
                    body.projectId ? Project.findById(body.projectId) : null,
                ]);
                if (member?.email) {
                    emailSent = await sendTaskAssignmentEmail({
                        toEmail: member.email,
                        toName: member.name,
                        taskTitle: body.title,
                        taskDescription: body.description,
                        taskPriority: body.priority,
                        taskDueDate: body.dueDate,
                        projectName: project?.name ?? "General",
                    });
                }
            } catch (emailErr) {
                console.error("[tasks/POST] Email lookup error:", emailErr);
            }
        }

        return Response.json({ ...task.toObject(), emailSent }, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ message: "Failed to create task" }, { status: 500 });
    }
}
