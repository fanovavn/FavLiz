import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicItem } from "@/lib/share-actions";
import { PublicItemView } from "@/components/public-item-view";

interface ShareItemPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShareItemPageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = await getPublicItem(slug);
    if (!item) return { title: "Not Found – FavLiz" };

    const displayName = item.user.name || item.user.username || item.user.email.split("@")[0];

    return {
        title: `${item.title} – @${displayName} – FavLiz`,
        description: item.description || `${item.title} – shared on FavLiz`,
        openGraph: {
            title: `${item.title} – @${displayName} – FavLiz`,
            description: item.description || `${item.title} – shared on FavLiz`,
            type: "article",
            ...(item.thumbnail && { images: [{ url: item.thumbnail, width: 1200, height: 630 }] }),
        },
        twitter: {
            card: item.thumbnail ? "summary_large_image" : "summary",
            title: `${item.title} – @${displayName}`,
            description: item.description || `${item.title} – shared on FavLiz`,
        },
    };
}

export default async function ShareItemPage({ params }: ShareItemPageProps) {
    const { slug } = await params;
    const item = await getPublicItem(slug);

    if (!item) notFound();

    return <PublicItemView item={item} />;
}
