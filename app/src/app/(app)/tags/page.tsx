import { getTagsWithCounts } from "@/lib/item-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";
import { TagsPageClient } from "@/components/tags-page-client";

export default async function TagsPage() {
    const tags = await getTagsWithCounts();
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel = itemsLabel === "Items" ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    return <TagsPageClient tags={tags} singleItemLabel={singleItemLabel} />;
}
