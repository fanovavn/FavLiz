import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExtensionUserId, corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/extension/tags — Get user's tags
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getExtensionUserId(request);
    if (!userId) {
        return corsError(authError || "Unauthorized", 401);
    }

    try {
        const tags = await prisma.tag.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                _count: { select: { items: true } },
            },
            orderBy: { name: "asc" },
        });

        return corsResponse(
            tags.map((t) => ({
                id: t.id,
                name: t.name,
                itemCount: t._count.items,
            }))
        );
    } catch {
        return corsError("Failed to fetch tags", 500);
    }
}
