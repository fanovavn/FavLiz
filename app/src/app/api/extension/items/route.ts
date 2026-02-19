import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getExtensionUserId, corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// ─── Slug Generator ──────────────────────────────────────────
function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50)
        .replace(/^-|-$/g, "");
    const suffix = Math.random().toString(36).slice(2, 10);
    return `${base}-${suffix}`;
}

// POST /api/extension/items — Create item
export async function POST(request: NextRequest) {
    const { userId, error: authError } = await getExtensionUserId(request);
    if (!userId) {
        return corsError(authError || "Unauthorized", 401);
    }

    try {
        const body = await request.json();
        const { title, description, thumbnail, viewMode, tagNames, listIds, attachments } = body;

        if (!title?.trim()) {
            return corsError("Title is required", 400);
        }

        // Enforce max 10 attachments
        const validAttachments = (attachments || [])
            .filter((a: { url?: string }) => a.url?.trim())
            .slice(0, 10);

        // Upsert tags
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

        const item = await prisma.item.create({
            data: {
                title: title.trim(),
                description: description || null,
                thumbnail: thumbnail || null,
                viewMode: viewMode || "PRIVATE",
                shareSlug: viewMode === "PUBLIC" ? generateSlug(title) : null,
                userId,
                tags: { connect: tagConnections },
                lists: {
                    connect: (listIds || []).map((id: string) => ({ id })),
                },
                attachments: {
                    create: validAttachments.map((a: { type: string; url: string }) => ({
                        type: a.type || "LINK",
                        url: a.url.trim(),
                    })),
                },
            },
        });

        return corsResponse({ id: item.id, message: "Item saved successfully" }, 201);
    } catch (err) {
        console.error("Extension createItem error:", err);
        return corsError("Failed to create item", 500);
    }
}
