import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicContentByUsername } from "@/lib/share-actions";
import { PublicItemView } from "@/components/public-item-view";
import { PublicListView } from "@/components/public-list-view";
import { ThemeProvider } from "@/components/theme-provider";

interface UserContentPageProps {
    params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: UserContentPageProps): Promise<Metadata> {
    const { username, slug } = await params;
    const result = await getPublicContentByUsername(username, slug);
    if (!result) return { title: "Not Found – FavLiz" };

    if (result.type === "item") {
        const item = result.data;
        const displayName = item.user.name || `@${username}`;
        return {
            title: `${item.title} – ${displayName} – FavLiz`,
            description: item.description || `${item.title} – shared on FavLiz`,
            openGraph: {
                title: `${item.title} – ${displayName} – FavLiz`,
                description: item.description || `${item.title} – shared on FavLiz`,
                type: "article",
                ...(item.thumbnail && { images: [{ url: item.thumbnail, width: 1200, height: 630 }] }),
            },
            twitter: {
                card: item.thumbnail ? "summary_large_image" : "summary",
                title: `${item.title} – ${displayName}`,
                description: item.description || `${item.title} – shared on FavLiz`,
            },
        };
    }

    const list = result.data;
    const displayName = list.user.name || `@${username}`;
    const singleLabel = list.user.itemsLabel ? list.user.itemsLabel.toLowerCase() : "items";
    return {
        title: `${list.name} (${list.items.length} ${singleLabel}) – ${displayName} – FavLiz`,
        description: list.description || `${list.name} – a curated collection on FavLiz`,
        openGraph: {
            title: `${list.name} – ${displayName} – FavLiz`,
            description: list.description || `${list.name} – ${list.items.length} curated ${singleLabel}`,
            type: "article",
            ...(list.thumbnail && { images: [{ url: list.thumbnail, width: 1200, height: 630 }] }),
        },
        twitter: {
            card: list.thumbnail ? "summary_large_image" : "summary",
            title: `${list.name} – ${displayName}`,
            description: list.description || `${list.name} – ${list.items.length} curated ${singleLabel}`,
        },
    };
}

export default async function UserContentPage({ params }: UserContentPageProps) {
    const { username, slug } = await params;
    const result = await getPublicContentByUsername(username, slug);

    if (!result) notFound();

    const themeColor = result.data.user.themeColor || null;

    if (result.type === "item") {
        return (
            <ThemeProvider themeColor={themeColor}>
                <PublicItemView item={result.data} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider themeColor={themeColor}>
            <PublicListView list={result.data} />
        </ThemeProvider>
    );
}

