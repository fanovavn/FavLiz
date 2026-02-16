"use server";

import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { signJWT, verifyJWT, comparePassword, type AdminPayload } from "./auth";

const COOKIE_NAME = "admin_session";

export async function login(
    username: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const admin = await prisma.adminUser.findUnique({
            where: { username },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!admin || !admin.isActive) {
            return { success: false, error: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa" };
        }

        const valid = await comparePassword(password, admin.password);
        if (!valid) {
            return { success: false, error: "Mật khẩu không chính xác" };
        }

        // Flatten permissions from all assigned roles
        const permSet = new Set<string>();
        const roleNames: string[] = [];
        for (const ur of admin.roles) {
            roleNames.push(ur.role.name);
            for (const rp of ur.role.permissions) {
                permSet.add(`${rp.permission.resource}.${rp.permission.action}`);
            }
        }

        const token = signJWT({
            id: admin.id,
            username: admin.username,
            isRoot: admin.isRoot,
            name: admin.name,
            permissions: Array.from(permSet),
            roles: roleNames,
        });

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Đã xảy ra lỗi, vui lòng thử lại" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<AdminPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
}
