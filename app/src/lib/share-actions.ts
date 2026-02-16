"use server";

import { prisma } from "@/lib/prisma";

// ─── PUBLIC ITEM ────────────────────────────────────────────

export async function getPublicItem(slug: string) {
    const item = await prisma.item.findUnique({
        where: { shareSlug: slug },
        include: {
            user: { select: { id: true, name: true, username: true, email: true, itemsLabel: true } },
            tags: { select: { id: true, name: true } },
            lists: { select: { id: true, name: true } },
            attachments: { select: { id: true, type: true, url: true } },
        },
    });

    if (!item || item.viewMode !== "PUBLIC") return null;
    return item;
}

// ─── PUBLIC LIST ────────────────────────────────────────────

export async function getPublicList(slug: string) {
    const list = await prisma.list.findUnique({
        where: { shareSlug: slug },
        include: {
            user: { select: { id: true, name: true, username: true, email: true, itemsLabel: true } },
            items: {
                where: { viewMode: "PUBLIC" },
                include: {
                    tags: { select: { id: true, name: true } },
                    attachments: { select: { id: true, type: true, url: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!list || list.viewMode !== "PUBLIC") return null;
    return list;
}

// ─── PUBLIC CONTENT BY USERNAME + SLUG ──────────────────────

export async function getPublicContentByUsername(username: string, slug: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (!user) return null;

    // Try item first
    const item = await prisma.item.findFirst({
        where: {
            shareSlug: slug,
            userId: user.id,
            viewMode: "PUBLIC",
        },
        include: {
            user: { select: { id: true, name: true, username: true, email: true, themeColor: true, itemsLabel: true } },
            tags: { select: { id: true, name: true } },
            lists: { select: { id: true, name: true } },
            attachments: { select: { id: true, type: true, url: true } },
        },
    });
    if (item) return { type: "item" as const, data: item };

    // Try list
    const list = await prisma.list.findFirst({
        where: {
            shareSlug: slug,
            userId: user.id,
            viewMode: "PUBLIC",
        },
        include: {
            user: { select: { id: true, name: true, username: true, email: true, themeColor: true, itemsLabel: true } },
            items: {
                where: { viewMode: "PUBLIC" },
                include: {
                    tags: { select: { id: true, name: true } },
                    attachments: { select: { id: true, type: true, url: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (list) return { type: "list" as const, data: list };

    return null;
}

// ─── GET SHARE URL ──────────────────────────────────────────

export async function getShareUrl(type: "item" | "list", id: string) {
    if (type === "item") {
        const item = await prisma.item.findUnique({
            where: { id },
            select: {
                shareSlug: true,
                viewMode: true,
                user: { select: { username: true } },
            },
        });
        if (!item || item.viewMode !== "PUBLIC" || !item.shareSlug) return null;

        if (item.user.username) {
            return `/${item.user.username}/${item.shareSlug}`;
        }
        return `/share/item/${item.shareSlug}`;
    }

    const list = await prisma.list.findUnique({
        where: { id },
        select: {
            shareSlug: true,
            viewMode: true,
            user: { select: { username: true } },
        },
    });
    if (!list || list.viewMode !== "PUBLIC" || !list.shareSlug) return null;

    if (list.user.username) {
        return `/${list.user.username}/${list.shareSlug}`;
    }
    return `/share/list/${list.shareSlug}`;
}
