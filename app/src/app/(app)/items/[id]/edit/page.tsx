import { notFound } from "next/navigation";
import { getItem, getUserLists, getUserTags } from "@/lib/item-actions";
import { ItemForm } from "@/components/item-form";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: Props) {
    const { id } = await params;
    const [item, lists, tags] = await Promise.all([
        getItem(id),
        getUserLists(),
        getUserTags(),
    ]);

    if (!item) notFound();

    return (
        <ItemForm
            mode="edit"
            initialData={{
                ...item,
                attachments: item.attachments.map((a) => ({
                    ...a,
                    type: a.type as string,
                })),
            }}
            availableLists={lists}
            availableTags={tags}
        />
    );
}
