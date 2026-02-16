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
        },
    });

    return lists.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        thumbnail: list.thumbnail,
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

    return {
        id: list.id,
        name: list.name,
        description: list.description,
        thumbnail: list.thumbnail,
        viewMode: list.viewMode,
        shareSlug: list.shareSlug,
        isDefault: list.isDefault,
        itemCount: list._count.items,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        items: list.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        })),
    };
}

// ─── CREATE LIST ────────────────────────────────────────────

interface CreateListData {
    name: string;
    description?: string;
    viewMode: "PRIVATE" | "PUBLIC";
}

export async function createList(data: CreateListData) {
    const userId = await getAuthUserId();

    const list = await prisma.list.create({
        data: {
            name: data.name.trim(),
            description: data.description?.trim() || null,
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
