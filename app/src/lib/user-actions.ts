"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

async function getAuthUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await prisma.user.upsert({
        where: { id: user.id },
        create: {
            id: user.id,
            email: user.email || "",
            password: "__supabase_auth__",
        },
        update: {
            email: user.email || "",
        },
    });

    return user.id;
}

// ─── GET PROFILE ────────────────────────────────────────────

export async function getProfile() {
    const userId = await getAuthUserId();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            themeColor: true,
            itemsLabel: true,
            language: true,
        },
    });
    if (!user) redirect("/login");
    return user;
}

// ─── UPDATE PROFILE ─────────────────────────────────────────

const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;

export async function updateProfile(data: { username?: string; name?: string }) {
    const userId = await getAuthUserId();

    // Validate username
    if (data.username !== undefined) {
        const trimmed = data.username.trim().toLowerCase();

        if (trimmed === "") {
            // Allow clearing username
            await prisma.user.update({
                where: { id: userId },
                data: {
                    username: null,
                    name: data.name?.trim() || undefined,
                },
            });
            return { success: true };
        }

        if (!USERNAME_REGEX.test(trimmed)) {
            return {
                error: "Username chỉ được chứa chữ thường, số, dấu chấm, gạch ngang (3-30 ký tự).",
            };
        }

        // Check reserved words
        const reserved = ["admin", "share", "api", "login", "register", "dashboard", "settings", "items", "lists", "tags"];
        if (reserved.includes(trimmed)) {
            return { error: "Username này đã được sử dụng." };
        }

        // Check unique
        const existing = await prisma.user.findUnique({
            where: { username: trimmed },
        });
        if (existing && existing.id !== userId) {
            return { error: "Username đã được sử dụng bởi người khác." };
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                username: trimmed,
                name: data.name?.trim() || undefined,
            },
        });
        return { success: true };
    }

    // Only update name
    await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name?.trim() || undefined,
        },
    });
    return { success: true };
}

// ─── CHANGE PASSWORD ────────────────────────────────────────

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Chưa đăng nhập." };

    // Verify current password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
    });

    if (signInError) {
        return { error: "Mật khẩu hiện tại không đúng." };
    }

    // Validate new password
    if (data.newPassword.length < 6) {
        return { error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
    });

    if (updateError) {
        return { error: "Không thể đổi mật khẩu. Vui lòng thử lại." };
    }

    return { success: true };
}

// ─── THEME COLOR ────────────────────────────────────────────

export async function updateThemeColor(color: string | null) {
    const userId = await getAuthUserId();
    await prisma.user.update({
        where: { id: userId },
        data: { themeColor: color },
    });
    return { success: true };
}

// ─── ITEMS LABEL ────────────────────────────────────────────

export async function updateItemsLabel(label: string | null) {
    const userId = await getAuthUserId();

    if (label !== null) {
        const trimmed = label.trim();
        if (trimmed === "" || trimmed.toLowerCase() === "items") {
            // Reset to default
            await prisma.user.update({
                where: { id: userId },
                data: { itemsLabel: null },
            });
            return { success: true };
        }

        // Validate: max 4 words, each word <= 20 chars
        const words = trimmed.split(/\s+/);
        if (words.length > 4) {
            return { error: "Tối đa 4 từ." };
        }
        if (words.some((w) => w.length > 20)) {
            return { error: "Mỗi từ tối đa 20 ký tự." };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { itemsLabel: trimmed },
        });
        return { success: true };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { itemsLabel: null },
    });
    return { success: true };
}

export async function getItemsLabel(): Promise<string> {
    const userId = await getAuthUserId();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { itemsLabel: true },
    });
    return user?.itemsLabel || "Items";
}

// ─── LANGUAGE ───────────────────────────────────────────────

export async function updateLanguage(language: string) {
    const userId = await getAuthUserId();

    if (!SUPPORTED_LOCALES.includes(language as Locale)) {
        return { error: "Ngôn ngữ không hợp lệ." };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { language },
    });
    return { success: true };
}

export async function getLanguage(): Promise<Locale> {
    const userId = await getAuthUserId();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { language: true },
    });
    return (user?.language as Locale) || "vi";
}

