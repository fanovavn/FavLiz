import { api } from "./client";

export type List = {
    id: string; name: string; description: string | null;
    thumbnail: string | null; viewMode: "PRIVATE" | "PUBLIC";
    isDefault: boolean; createdAt: string; itemCount: number;
};

export type ListDetail = List & {
    sortMode: string; shareSlug: string | null; updatedAt: string;
    items: Array<{
        id: string; title: string; thumbnail: string | null;
        viewMode: string; createdAt: string;
        tags: Array<{ id: string; name: string }>;
        _count: { attachments: number };
    }>;
};

export type CreateListData = {
    name: string;
    description?: string;
    thumbnail?: string;
    viewMode?: "PRIVATE" | "PUBLIC";
};

export const listsApi = {
    getLists: () => api.get<List[]>("/api/mobile/lists"),
    getList: (id: string) => api.get<ListDetail>(`/api/mobile/lists/${id}`),
    createList: (data: CreateListData) => api.post<List>("/api/mobile/lists", data),
    updateList: (id: string, data: Partial<CreateListData>) => api.put<List>(`/api/mobile/lists/${id}`, data),
    deleteList: (id: string) => api.delete(`/api/mobile/lists/${id}`),
};
