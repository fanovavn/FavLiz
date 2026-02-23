import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserId, corsResponse, corsError, handleCors } from "../helpers";

export async function OPTIONS() {
    return handleCors();
}

// GET /api/mobile/dashboard — Dashboard stats
export async function GET(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        // Counts
        const [itemsCount, listsCount, tagsCount, publicCount] = await Promise.all([
            prisma.item.count({ where: { userId } }),
            prisma.list.count({ where: { userId } }),
            prisma.tag.count({ where: { userId } }),
            prisma.item.count({ where: { userId, viewMode: "PUBLIC" } }),
        ]);

        // Items added this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const itemsThisWeek = await prisma.item.count({
            where: { userId, createdAt: { gte: weekAgo } },
        });

        // Recent items
        const recentItems = await prisma.item.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true, title: true, thumbnail: true, viewMode: true, createdAt: true,
                tags: { select: { id: true, name: true } },
            },
        });

        // Weekly activity (last 7 days)
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const weeklyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            const count = await prisma.item.count({
                where: { userId, createdAt: { gte: start, lte: end } },
            });

            weeklyActivity.push({
                day: days[date.getDay()],
                date: date.toISOString().slice(0, 10),
                count,
            });
        }

        // Top tags
        const topTags = await prisma.tag.findMany({
            where: { userId },
            select: { id: true, name: true, _count: { select: { items: true } } },
            orderBy: { items: { _count: "desc" } },
            take: 6,
        });

        // Featured lists
        const featuredLists = await prisma.list.findMany({
            where: { userId },
            select: {
                id: true, name: true, thumbnail: true,
                _count: { select: { items: true } },
            },
            orderBy: { items: { _count: "desc" } },
            take: 4,
        });

        return corsResponse({
            itemsCount, listsCount, tagsCount, publicCount, itemsThisWeek,
            recentItems,
            weeklyActivity,
            topTags: topTags.map((t) => ({ id: t.id, name: t.name, count: t._count.items })),
            featuredLists: featuredLists.map((l) => ({
                id: l.id, name: l.name, thumbnail: l.thumbnail, itemCount: l._count.items,
            })),
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        return corsError("Failed to fetch dashboard", 500);
    }
}
