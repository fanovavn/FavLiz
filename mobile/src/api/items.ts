import { api } from "./client";

export type Item = {
    id: string; title: string; description: string | null;
    thumbnail: string | null; viewMode: "PRIVATE" | "PUBLIC";
    createdAt: string; updatedAt?: string; shareSlug?: string | null;
    tags: Array<{ id: string; name: string }>;
    lists: Array<{ id: string; name: string }>;
    attachments?: Array<{ id: string; type: string; url: string; metadata: unknown }>;
    _count?: { attachments: number };
};

export type ItemListResponse = {
    items: Item[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export type CreateItemData = {
    title: string;
    description?: string;
    thumbnail?: string;
    viewMode?: "PRIVATE" | "PUBLIC";
    tagNames?: string[];
    listIds?: string[];
    attachments?: Array<{ type: string; url: string }>;
};

export const itemsApi = {
    getItems: (params?: Record<string, string>) =>
        api.get<ItemListResponse>("/api/mobile/items", params),

    getItem: (id: string) =>
        api.get<Item>(`/api/mobile/items/${id}`),

    createItem: (data: CreateItemData) =>
        api.post<Item>("/api/mobile/items", data),

    updateItem: (id: string, data: Partial<CreateItemData>) =>
        api.put<Item>(`/api/mobile/items/${id}`, data),

    deleteItem: (id: string) =>
        api.delete(`/api/mobile/items/${id}`),
};
