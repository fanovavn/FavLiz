import { ItemForm } from "@/components/item-form";
import { getUserLists, getUserTags } from "@/lib/item-actions";

export default async function NewItemPage() {
    const [lists, tags] = await Promise.all([getUserLists(), getUserTags()]);

    return <ItemForm mode="create" availableLists={lists} availableTags={tags} />;
}
