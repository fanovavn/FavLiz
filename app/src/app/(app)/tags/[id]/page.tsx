import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Tags,
    Bookmark,
    Inbox,
} from "lucide-react";
import { getTagWithItems } from "@/lib/item-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";
import { ItemCard } from "@/components/item-card";
import { DeleteTagButton } from "@/components/delete-tag-button";

interface TagDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
    const { id } = await params;
    const tag = await getTagWithItems(id);
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel = itemsLabel === "Items" ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    if (!tag) notFound();

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <Link
                        href="/tags"
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center gap-1.5 px-3 py-1"
                                style={{
                                    borderRadius: "var(--radius-full)",
                                    background: "rgba(100, 116, 139, 0.07)",
                                    border: "1px solid rgba(100, 116, 139, 0.15)",
                                    color: "#475569",
                                }}
                            >
                                <Tags className="w-3.5 h-3.5" />
                                <span className="text-sm font-semibold">
                                    {tag.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span
                        className="flex items-center gap-1.5 text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        <Bookmark className="w-3.5 h-3.5" />
                        {tag.itemCount} {singleItemLabel}
                    </span>
                    <DeleteTagButton tagId={tag.id} tagName={tag.name} />
                </div>
            </div>

            {/* Items Grid */}
            {tag.items.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background: "rgba(37, 99, 235, 0.06)",
                        }}
                    >
                        <Inbox
                            className="w-8 h-8"
                            style={{ color: "#2563EB" }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color: "#1E293B" }}
                    >
                        {t(locale, "tags.noItemsWithTag", { item: singleItemLabel })}
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        {t(locale, "tags.noItemsWithTagDesc", { item: singleItemLabel })}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tag.items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
