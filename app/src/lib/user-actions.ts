"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
            onboardingComplete: true,
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

// ─── ONBOARDING ─────────────────────────────────────────────

export async function completeOnboarding(data: {
    name?: string;
    itemsLabel?: string;
    themeColor?: string;
}) {
    const userId = await getAuthUserId();

    const updateData: Record<string, unknown> = {
        onboardingComplete: true,
    };

    if (data.name && data.name.trim()) {
        updateData.name = data.name.trim();
    }
    if (data.itemsLabel && data.itemsLabel.trim()) {
        updateData.itemsLabel = data.itemsLabel.trim();
    }
    if (data.themeColor) {
        updateData.themeColor = data.themeColor;
    }

    // Auto-generate username slug from name if user doesn't have one yet
    if (data.name && data.name.trim()) {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        if (!currentUser?.username) {
            const slug = generateUsernameSlug(data.name.trim());
            // Try to find a unique username (retry with new suffix if collision)
            let username = slug;
            let attempts = 0;
            while (attempts < 5) {
                const existing = await prisma.user.findUnique({
                    where: { username },
                });
                if (!existing) break;
                // Collision — regenerate with a new random suffix
                username = generateUsernameSlug(data.name.trim());
                attempts++;
            }
            if (attempts < 5) {
                updateData.username = username;
            }
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });

    // Force layout to re-fetch user data (themeColor, itemsLabel, etc.)
    revalidatePath("/", "layout");

    return { success: true };
}

/**
 * Generate a username slug from a display name.
 * Strips Vietnamese diacritics, lowercases, replaces spaces with hyphens,
 * and appends a random 4-digit suffix.
 * e.g. "Đồng Tiến" → "dong-tien-3121"
 */
function generateUsernameSlug(name: string): string {
    const base = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // strip diacritics
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")     // non-alphanumeric → hyphen
        .replace(/^-|-$/g, "");           // trim leading/trailing hyphens

    const suffix = Math.floor(1000 + Math.random() * 9000); // random 4-digit number
    return base ? `${base}-${suffix}` : `user-${suffix}`;
}

