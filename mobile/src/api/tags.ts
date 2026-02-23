import { api } from "./client";

export type Tag = {
    id: string; name: string; createdAt: string; itemCount: number;
};

export type TagDetail = Tag & {
    items: Array<{
        id: string; title: string; thumbnail: string | null;
        viewMode: string; createdAt: string;
        tags: Array<{ id: string; name: string }>;
        _count: { attachments: number };
    }>;
};

export const tagsApi = {
    getTags: () => api.get<Tag[]>("/api/mobile/tags"),
    getTag: (id: string) => api.get<TagDetail>(`/api/mobile/tags/${id}`),
    deleteTag: (id: string) => api.delete(`/api/mobile/tags/${id}`),
};
