import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExtensionUserId, corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/extension/profile — Get user profile
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getExtensionUserId(request);
    if (!userId) {
        return corsError(authError || "Unauthorized", 401);
    }

    try {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                avatar: true,
                themeColor: true,
                itemsLabel: true,
            },
        });

        if (!profile) {
            return corsError("User not found", 404);
        }

        return corsResponse(profile);
    } catch {
        return corsError("Failed to fetch profile", 500);
    }
}
