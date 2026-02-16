import Link from "next/link";
import {
    FolderOpen,
    Plus,
    Globe,
    Lock,
    Bookmark,
    Inbox,
} from "lucide-react";
import { getLists } from "@/lib/list-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { getThumbnailColor } from "@/lib/utils";
import { t } from "@/lib/i18n";

export default async function ListsPage() {
    const lists = await getLists();
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel = itemsLabel === "Items" ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8 page-header-responsive">
                <div>
                    <div className="flex items-center gap-3">
                        <h1
                            className="text-xl sm:text-2xl font-bold"
                            style={{ color: "#1E293B" }}
                        >
                            {t(locale, "lists.title")}
                        </h1>
                        {lists.length > 0 && (
                            <span
                                className="text-xs font-bold px-2.5 py-0.5"
                                style={{
                                    background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                                    color: "var(--primary)",
                                    borderRadius: "var(--radius-full)",
                                }}
                            >
                                {lists.length}
                            </span>
                        )}
                    </div>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--muted)" }}
                    >
                        {t(locale, "lists.subtitle", { item: singleItemLabel })}
                    </p>
                </div>
                <Link
                    href="/lists/new"
                    className="gradient-btn"
                    style={{ textDecoration: "none" }}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(locale, "lists.createNew")}</span>
                </Link>
            </div>

            {/* Lists */}
            {lists.length === 0 ? (
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
                        {t(locale, "lists.emptyTitle")}
                    </h3>
                    <p
                        className="text-sm mb-5"
                        style={{ color: "var(--muted)" }}
                    >
                        {t(locale, "lists.emptyDesc", { item: singleItemLabel })}
                    </p>
                    <Link
                        href="/lists/new"
                        className="gradient-btn"
                        style={{ textDecoration: "none" }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t(locale, "lists.createFirst")}</span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {lists.map((list) => (
                        <Link
                            key={list.id}
                            href={`/lists/${list.id}`}
                            className="glass-card glass-card-hover block p-5 group"
                            style={{ textDecoration: "none" }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        background: getThumbnailColor(
                                            list.name
                                        ),
                                    }}
                                >
                                    <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3
                                            className="font-semibold truncate text-sm sm:text-base"
                                            style={{ color: "#1E293B" }}
                                        >
                                            {list.name}
                                        </h3>
                                    </div>
                                    {list.description && (
                                        <p
                                            className="text-sm truncate"
                                            style={{
                                                color: "var(--muted)",
                                            }}
                                        >
                                            {list.description}
                                        </p>
                                    )}
                                    {/* Meta - mobile inline */}
                                    <div className="flex items-center gap-3 mt-1.5 sm:hidden">
                                        <span
                                            className="flex items-center gap-1 text-xs"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            <Bookmark className="w-3 h-3" />
                                            {list.itemCount} {singleItemLabel}
                                        </span>
                                        <span
                                            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5"
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
                                                ? t(locale, "common.public")
                                                : t(locale, "common.private")}
                                        </span>
                                    </div>
                                </div>

                                {/* Meta - desktop */}
                                <div className="hidden sm:flex items-center gap-4 shrink-0">
                                    <span
                                        className="flex items-center gap-1.5 text-sm"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <Bookmark className="w-3.5 h-3.5" />
                                        {list.itemCount} {singleItemLabel}
                                    </span>
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
                                            ? t(locale, "common.public")
                                            : t(locale, "common.private")}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
