type TaskCardProps = {
    title: string;
    description: string;
    priority: string;
    completion: boolean;
    assignee?: string;
    dueDate?: string;
    status?: string;
    onMoveForward?: () => void;
    onMoveBack?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
};

const TaskCard = ({
    title,
    description,
    priority,
    assignee,
    dueDate,
    status,
    onMoveForward,
    onMoveBack,
    onDelete,
    onEdit,
}: TaskCardProps) => {
    const bgClass =
        priority.toLowerCase() === "high"
            ? "bg-red-400"
            : priority.toLowerCase() === "medium"
            ? "bg-yellow-400"
            : "bg-green-400";

    const isOverdue = dueDate && new Date(dueDate) < new Date();

    const initials = assignee
        ? assignee.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : null;

    const formattedDate = dueDate
        ? new Date(dueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : null;

    return (
        <div
            className={`flex w-full flex-col rounded-2xl overflow-hidden ${bgClass} ${
                isOverdue ? "border-4 border-red-600" : "border-2 border-black"
            }`}
        >
            {/* Header */}
            <div className="bg-black p-3 text-lg font-bold text-teal-200 flex justify-between items-center gap-2">
                <h2 className="truncate">{title}</h2>
                {initials && (
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 text-black text-xs font-bold flex items-center justify-center">
                        {initials}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col gap-2">
                <div className="rounded-xl border border-black bg-teal-200 p-3 text-sm break-words">
                    {description}
                </div>

                {assignee && (
                    <p className="text-xs text-black font-medium">
                        Assigned to: <span className="font-bold">{assignee}</span>
                    </p>
                )}

                {formattedDate && (
                    <div className="flex items-center gap-2">
                        {isOverdue && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                OVERDUE
                            </span>
                        )}
                        <p className={`text-xs font-semibold ${isOverdue ? "text-red-800" : "text-black"}`}>
                            Due: {formattedDate}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center px-3 pb-3 gap-2">
                <div className="flex gap-2">
                    {onMoveBack && (
                        <button
                            onClick={onMoveBack}
                            title="Move back"
                            className="px-2 py-1 bg-black text-teal-200 text-xs font-bold rounded-lg hover:bg-neutral-800"
                        >
                            ← Back
                        </button>
                    )}
                    {onMoveForward && (
                        <button
                            onClick={onMoveForward}
                            title="Move forward"
                            className="px-2 py-1 bg-black text-teal-200 text-xs font-bold rounded-lg hover:bg-neutral-800"
                        >
                            {status === "in-progress" ? "Done →" : "Start →"}
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            title="Edit task"
                            className="px-2 py-1 bg-neutral-700 text-white text-xs font-bold rounded-lg hover:bg-neutral-600"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            title="Delete task"
                            className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
