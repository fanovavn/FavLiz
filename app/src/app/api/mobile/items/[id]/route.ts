import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors, generateSlug } from "../../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/items/[id] — Get single item
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const item = await prisma.item.findFirst({
            where: { id, userId },
            select: {
                id: true, title: true, description: true, thumbnail: true,
                viewMode: true, shareSlug: true, createdAt: true, updatedAt: true,
                tags: { select: { id: true, name: true } },
                lists: { select: { id: true, name: true } },
                attachments: {
                    select: { id: true, type: true, url: true, metadata: true },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!item) return corsError("Item not found", 404);
        return corsResponse(item);
    } catch (err) {
        console.error("Get item error:", err);
        return corsError("Failed to fetch item", 500);
    }
}

// PUT /api/mobile/items/[id] — Update item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        // Verify ownership
        const existing = await prisma.item.findFirst({
            where: { id, userId },
            select: { id: true, viewMode: true, shareSlug: true },
        });
        if (!existing) return corsError("Item not found", 404);

        const body = await request.json();
        const { title, description, thumbnail, viewMode, tagNames, listIds, attachments } = body;

        // Handle tags
        let tagConnect;
        if (tagNames !== undefined) {
            const tagConnections = await Promise.all(
                (tagNames || []).map(async (name: string) => {
                    const tag = await prisma.tag.upsert({
                        where: { name_userId: { name: name.trim(), userId } },
                        create: { name: name.trim(), userId },
                        update: {},
                    });
                    return { id: tag.id };
                })
            );
            tagConnect = { set: tagConnections };
        }

        // Handle lists
        let listConnect;
        if (listIds !== undefined) {
            listConnect = { set: (listIds || []).map((lid: string) => ({ id: lid })) };
        }

        // Handle attachments
        if (attachments !== undefined) {
            await prisma.attachment.deleteMany({ where: { itemId: id } });
        }

        // Handle share slug
        let shareSlug = existing.shareSlug;
        if (viewMode === "PUBLIC" && !shareSlug) {
            shareSlug = generateSlug(title || "item");
        } else if (viewMode === "PRIVATE") {
            shareSlug = null;
        }

        const updated = await prisma.item.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(description !== undefined && { description }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(viewMode !== undefined && { viewMode, shareSlug }),
                ...(tagConnect && { tags: tagConnect }),
                ...(listConnect && { lists: listConnect }),
                ...(attachments !== undefined && {
                    attachments: {
                        create: (attachments || [])
                            .filter((a: { url?: string }) => a.url?.trim())
                            .slice(0, 10)
                            .map((a: { type: string; url: string }) => ({
                                type: a.type || "LINK",
                                url: a.url.trim(),
                            })),
                    },
                }),
            },
            select: { id: true, title: true, viewMode: true, updatedAt: true },
        });

        return corsResponse(updated);
    } catch (err) {
        console.error("Update item error:", err);
        return corsError("Failed to update item", 500);
    }
}

// DELETE /api/mobile/items/[id] — Delete item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    const { id } = await params;

    try {
        const existing = await prisma.item.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!existing) return corsError("Item not found", 404);

        await prisma.item.delete({ where: { id } });
        return corsResponse({ message: "Item deleted" });
    } catch (err) {
        console.error("Delete item error:", err);
        return corsError("Failed to delete item", 500);
    }
}
