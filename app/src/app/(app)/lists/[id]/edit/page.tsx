import { notFound } from "next/navigation";
import { getList } from "@/lib/list-actions";
import { ListEditClient } from "@/components/list-edit-client";

interface EditListPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditListPage({ params }: EditListPageProps) {
    const { id } = await params;
    const list = await getList(id);

    if (!list) notFound();

    return (
        <ListEditClient
            list={{
                id: list.id,
                name: list.name,
                description: list.description,
                thumbnail: list.thumbnail,
                viewMode: list.viewMode,
                sortMode: list.sortMode,
                itemOrder: list.itemOrder,
                items: list.items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    thumbnail: item.thumbnail,
                    tags: item.tags,
                })),
            }}
        />
    );
}
