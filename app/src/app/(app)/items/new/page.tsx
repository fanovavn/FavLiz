import { ItemForm } from "@/components/item-form";
import { getUserLists, getUserTags } from "@/lib/item-actions";

interface PageProps {
    searchParams: Promise<{ listId?: string; returnTo?: string }>;
}

export default async function NewItemPage({ searchParams }: PageProps) {
    const [lists, tags, params] = await Promise.all([
        getUserLists(),
        getUserTags(),
        searchParams,
    ]);

    return (
        <ItemForm
            mode="create"
            availableLists={lists}
            availableTags={tags}
            preSelectedListId={params.listId}
            returnTo={params.returnTo}
        />
    );
}
