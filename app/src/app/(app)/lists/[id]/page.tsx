import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Edit3,
    Globe,
    Lock,
    FolderOpen,
    Bookmark,
    Inbox,
} from "lucide-react";
import { getList } from "@/lib/list-actions";
import { getShareUrl } from "@/lib/share-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";
import { ItemCard } from "@/components/item-card";
import { DeleteListButton } from "@/components/delete-list-dialog";
import { ShareButton } from "@/components/share-button";

interface ListDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
    const { id } = await params;
    const list = await getList(id);

    if (!list) notFound();

    const shareUrl = list.viewMode === "PUBLIC" ? await getShareUrl("list", id) : null;
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel = itemsLabel === "Items" ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between mb-6 md:mb-8 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href="/lists"
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors shrink-0"
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
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1
                                className="text-xl sm:text-2xl font-bold truncate"
                                style={{ color: "#1E293B" }}
                            >
                                {list.name}
                            </h1>
                            <span
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                                style={{
                                    borderRadius: "var(--radius-full)",
                                    background:
                                        list.viewMode === "PUBLIC"
                                            ? "rgba(22, 163, 74, 0.06)"
                                            : "rgba(100, 116, 139, 0.06)",
                                    color:
                                        list.viewMode === "PUBLIC"
                                            ? "#16A34A"
                                            : "#94A3B8",
                                }}
                            >
                                {list.viewMode === "PUBLIC" ? (
                                    <Globe className="w-3 h-3" />
                                ) : (
                                    <Lock className="w-3 h-3" />
                                )}
                                {list.viewMode === "PUBLIC"
                                    ? "Public"
                                    : "Private"}
                            </span>
                        </div>
                        {list.description && (
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--muted)" }}
                            >
                                {list.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/lists/${list.id}/edit`}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                            textDecoration: "none",
                        }}
                    >
                        <Edit3 className="w-4 h-4" />
                    </Link>
                    <DeleteListButton
                        listId={list.id}
                        listName={list.name}
                    />
                </div>
            </div>

            {/* Share URL Bar */}
            {shareUrl && (
                <div className="mb-6">
                    <ShareButton shareUrl={shareUrl} />
                </div>
            )}

            {/* Stats */}
            <div className="glass-card p-4 mb-6 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                        }}
                    >
                        <Bookmark
                            className="w-4 h-4"
                            style={{ color: "var(--primary)" }}
                        />
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                        <strong style={{ color: "#1E293B" }}>
                            {list.itemCount}
                        </strong>{" "}
                        {singleItemLabel}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                            background: "rgba(100, 116, 139, 0.08)",
                        }}
                    >
                        <FolderOpen
                            className="w-4 h-4"
                            style={{ color: "#475569" }}
                        />
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                        Tạo lúc{" "}
                        <strong style={{ color: "#1E293B" }}>
                            {new Date(list.createdAt).toLocaleDateString(
                                "vi-VN"
                            )}
                        </strong>
                    </span>
                </div>
            </div>

            {/* Items Grid */}
            {list.items.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                        }}
                    >
                        <Inbox
                            className="w-8 h-8"
                            style={{ color: "var(--primary)" }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color: "#1E293B" }}
                    >
                        {t(locale, "lists.noItemsInList", { item: singleItemLabel })}
                    </h3>
                    <p
                        className="text-sm mb-5"
                        style={{ color: "var(--muted)" }}
                    >
                        {t(locale, "lists.noItemsInListDesc", { item: singleItemLabel })}
                    </p>
                    <Link
                        href="/items/new"
                        className="gradient-btn"
                        style={{ textDecoration: "none" }}
                    >
                        <span>{t(locale, "lists.addItemToList", { item: singleItemLabel })}</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {list.items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
