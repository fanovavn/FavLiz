import { getLists, getUncategorizedItemCount } from "@/lib/list-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";
import { ListsPageClient } from "@/components/lists-page-client";

export default async function ListsPage() {
    const lists = await getLists();
    const uncategorizedCount = await getUncategorizedItemCount();
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel =
        itemsLabel === "Items"
            ? t(locale, "items.title").toLowerCase()
            : itemsLabel.toLowerCase();

    const translations = {
        title: t(locale, "lists.title"),
        subtitle: t(locale, "lists.subtitle", { item: singleItemLabel }),
        createNew: t(locale, "lists.createNew"),
        emptyTitle: t(locale, "lists.emptyTitle"),
        emptyDesc: t(locale, "lists.emptyDesc", { item: singleItemLabel }),
        createFirst: t(locale, "lists.createFirst"),
        searchPlaceholder: t(locale, "lists.searchPlaceholder"),
        uncategorized: t(locale, "lists.uncategorized"),
        uncategorizedDesc: t(locale, "lists.uncategorizedDesc", {
            item: singleItemLabel,
        }),
        totalItems: t(locale, "lists.totalItems", { item: singleItemLabel }),
        publicCount: t(locale, "lists.publicCount"),
        createNewHint: t(locale, "lists.createNewHint", {
            item: singleItemLabel,
        }),
        publicLabel: t(locale, "common.public"),
        privateLabel: t(locale, "common.private"),
    };

    return (
        <ListsPageClient
            lists={lists}
            uncategorizedCount={uncategorizedCount}
            locale={locale}
            singleItemLabel={singleItemLabel}
            translations={translations}
        />
    );
}
