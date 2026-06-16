import connectDB from "@/lib/mongodb";
import Task from "@/models/Tasks";
import Member from "@/models/Member";
import Project from "@/models/Project";
import { sendTaskAssignmentEmail } from "@/lib/email";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // Capture old assignee only when the update includes an assignee field
        let oldAssignee: string | undefined;
        if (body.assignee !== undefined) {
            const oldTask = await Task.findById(id);
            oldAssignee = oldTask?.assignee ?? "";
        }

        const task = await Task.findByIdAndUpdate(id, body, { new: true });
        if (!task) return Response.json({ message: "Task not found" }, { status: 404 });

        // Send email only when assignee was explicitly changed to a new non-empty value
        let emailSent = false;
        const assigneeChanged =
            body.assignee !== undefined &&
            body.assignee !== "" &&
            body.assignee !== oldAssignee;

        if (assigneeChanged) {
            try {
                const [member, project] = await Promise.all([
                    Member.findOne({ name: body.assignee }),
                    task.projectId ? Project.findById(task.projectId) : null,
                ]);
                if (member?.email) {
                    emailSent = await sendTaskAssignmentEmail({
                        toEmail: member.email,
                        toName: member.name,
                        taskTitle: task.title,
                        taskDescription: task.description,
                        taskPriority: task.priority,
                        taskDueDate: task.dueDate?.toISOString(),
                        projectName: project?.name ?? "General",
                    });
                }
            } catch (emailErr) {
                console.error("[tasks/PATCH] Email lookup error:", emailErr);
            }
        }

        return Response.json({ ...task.toObject(), emailSent });
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
