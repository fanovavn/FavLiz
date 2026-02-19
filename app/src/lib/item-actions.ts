"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ─── HELPERS ────────────────────────────────────────────────

async function getAuthUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Ensure Prisma User record exists (sync from Supabase Auth)
    await prisma.user.upsert({
        where: { id: user.id },
        create: {
            id: user.id,
            email: user.email || "",
            password: "__supabase_auth__",
        },
        update: {
            email: user.email || "",
        },
    });

    return user.id;
}

function generateSlug(title: string): string {
    return (
        title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString(36)
    );
}

// ─── DASHBOARD STATS ────────────────────────────────────────

export async function getDashboardStats() {
    const userId = await getAuthUserId();

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
        itemsCount, listsCount, tagsCount, publicCount,
        recentItems, itemsThisWeek, weeklyItems,
        topTags, featuredLists,
    ] = await Promise.all([
        prisma.item.count({ where: { userId } }),
        prisma.list.count({ where: { userId } }),
        prisma.tag.count({ where: { userId } }),
        prisma.item.count({ where: { userId, viewMode: "PUBLIC" } }),
        prisma.item.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                tags: { select: { id: true, name: true } },
            },
        }),
        // Items added this week (for KPI delta)
        prisma.item.count({
            where: { userId, createdAt: { gte: weekAgo } },
        }),
        // Items created in last 7 days grouped by day (for bar chart)
        prisma.item.findMany({
            where: { userId, createdAt: { gte: weekAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
        }),
        // Top tags with item counts
        prisma.tag.findMany({
            where: { userId },
            include: { _count: { select: { items: true } } },
            orderBy: { items: { _count: "desc" } },
            take: 6,
        }),
        // Featured collections
        prisma.list.findMany({
            where: { userId },
            include: { _count: { select: { items: true } } },
            orderBy: { items: { _count: "desc" } },
            take: 3,
        }),
    ]);

    // Build 7-day activity data
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const weeklyActivity: { day: string; date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const count = weeklyItems.filter(
            (item) => item.createdAt.toISOString().split("T")[0] === dateStr
        ).length;
        weeklyActivity.push({
            day: dayNames[d.getDay()],
            date: dateStr,
            count,
        });
    }

    return {
        itemsCount,
        listsCount,
        tagsCount,
        publicCount,
        itemsThisWeek,
        weeklyActivity,
        topTags: topTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            count: tag._count.items,
        })),
        featuredLists: featuredLists.map((list) => ({
            id: list.id,
            name: list.name,
            thumbnail: list.thumbnail,
            itemCount: list._count.items,
        })),
        recentItems: recentItems.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            thumbnail: item.thumbnail,
            viewMode: item.viewMode,
            createdAt: item.createdAt.toISOString(),
            tags: item.tags,
        })),
    };
}

// ─── GET ITEMS (LISTING) ────────────────────────────────────

interface GetItemsParams {
    search?: string;
    sort?: "newest" | "oldest" | "az" | "za";
    page?: number;
    pageSize?: number;
    listId?: string;
    tagId?: string;
}

export async function getItems(params: GetItemsParams = {}) {
    const userId = await getAuthUserId();
    const { search, sort = "newest", page = 1, pageSize = 12, listId, tagId } = params;

    const where: Record<string, unknown> = { userId };
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

    const orderBy: Record<string, string> =
        sort === "oldest"
            ? { createdAt: "asc" }
            : sort === "az"
                ? { title: "asc" }
                : sort === "za"
                    ? { title: "desc" }
                    : { createdAt: "desc" };

    const [items, total] = await Promise.all([
        prisma.item.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                tags: { select: { id: true, name: true } },
                lists: { select: { id: true, name: true } },
                attachments: { select: { id: true, type: true, url: true } },
            },
        }),
        prisma.item.count({ where }),
    ]);

    return {
        items: items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        })),
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
    };
}

// ─── GET SINGLE ITEM ────────────────────────────────────────

export async function getItem(id: string) {
    const userId = await getAuthUserId();

    const item = await prisma.item.findFirst({
        where: { id, userId },
        include: {
            tags: { select: { id: true, name: true } },
            lists: { select: { id: true, name: true } },
            attachments: {
                select: { id: true, type: true, url: true, metadata: true },
            },
        },
    });

    if (!item) return null;

    return {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}

// ─── CREATE ITEM ────────────────────────────────────────────

interface AttachmentInput {
    type: "LINK" | "IMAGE";
    url: string;
}

interface CreateItemData {
    title: string;
    description?: string;
    thumbnail?: string;
    viewMode: "PRIVATE" | "PUBLIC";
    tagNames: string[];
    listIds: string[];
    attachments: AttachmentInput[];
}

export async function createItem(data: CreateItemData) {
    const userId = await getAuthUserId();

    // Enforce max 10 attachments
    const validAttachments = data.attachments
        .filter((a) => a.url.trim())
        .slice(0, 10);

    // Upsert tags
    const tagConnections = await Promise.all(
        data.tagNames.map(async (name) => {
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
            title: data.title,
            description: data.description || null,
            thumbnail: data.thumbnail || null,
            viewMode: data.viewMode,
            shareSlug:
                data.viewMode === "PUBLIC" ? generateSlug(data.title) : null,
            userId,
            tags: { connect: tagConnections },
            lists: {
                connect: data.listIds.map((id) => ({ id })),
            },
            attachments: {
                create: validAttachments.map((a) => ({
                    type: a.type,
                    url: a.url.trim(),
                })),
            },
        },
    });

    return { id: item.id };
}

// ─── UPDATE ITEM ────────────────────────────────────────────

interface UpdateItemData extends CreateItemData {
    id: string;
}

export async function updateItem(data: UpdateItemData) {
    const userId = await getAuthUserId();

    // Verify ownership
    const existing = await prisma.item.findFirst({
        where: { id: data.id, userId },
    });
    if (!existing) return { error: "Item not found" };

    // Enforce max 10 attachments
    const validAttachments = data.attachments
        .filter((a) => a.url.trim())
        .slice(0, 10);

    // Upsert tags
    const tagConnections = await Promise.all(
        data.tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
                where: { name_userId: { name: name.trim(), userId } },
                create: { name: name.trim(), userId },
                update: {},
            });
            return { id: tag.id };
        })
    );

    // Delete old attachments and recreate
    await prisma.attachment.deleteMany({ where: { itemId: data.id } });

    await prisma.item.update({
        where: { id: data.id },
        data: {
            title: data.title,
            description: data.description || null,
            thumbnail: data.thumbnail || null,
            viewMode: data.viewMode,
            shareSlug:
                data.viewMode === "PUBLIC"
                    ? existing.shareSlug || generateSlug(data.title)
                    : existing.shareSlug, // Keep existing slug if switching to PRIVATE
            tags: { set: tagConnections },
            lists: {
                set: data.listIds.map((id) => ({ id })),
            },
            attachments: {
                create: validAttachments.map((a) => ({
                    type: a.type,
                    url: a.url.trim(),
                })),
            },
        },
    });

    return { id: data.id };
}

// ─── DELETE ITEM ────────────────────────────────────────────

export async function deleteItem(id: string) {
    const userId = await getAuthUserId();

    const item = await prisma.item.findFirst({ where: { id, userId } });
    if (!item) return { error: "Item not found" };

    await prisma.item.delete({ where: { id } });
    return { success: true };
}

// ─── GET USER LISTS (for select) ────────────────────────────

export async function getUserLists() {
    const userId = await getAuthUserId();
    return prisma.list.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
}

// ─── GET USER TAGS (for autocomplete) ───────────────────────

export async function getUserTags() {
    const userId = await getAuthUserId();
    return prisma.tag.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
}

// ─── GET TAGS WITH COUNTS (for tags page) ───────────────────

export async function getTagsWithCounts() {
    const userId = await getAuthUserId();

    const tags = await prisma.tag.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        include: {
            _count: { select: { items: true } },
        },
    });

    return tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        itemCount: tag._count.items,
        createdAt: tag.createdAt.toISOString(),
    }));
}

// ─── GET TAG WITH ITEMS (for tag detail page) ───────────────

export async function getTagWithItems(id: string) {
    const userId = await getAuthUserId();

    const tag = await prisma.tag.findFirst({
        where: { id, userId },
        include: {
            items: {
                orderBy: { createdAt: "desc" },
                include: {
                    tags: { select: { id: true, name: true } },
                    lists: { select: { id: true, name: true } },
                    attachments: {
                        select: { id: true, type: true, url: true },
                    },
                },
            },
            _count: { select: { items: true } },
        },
    });

    if (!tag) return null;

    return {
        id: tag.id,
        name: tag.name,
        itemCount: tag._count.items,
        createdAt: tag.createdAt.toISOString(),
        items: tag.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        })),
    };
}

// ─── DELETE TAG ──────────────────────────────────────────────

export async function deleteTag(id: string) {
    const userId = await getAuthUserId();

    const tag = await prisma.tag.findFirst({ where: { id, userId } });
    if (!tag) return { error: "Tag not found" };

    await prisma.tag.delete({ where: { id } });
    return { success: true };
}
