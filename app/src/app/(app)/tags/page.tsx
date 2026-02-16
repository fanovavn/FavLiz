import Link from "next/link";
import { Tags, Inbox } from "lucide-react";
import { getTagsWithCounts } from "@/lib/item-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";

export default async function TagsPage() {
    const tags = await getTagsWithCounts();
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel = itemsLabel === "Items" ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <h1
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: "#1E293B" }}
                    >
                        {t(locale, "tags.title")}
                    </h1>
                    {tags.length > 0 && (
                        <span
                            className="text-xs font-bold px-2.5 py-0.5"
                            style={{
                                background: "rgba(37, 99, 235, 0.08)",
                                color: "#2563EB",
                                borderRadius: "var(--radius-full)",
                            }}
                        >
                            {tags.length}
                        </span>
                    )}
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {t(locale, "tags.subtitle")}
                </p>
            </div>

            {/* Tags */}
            {tags.length === 0 ? (
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
                        {t(locale, "tags.noTags")}
                    </h3>
                    <p
                        className="text-sm mb-5"
                        style={{ color: "var(--muted)" }}
                    >
                        {t(locale, "tags.noTagsDesc", { item: singleItemLabel })}
                    </p>
                    <Link
                        href="/items/new"
                        className="gradient-btn"
                        style={{ textDecoration: "none" }}
                    >
                        <span>{t(locale, "dashboard.addNewItem", { item: singleItemLabel })}</span>
                    </Link>
                </div>
            ) : (
                <div className="glass-card p-6">
                    <div className="flex flex-wrap gap-3">
                        {tags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={`/tags/${tag.id}`}
                                className="tag-link"
                            >
                                <Tags className="w-3.5 h-3.5" />
                                <span>{tag.name}</span>
                                <span
                                    className="text-xs font-bold px-1.5 py-0.5"
                                    style={{
                                        borderRadius: "var(--radius-full)",
                                        background: "rgba(100, 116, 139, 0.1)",
                                        color: "inherit",
                                    }}
                                >
                                    {tag.itemCount}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
