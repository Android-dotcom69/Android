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

const PRIORITY: Record<string, { dot: string; badge: string }> = {
    high:   { dot: "bg-red-500",     badge: "bg-red-500/10 text-red-400 border-red-500/20"     },
    medium: { dot: "bg-amber-500",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    low:    { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function TaskCard({
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
}: TaskCardProps) {
    const p = priority.toLowerCase();
    const pStyle = PRIORITY[p] ?? PRIORITY.low;

    const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "done";

    const initials = assignee
        ? assignee.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : null;

    const formattedDate = dueDate
        ? new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : null;

    const hasActions = onMoveBack || onMoveForward || onEdit || onDelete;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-600 transition-colors">
            {/* Title row */}
            <div className="flex items-start gap-2.5">
                <div className={`mt-[5px] w-2 h-2 rounded-full shrink-0 ${pStyle.dot}`} />
                <h3 className="text-slate-100 font-medium text-sm leading-snug flex-1 min-w-0">{title}</h3>
                {initials && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <span className="text-indigo-300 text-xs font-bold">{initials}</span>
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 pl-[18px]">{description}</p>

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap pl-[18px]">
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${pStyle.badge}`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                </span>
                {assignee && (
                    <span className="text-slate-500 text-xs truncate max-w-[100px]">{assignee}</span>
                )}
                {formattedDate && (
                    <span className={`ml-auto text-xs font-medium shrink-0 ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
                        {isOverdue && "⚠ "}{formattedDate}
                    </span>
                )}
            </div>

            {/* Actions */}
            {hasActions && (
                <div className="flex items-center gap-1 pt-1 border-t border-slate-700/50">
                    <div className="flex gap-1 flex-1">
                        {onMoveBack && (
                            <button onClick={onMoveBack} className="text-xs px-2 py-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-md transition-colors">
                                ← Back
                            </button>
                        )}
                        {onMoveForward && (
                            <button onClick={onMoveForward} className="text-xs px-2 py-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-md transition-colors">
                                {status === "in-progress" ? "Done →" : "Start →"}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-1">
                        {onEdit && (
                            <button onClick={onEdit} className="text-xs px-2 py-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-md transition-colors">
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={onDelete} className="text-xs px-2 py-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
