// Central RBAC permission constants and checkers
import { getSession } from "./auth-actions";

export const RESOURCES = ["users", "items", "lists", "tags", "admins", "roles"] as const;
export const ACTIONS = ["read", "write", "delete"] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = (typeof ACTIONS)[number];
export type PermissionKey = `${Resource}.${Action}`;

export const RESOURCE_LABELS: Record<Resource, string> = {
    users: "Người dùng",
    items: "Items",
    lists: "Bộ sưu tập",
    tags: "Tags",
    admins: "Quản trị viên",
    roles: "Phân quyền",
};

export const ACTION_LABELS: Record<Action, string> = {
    read: "Xem",
    write: "Tạo / Sửa",
    delete: "Xóa",
};

export function hasPermission(
    permissions: string[],
    resource: Resource,
    action: Action
): boolean {
    return permissions?.includes(`${resource}.${action}`) ?? false;
}

export async function requirePermission(
    resource: Resource,
    action: Action
): Promise<ReturnType<typeof getSession> extends Promise<infer T> ? NonNullable<T> : never> {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized: No session");
    }
    if (!session.isRoot && !hasPermission(session.permissions, resource, action)) {
        throw new Error(`Forbidden: Missing permission ${resource}.${action}`);
    }
    return session as Awaited<ReturnType<typeof requirePermission>>;
}
