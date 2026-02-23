import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/tags/[id] — Get tag with items
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const tag = await prisma.tag.findFirst({
            where: { id, userId },
            select: {
                id: true, name: true, createdAt: true,
                items: {
                    select: {
                        id: true, title: true, thumbnail: true,
                        viewMode: true, createdAt: true,
                        tags: { select: { id: true, name: true } },
                        _count: { select: { attachments: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!tag) return corsError("Tag not found", 404);

        return corsResponse({
            id: tag.id,
            name: tag.name,
            createdAt: tag.createdAt,
            itemCount: tag.items.length,
            items: tag.items,
        });
    } catch (err) {
        console.error("Get tag error:", err);
        return corsError("Failed to fetch tag", 500);
    }
}

// DELETE /api/mobile/tags/[id] — Delete tag
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const existing = await prisma.tag.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!existing) return corsError("Tag not found", 404);

        await prisma.tag.delete({ where: { id } });
        return corsResponse({ message: "Tag deleted" });
    } catch (err) {
        console.error("Delete tag error:", err);
        return corsError("Failed to delete tag", 500);
    }
}
