import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/profile — Get user profile
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, name: true, username: true,
                avatar: true, themeColor: true, itemsLabel: true, language: true,
            },
        });

        if (!profile) return corsError("User not found", 404);
        return corsResponse(profile);
    } catch {
        return corsError("Failed to fetch profile", 500);
    }
}

// PUT /api/mobile/profile — Update profile
export async function PUT(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const body = await request.json();
        const { name, username, themeColor, itemsLabel, language } = body;

        // Validate username if provided
        if (username !== undefined && username !== null) {
            const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;
            if (!USERNAME_REGEX.test(username)) {
                return corsError("Username must be 3-30 characters, lowercase letters, numbers, dots, hyphens, underscores only", 400);
            }
            const existingUser = await prisma.user.findFirst({
                where: { username, id: { not: userId } },
            });
            if (existingUser) {
                return corsError("Username already taken", 409);
            }
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(username !== undefined && { username }),
                ...(themeColor !== undefined && { themeColor }),
                ...(itemsLabel !== undefined && { itemsLabel }),
                ...(language !== undefined && { language }),
            },
            select: {
                id: true, email: true, name: true, username: true,
                avatar: true, themeColor: true, itemsLabel: true, language: true,
            },
        });

        return corsResponse(updated);
    } catch (err) {
        console.error("Update profile error:", err);
        return corsError("Failed to update profile", 500);
    }
}
