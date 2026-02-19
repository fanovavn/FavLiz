import { notFound } from "next/navigation";
import { getList } from "@/lib/list-actions";
import { getShareUrl } from "@/lib/share-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";
import { ListDetailClient } from "@/components/list-detail-client";

interface ListDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
    const { id } = await params;
    const list = await getList(id);

    if (!list) notFound();

    const shareUrl = list.viewMode === "PUBLIC" ? await getShareUrl("list", id) : null;
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel = itemsLabel === "Items" ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    return (
        <ListDetailClient
            list={{
                id: list.id,
                name: list.name,
                description: list.description,
                thumbnail: list.thumbnail,
                viewMode: list.viewMode as "PRIVATE" | "PUBLIC",
                itemCount: list.itemCount,
                createdAt: list.createdAt,
                items: list.items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    thumbnail: item.thumbnail,
                    viewMode: item.viewMode,
                    tags: item.tags,
                    createdAt: item.createdAt,
                })),
            }}
            shareUrl={shareUrl}
            singleItemLabel={singleItemLabel}
            locale={locale}
            emptyTitle={t(locale, "lists.noItemsInList", { item: singleItemLabel })}
            emptyDesc={t(locale, "lists.noItemsInListDesc", { item: singleItemLabel })}
            addItemLabel={t(locale, "lists.addItemToList", { item: singleItemLabel })}
        />
    );
}
