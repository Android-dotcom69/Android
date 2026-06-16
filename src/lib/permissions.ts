/*
 * PROTOTYPE ROLE SYSTEM
 * ---------------------
 * This is a UI-layer permission system for demonstration purposes.
 * It uses a localStorage-persisted "current user" selector — not real authentication.
 * In production, this would be replaced by a proper auth solution (e.g. NextAuth, Clerk)
 * with server-side session validation on every API route.
 */

export type Role = "head" | "member";

const PERMISSIONS: Record<Role, string[]> = {
    head: [
        "task:create",
        "task:edit",
        "task:delete",
        "task:move-any",
        "project:create",
        "project:edit",
        "project:delete",
        "announcement:create",
        "announcement:edit",
        "announcement:delete",
        "members:manage",
        "analytics:view",
    ],
    member: [
        "task:move-own",
        "analytics:view",
    ],
};

export function can(role: Role | undefined | null, action: string): boolean {
    if (!role) return false;
    return PERMISSIONS[role]?.includes(action) ?? false;
}

export function canMoveTask(
    role: Role | undefined | null,
    taskAssignee: string | undefined,
    currentUserName: string
): boolean {
    if (!role) return false;
    if (role === "head") return true;
    return !!(taskAssignee && taskAssignee === currentUserName);
}
