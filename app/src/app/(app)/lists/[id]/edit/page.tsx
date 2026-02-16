import { notFound } from "next/navigation";
import { getList } from "@/lib/list-actions";
import { ListForm } from "@/components/list-form";

interface EditListPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditListPage({ params }: EditListPageProps) {
    const { id } = await params;
    const list = await getList(id);

    if (!list) notFound();

    return (
        <ListForm
            mode="edit"
            initialData={{
                id: list.id,
                name: list.name,
                description: list.description,
                viewMode: list.viewMode,
            }}
        />
    );
}
