import { api } from "./client";

export type DashboardStats = {
    itemsCount: number;
    listsCount: number;
    tagsCount: number;
    publicCount: number;
    itemsThisWeek: number;
    recentItems: Array<{
        id: string; title: string; thumbnail: string | null;
        viewMode: string; createdAt: string;
        tags: Array<{ id: string; name: string }>;
    }>;
    weeklyActivity: Array<{ day: string; date: string; count: number }>;
    topTags: Array<{ id: string; name: string; count: number }>;
    featuredLists: Array<{ id: string; name: string; thumbnail: string | null; itemCount: number }>;
};

export const dashboardApi = {
    getStats: () => api.get<DashboardStats>("/api/mobile/dashboard"),
};
