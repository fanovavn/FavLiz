import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExtensionUserId, corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/extension/lists — Get user's lists
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getExtensionUserId(request);
    if (!userId) {
        return corsError(authError || "Unauthorized", 401);
    }

    try {
        const lists = await prisma.list.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                isDefault: true,
                _count: { select: { items: true } },
            },
            orderBy: [
                { isDefault: "desc" },
                { name: "asc" },
            ],
        });

        return corsResponse(
            lists.map((l) => ({
                id: l.id,
                name: l.name,
                isDefault: l.isDefault,
                itemCount: l._count.items,
            }))
        );
    } catch {
        return corsError("Failed to fetch lists", 500);
    }
}

// POST /api/extension/lists — Create new list
export async function POST(request: NextRequest) {
    const { userId, error: authError } = await getExtensionUserId(request);
    if (!userId) {
        return corsError(authError || "Unauthorized", 401);
    }

    try {
        const body = await request.json();
        const { name } = body;

        if (!name?.trim()) {
            return corsError("List name is required", 400);
        }

        const list = await prisma.list.create({
            data: {
                name: name.trim(),
                userId,
                viewMode: "PRIVATE",
            },
        });

        return corsResponse({ id: list.id, name: list.name }, 201);
    } catch {
        return corsError("Failed to create list", 500);
    }
}
