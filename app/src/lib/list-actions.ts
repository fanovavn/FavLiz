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

function generateSlug(name: string): string {
    return (
        name
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

// ─── GET LISTS (LISTING) ────────────────────────────────────

export async function getLists() {
    const userId = await getAuthUserId();

    const lists = await prisma.list.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { items: true } },
            items: {
                where: { thumbnail: { not: null } },
                select: { thumbnail: true },
                take: 1,
            },
        },
    });

    return lists.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        thumbnail: list.thumbnail,
        coverImage: list.thumbnail || list.items[0]?.thumbnail || null,
        viewMode: list.viewMode,
        shareSlug: list.shareSlug,
        isDefault: list.isDefault,
        itemCount: list._count.items,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
    }));
}

// ─── GET SINGLE LIST ────────────────────────────────────────

export async function getList(id: string) {
    const userId = await getAuthUserId();

    const list = await prisma.list.findFirst({
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

    if (!list) return null;

    const serialized = list.items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));

    // Apply custom sort order if sortMode is CUSTOM and itemOrder exists
    let sortedItems = serialized;
    if (list.sortMode === "CUSTOM" && list.itemOrder.length > 0) {
        const orderMap = new Map(list.itemOrder.map((id, idx) => [id, idx]));
        sortedItems = [...serialized].sort((a, b) => {
            const aIdx = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
            const bIdx = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
            return aIdx - bIdx;
        });
    }

    return {
        id: list.id,
        name: list.name,
        description: list.description,
        thumbnail: list.thumbnail,
        viewMode: list.viewMode,
        sortMode: list.sortMode as "NEWEST" | "CUSTOM",
        itemOrder: list.itemOrder,
        shareSlug: list.shareSlug,
        isDefault: list.isDefault,
        itemCount: list._count.items,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        items: sortedItems,
    };
}

// ─── CREATE LIST ────────────────────────────────────────────

interface CreateListData {
    name: string;
    description?: string;
    thumbnail?: string;
    viewMode: "PRIVATE" | "PUBLIC";
}

export async function createList(data: CreateListData) {
    const userId = await getAuthUserId();

    const list = await prisma.list.create({
        data: {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            thumbnail: data.thumbnail || null,
            viewMode: data.viewMode,
            shareSlug:
                data.viewMode === "PUBLIC" ? generateSlug(data.name) : null,
            userId,
        },
    });

    return { id: list.id };
}

// ─── UPDATE LIST ────────────────────────────────────────────

interface UpdateListData extends CreateListData {
    id: string;
}

export async function updateList(data: UpdateListData) {
    const userId = await getAuthUserId();

    const existing = await prisma.list.findFirst({
        where: { id: data.id, userId },
    });
    if (!existing) return { error: "List not found" };

    await prisma.list.update({
        where: { id: data.id },
        data: {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            thumbnail: data.thumbnail !== undefined ? (data.thumbnail || null) : undefined,
            viewMode: data.viewMode,
            shareSlug:
                data.viewMode === "PUBLIC"
                    ? existing.shareSlug || generateSlug(data.name)
                    : null,
        },
    });

    return { id: data.id };
}

// ─── DELETE LIST ────────────────────────────────────────────

export async function deleteList(id: string) {
    const userId = await getAuthUserId();

    const list = await prisma.list.findFirst({ where: { id, userId } });
    if (!list) return { error: "List not found" };

    await prisma.list.delete({ where: { id } });
    return { success: true };
}

// ─── UPDATE ITEM ORDER ──────────────────────────────────────

export async function updateItemOrder(listId: string, itemIds: string[]) {
    const userId = await getAuthUserId();

    const list = await prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return { error: "List not found" };

    await prisma.list.update({
        where: { id: listId },
        data: {
            itemOrder: itemIds,
            sortMode: "CUSTOM",
        },
    });

    return { success: true };
}

// ─── UPDATE LIST SORT MODE ──────────────────────────────────

export async function updateListSortMode(listId: string, mode: "NEWEST" | "CUSTOM") {
    const userId = await getAuthUserId();

    const list = await prisma.list.findFirst({ where: { id: listId, userId } });
    if (!list) return { error: "List not found" };

    await prisma.list.update({
        where: { id: listId },
        data: { sortMode: mode },
    });

    return { success: true };
}

// ─── GET UNCATEGORIZED ITEMS COUNT ──────────────────────────

export async function getUncategorizedItemCount() {
    const userId = await getAuthUserId();

    const count = await prisma.item.count({
        where: {
            userId,
            lists: { none: {} },
        },
    });

    return count;
}

// ─── GET UNCATEGORIZED ITEMS ────────────────────────────────

export async function getUncategorizedItems() {
    const userId = await getAuthUserId();

    const items = await prisma.item.findMany({
        where: {
            userId,
            lists: { none: {} },
        },
        orderBy: { createdAt: "desc" },
        include: {
            tags: { select: { id: true, name: true } },
            lists: { select: { id: true, name: true } },
            attachments: {
                select: { id: true, type: true, url: true },
            },
        },
    });

    return items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));
}
