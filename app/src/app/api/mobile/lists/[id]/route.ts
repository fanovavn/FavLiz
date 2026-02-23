import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors, generateSlug } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/lists/[id] — Get list detail with items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const list = await prisma.list.findFirst({
            where: { id, userId },
            select: {
                id: true, name: true, description: true, thumbnail: true,
                viewMode: true, shareSlug: true, isDefault: true,
                sortMode: true, itemOrder: true, createdAt: true, updatedAt: true,
                items: {
                    select: {
                        id: true, title: true, thumbnail: true, viewMode: true, createdAt: true,
                        tags: { select: { id: true, name: true } },
                        _count: { select: { attachments: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!list) return corsError("List not found", 404);

        // Reorder items if custom sort
        let orderedItems = list.items;
        if (list.sortMode === "CUSTOM" && list.itemOrder.length > 0) {
            const orderMap = new Map(list.itemOrder.map((id, idx) => [id, idx]));
            orderedItems = [...list.items].sort((a, b) => {
                const aIdx = orderMap.get(a.id) ?? 999;
                const bIdx = orderMap.get(b.id) ?? 999;
                return aIdx - bIdx;
            });
        }

        return corsResponse({
            ...list,
            itemOrder: undefined,
            items: orderedItems,
            itemCount: list.items.length,
        });
    } catch (err) {
        console.error("Get list error:", err);
        return corsError("Failed to fetch list", 500);
    }
}

// PUT /api/mobile/lists/[id] — Update list
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const existing = await prisma.list.findFirst({
            where: { id, userId },
            select: { id: true, viewMode: true, shareSlug: true },
        });
        if (!existing) return corsError("List not found", 404);

        const body = await request.json();
        const { name, description, thumbnail, viewMode } = body;

        let shareSlug = existing.shareSlug;
        if (viewMode === "PUBLIC" && !shareSlug) {
            shareSlug = generateSlug(name || "list");
        } else if (viewMode === "PRIVATE") {
            shareSlug = null;
        }

        const updated = await prisma.list.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(description !== undefined && { description }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(viewMode !== undefined && { viewMode, shareSlug }),
            },
            select: { id: true, name: true, viewMode: true, updatedAt: true },
        });

        return corsResponse(updated);
    } catch (err) {
        console.error("Update list error:", err);
        return corsError("Failed to update list", 500);
    }
}

// DELETE /api/mobile/lists/[id] — Delete list
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const existing = await prisma.list.findFirst({
            where: { id, userId },
            select: { id: true, isDefault: true },
        });
        if (!existing) return corsError("List not found", 404);
        if (existing.isDefault) return corsError("Cannot delete default list", 400);

        await prisma.list.delete({ where: { id } });
        return corsResponse({ message: "List deleted" });
    } catch (err) {
        console.error("Delete list error:", err);
        return corsError("Failed to delete list", 500);
    }
}
