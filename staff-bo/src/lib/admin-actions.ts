"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth-actions";
import { hashPassword } from "./auth";
import { requirePermission } from "./permissions";

// ─── DASHBOARD ──────────────────────────────────────────────
export async function getDashboardStats() {
    const [usersCount, itemsCount, listsCount, tagsCount, publicItems, adminsCount] = await Promise.all([
        prisma.user.count(),
        prisma.item.count(),
        prisma.list.count(),
        prisma.tag.count(),
        prisma.item.count({ where: { viewMode: "PUBLIC" } }),
        prisma.adminUser.count({ where: { isActive: true } }),
    ]);

    return { usersCount, itemsCount, listsCount, tagsCount, publicItems, adminsCount };
}

export async function getRecentUsers(limit = 10) {
    return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
            _count: { select: { items: true, lists: true } },
        },
    });
}

export async function getRecentItems(limit = 10) {
    return prisma.item.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            title: true,
            viewMode: true,
            createdAt: true,
            user: { select: { email: true, name: true } },
        },
    });
}

// ─── USERS MANAGEMENT ──────────────────────────────────────
export async function getUsers(page = 1, search = "", limit = 20) {
    await requirePermission("users", "read");

    const where = search
        ? {
            OR: [
                { email: { contains: search, mode: "insensitive" as const } },
                { name: { contains: search, mode: "insensitive" as const } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                isActive: true,
                createdAt: true,
                _count: { select: { items: true, lists: true, tags: true } },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return { users, total, pages: Math.ceil(total / limit) };
}

export async function toggleUserStatus(userId: string) {
    await requirePermission("users", "write");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };

    await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
    });

    return { success: true };
}

// ─── ITEMS MANAGEMENT ──────────────────────────────────────
export async function getItems(page = 1, search = "", visibility = "", limit = 20) {
    await requirePermission("items", "read");

    const where: Record<string, unknown> = {};
    if (search) {
        where.title = { contains: search, mode: "insensitive" };
    }
    if (visibility === "PUBLIC" || visibility === "PRIVATE") {
        where.viewMode = visibility;
    }

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                viewMode: true,
                createdAt: true,
                user: { select: { email: true, name: true } },
                tags: { select: { name: true } },
                _count: { select: { attachments: true } },
            },
        }),
        prisma.item.count({ where }),
    ]);

    return { items, total, pages: Math.ceil(total / limit) };
}

// ─── LISTS MANAGEMENT ──────────────────────────────────────
export async function getLists(page = 1, search = "", limit = 20) {
    await requirePermission("lists", "read");

    const where = search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {};

    const [lists, total] = await Promise.all([
        prisma.list.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                description: true,
                viewMode: true,
                createdAt: true,
                user: { select: { email: true, name: true } },
                _count: { select: { items: true } },
            },
        }),
        prisma.list.count({ where }),
    ]);

    return { lists, total, pages: Math.ceil(total / limit) };
}

// ─── TAGS MANAGEMENT ───────────────────────────────────────
export async function getTags(page = 1, search = "", limit = 20) {
    await requirePermission("tags", "read");

    const where = search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {};

    const [tags, total] = await Promise.all([
        prisma.tag.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                createdAt: true,
                user: { select: { email: true, name: true } },
                _count: { select: { items: true } },
            },
        }),
        prisma.tag.count({ where }),
    ]);

    return { tags, total, pages: Math.ceil(total / limit) };
}

// ─── ADMIN MANAGEMENT ──────────────────────────────────────
export async function getAdmins() {
    await requirePermission("admins", "read");

    const admins = await prisma.adminUser.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            username: true,
            name: true,
            isRoot: true,
            isActive: true,
            createdAt: true,
            createdBy: true,
            roles: {
                include: { role: { select: { id: true, name: true, slug: true } } },
            },
        },
    });

    return { admins };
}

export async function createAdmin(data: {
    username: string;
    password: string;
    name: string;
    roleIds: string[];
}) {
    await requirePermission("admins", "write");

    const existing = await prisma.adminUser.findUnique({
        where: { username: data.username },
    });
    if (existing) {
        return { success: false, error: "Username đã tồn tại" };
    }

    const session = await getSession();
    const hashed = await hashPassword(data.password);
    await prisma.adminUser.create({
        data: {
            username: data.username,
            password: hashed,
            name: data.name,
            createdBy: session?.id,
            roles: {
                create: data.roleIds.map((roleId) => ({ roleId })),
            },
        },
    });

    return { success: true };
}

export async function toggleAdminStatus(adminId: string) {
    await requirePermission("admins", "write");

    const session = await getSession();
    if (adminId === session?.id) {
        return { success: false, error: "Không thể vô hiệu hóa chính mình" };
    }

    const admin = await prisma.adminUser.findUnique({
        where: { id: adminId },
    });
    if (!admin) return { success: false, error: "Admin not found" };
    if (admin.isRoot) {
        return { success: false, error: "Không thể vô hiệu hóa Root Admin" };
    }

    await prisma.adminUser.update({
        where: { id: adminId },
        data: { isActive: !admin.isActive },
    });

    return { success: true };
}

export async function deleteAdmin(adminId: string) {
    await requirePermission("admins", "delete");

    const session = await getSession();
    if (adminId === session?.id) {
        return { success: false, error: "Không thể xóa chính mình" };
    }

    const admin = await prisma.adminUser.findUnique({
        where: { id: adminId },
    });
    if (!admin) return { success: false, error: "Admin not found" };
    if (admin.isRoot) {
        return { success: false, error: "Không thể xóa Root Admin" };
    }

    await prisma.adminUser.delete({ where: { id: adminId } });
    return { success: true };
}

// ─── ROLES MANAGEMENT ──────────────────────────────────────
export async function getRoles() {
    await requirePermission("roles", "read");

    const roles = await prisma.adminRole.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            permissions: {
                include: { permission: true },
            },
            _count: { select: { users: true } },
        },
    });

    return { roles };
}

export async function getAllPermissions() {
    await requirePermission("roles", "read");

    return prisma.permission.findMany({
        orderBy: [{ resource: "asc" }, { action: "asc" }],
    });
}

export async function getAllRolesSimple() {
    // Lightweight role list for dropdowns (just need admins.read)
    await requirePermission("admins", "read");

    return prisma.adminRole.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
    });
}

export async function createRole(data: {
    name: string;
    slug: string;
    description: string;
    permissionIds: string[];
}) {
    await requirePermission("roles", "write");

    const existing = await prisma.adminRole.findUnique({
        where: { slug: data.slug },
    });
    if (existing) {
        return { success: false, error: "Slug đã tồn tại" };
    }

    await prisma.adminRole.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            permissions: {
                create: data.permissionIds.map((permissionId) => ({ permissionId })),
            },
        },
    });

    return { success: true };
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
    await requirePermission("roles", "write");

    const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!role) return { success: false, error: "Role not found" };

    // Replace all permissions
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
    });

    return { success: true };
}

export async function deleteRole(roleId: string) {
    await requirePermission("roles", "delete");

    const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!role) return { success: false, error: "Role not found" };
    if (role.isSystem) {
        return { success: false, error: "Không thể xóa role hệ thống" };
    }

    await prisma.adminRole.delete({ where: { id: roleId } });
    return { success: true };
}
