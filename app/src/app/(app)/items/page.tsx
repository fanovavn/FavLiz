import { Suspense } from "react";
import { getItems } from "@/lib/item-actions";
import { getLists } from "@/lib/list-actions";
import { getTagsWithCounts } from "@/lib/item-actions";
import { ItemsListClient } from "@/components/items-list-client";

interface Props {
    searchParams: Promise<{
        search?: string;
        sort?: string;
        page?: string;
        listId?: string;
        tagId?: string;
    }>;
}

export default async function ItemsPage({ searchParams }: Props) {
    const params = await searchParams;
    const [data, lists, tags] = await Promise.all([
        getItems({
            search: params.search,
            sort: (params.sort as "newest" | "oldest" | "az" | "za") || "newest",
            page: params.page ? parseInt(params.page) : 1,
            listId: params.listId,
            tagId: params.tagId,
        }),
        getLists(),
        getTagsWithCounts(),
    ]);

    return (
        <Suspense
            fallback={
                <div className="px-6 md:px-10 py-8 text-center text-gray-400">
                    Đang tải...
                </div>
            }
        >
            <ItemsListClient
                initialData={data}
                lists={lists}
                tags={tags}
            />
        </Suspense>
    );
}
