import { Suspense } from "react";
import { getItems } from "@/lib/item-actions";
import { ItemsListClient } from "@/components/items-list-client";

interface Props {
    searchParams: Promise<{ search?: string; sort?: string; page?: string }>;
}

export default async function ItemsPage({ searchParams }: Props) {
    const params = await searchParams;
    const data = await getItems({
        search: params.search,
        sort: (params.sort as "newest" | "oldest" | "az" | "za") || "newest",
        page: params.page ? parseInt(params.page) : 1,
    });

    return (
        <Suspense
            fallback={
                <div className="px-6 md:px-10 py-8 text-center text-gray-400">
                    Đang tải...
                </div>
            }
        >
            <ItemsListClient initialData={data} />
        </Suspense>
    );
}
