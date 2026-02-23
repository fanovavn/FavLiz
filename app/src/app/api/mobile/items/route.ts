import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors, generateSlug } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/items — List items
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const sort = searchParams.get("sort") || "newest";
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "20");
        const listId = searchParams.get("listId");
        const tagId = searchParams.get("tagId");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { userId };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (listId) {
            where.lists = { some: { id: listId } };
        }
        if (tagId) {
            where.tags = { some: { id: tagId } };
        }

        const orderBy = sort === "oldest" ? { createdAt: "asc" as const }
            : sort === "az" ? { title: "asc" as const }
                : sort === "za" ? { title: "desc" as const }
                    : { createdAt: "desc" as const };

        const [items, total] = await Promise.all([
            prisma.item.findMany({
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true, title: true, description: true, thumbnail: true,
                    viewMode: true, createdAt: true,
                    tags: { select: { id: true, name: true } },
                    lists: { select: { id: true, name: true } },
                    _count: { select: { attachments: true } },
                },
            }),
            prisma.item.count({ where }),
        ]);

        return corsResponse({
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (err) {
        console.error("Get items error:", err);
        return corsError("Failed to fetch items", 500);
    }
}

// POST /api/mobile/items — Create item
export async function POST(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const body = await request.json();
        const { title, description, thumbnail, viewMode, tagNames, listIds, attachments } = body;

        if (!title?.trim()) {
            return corsError("Title is required", 400);
        }

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
                lists: { connect: (listIds || []).map((id: string) => ({ id })) },
                attachments: {
                    create: validAttachments.map((a: { type: string; url: string }) => ({
                        type: a.type || "LINK",
                        url: a.url.trim(),
                    })),
                },
            },
            select: {
                id: true, title: true, viewMode: true, createdAt: true,
            },
        });

        return corsResponse(item, 201);
    } catch (err) {
        console.error("Create item error:", err);
        return corsError("Failed to create item", 500);
    }
}
