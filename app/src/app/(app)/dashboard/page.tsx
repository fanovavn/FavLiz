import {
    Bookmark,
    FolderOpen,
    Tags,
    Globe,
    Plus,
    Clock,
    Lock,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/item-actions";
import { getProfile } from "@/lib/user-actions";
import { getThumbnailColor } from "@/lib/utils";
import { getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const profile = await getProfile();
    const locale = await getLanguage();
    const displayName = profile.name || profile.username || profile.email.split("@")[0];
    const itemsLabel = profile.itemsLabel || t(locale, "items.title");
    const singleItemLabel = itemsLabel === t(locale, "items.title") ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    const statCards = [
        {
            label: itemsLabel,
            value: stats.itemsCount,
            icon: Bookmark,
            color: "var(--primary)",
            bg: "rgba(100, 116, 139, 0.08)",
        },
        {
            label: t(locale, "dashboard.collections"),
            value: stats.listsCount,
            icon: FolderOpen,
            color: "var(--primary)",
            bg: "color-mix(in srgb, var(--primary) 10%, transparent)",
        },
        {
            label: t(locale, "sidebar.tags"),
            value: stats.tagsCount,
            icon: Tags,
            color: "#2563EB",
            bg: "rgba(37, 99, 235, 0.08)",
        },
        {
            label: t(locale, "common.public"),
            value: stats.publicCount,
            icon: Globe,
            color: "#16A34A",
            bg: "rgba(22, 163, 74, 0.08)",
        },
    ];

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8 page-header-responsive">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#1E293B" }}>
                        {t(locale, "dashboard.greeting", { name: displayName })}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        {t(locale, "dashboard.subtitle")}
                    </p>
                </div>
                <Link
                    href="/items/new"
                    className="gradient-btn"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(locale, "dashboard.addItem", { item: singleItemLabel })}</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                {statCards.map((card) => (
                    <div key={card.label} className="stat-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 flex items-center justify-center"
                                style={{
                                    background: card.bg,
                                    borderRadius: "var(--radius-md)",
                                }}
                            >
                                <card.icon
                                    className="w-5 h-5"
                                    style={{ color: card.color }}
                                />
                            </div>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "#1E293B" }}
                        >
                            {card.value}
                        </p>
                        <p
                            className="text-sm mt-0.5"
                            style={{ color: "var(--muted)" }}
                        >
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Items + Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-5">
                {/* Recent Items */}
                <div className="md:col-span-2 glass-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2
                            className="font-semibold flex items-center gap-2"
                            style={{ color: "#1E293B" }}
                        >
                            <Clock
                                className="w-4 h-4"
                                style={{ color: "var(--primary)" }}
                            />
                            {t(locale, "dashboard.recentlyAdded")}
                        </h2>
                        <Link
                            href="/items"
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: "var(--primary)" }}
                        >
                            {t(locale, "common.viewAll")}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {stats.recentItems.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">
                                <Bookmark
                                    className="w-6 h-6"
                                    style={{ color: "var(--primary-light)" }}
                                />
                            </div>
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                {t(locale, "dashboard.noItemsYet", { item: singleItemLabel })}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {stats.recentItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/items/${item.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl transition-colors group cursor-pointer hover:bg-pink-50/50"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
                                        style={{
                                            background: getThumbnailColor(
                                                item.title
                                            ),
                                        }}
                                    >
                                        {item.title
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="font-medium truncate text-sm"
                                            style={{ color: "#334155" }}
                                        >
                                            {item.title}
                                        </p>
                                        {item.tags.length > 0 && (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {item.tags
                                                    .slice(0, 3)
                                                    .map((tag) => (
                                                        <span
                                                            key={tag.id}
                                                            className="text-xs"
                                                            style={{
                                                                color: "var(--primary-light)",
                                                            }}
                                                        >
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`badge ${item.viewMode === "PUBLIC" ? "badge-public" : "badge-private"}`}
                                    >
                                        {item.viewMode === "PUBLIC" ? (
                                            <>
                                                <Globe className="w-3 h-3" /> {t(locale, "common.public")}
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-3 h-3" /> {t(locale, "common.private")}
                                            </>
                                        )}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-4 sm:p-6">
                    <h2
                        className="font-semibold mb-5 flex items-center gap-2"
                        style={{ color: "#1E293B" }}
                    >
                        <Sparkles
                            className="w-4 h-4"
                            style={{ color: "var(--primary)" }}
                        />
                        {t(locale, "dashboard.quickActions")}
                    </h2>
                    <div className="space-y-2">
                        <Link
                            href="/items/new"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{
                                background: "rgba(100, 116, 139, 0.06)",
                                color: "#475569",
                            }}
                        >
                            <Plus className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.addNewItem", { item: singleItemLabel })}
                        </Link>
                        <Link
                            href="/items"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{
                                background: "rgba(100, 116, 139, 0.05)",
                                color: "var(--muted)",
                            }}
                        >
                            <Bookmark className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.viewAllItems", { item: singleItemLabel })}
                        </Link>
                        <Link
                            href="/lists"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{
                                background: "rgba(100, 116, 139, 0.05)",
                                color: "var(--muted)",
                            }}
                        >
                            <FolderOpen className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.manageCollections")}
                        </Link>
                        <Link
                            href="/tags"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{
                                background: "rgba(100, 116, 139, 0.05)",
                                color: "var(--muted)",
                            }}
                        >
                            <Tags className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.manageTags")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
