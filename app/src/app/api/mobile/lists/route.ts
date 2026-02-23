import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors, generateSlug } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/lists — Get all lists
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const lists = await prisma.list.findMany({
            where: { userId },
            select: {
                id: true, name: true, description: true, thumbnail: true,
                viewMode: true, isDefault: true, createdAt: true,
                _count: { select: { items: true } },
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });

        return corsResponse(
            lists.map((l) => ({
                id: l.id, name: l.name, description: l.description,
                thumbnail: l.thumbnail, viewMode: l.viewMode,
                isDefault: l.isDefault, createdAt: l.createdAt,
                itemCount: l._count.items,
            }))
        );
    } catch {
        return corsError("Failed to fetch lists", 500);
    }
}

// POST /api/mobile/lists — Create list
export async function POST(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const body = await request.json();
        const { name, description, thumbnail, viewMode } = body;

        if (!name?.trim()) {
            return corsError("List name is required", 400);
        }

        const list = await prisma.list.create({
            data: {
                name: name.trim(),
                description: description || null,
                thumbnail: thumbnail || null,
                viewMode: viewMode || "PRIVATE",
                shareSlug: viewMode === "PUBLIC" ? generateSlug(name) : null,
                userId,
            },
            select: { id: true, name: true, viewMode: true, createdAt: true },
        });

        return corsResponse(list, 201);
    } catch {
        return corsError("Failed to create list", 500);
    }
}
