import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicList } from "@/lib/share-actions";
import { PublicListView } from "@/components/public-list-view";

interface ShareListPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShareListPageProps): Promise<Metadata> {
    const { slug } = await params;
    const list = await getPublicList(slug);
    if (!list) return { title: "Not Found – FavLiz" };

    const displayName = list.user.name || list.user.username || list.user.email.split("@")[0];
    const singleLabel = list.user.itemsLabel ? list.user.itemsLabel.toLowerCase() : "items";

    return {
        title: `${list.name} (${list.items.length} ${singleLabel}) – @${displayName} – FavLiz`,
        description: list.description || `${list.name} – a curated collection on FavLiz`,
        openGraph: {
            title: `${list.name} – @${displayName} – FavLiz`,
            description: list.description || `${list.name} – ${list.items.length} curated ${singleLabel}`,
            type: "article",
            ...(list.thumbnail && { images: [{ url: list.thumbnail, width: 1200, height: 630 }] }),
        },
        twitter: {
            card: list.thumbnail ? "summary_large_image" : "summary",
            title: `${list.name} – @${displayName}`,
            description: list.description || `${list.name} – ${list.items.length} curated ${singleLabel}`,
        },
    };
}

export default async function ShareListPage({ params }: ShareListPageProps) {
    const { slug } = await params;
    const list = await getPublicList(slug);

    if (!list) notFound();

    return <PublicListView list={list} />;
}
