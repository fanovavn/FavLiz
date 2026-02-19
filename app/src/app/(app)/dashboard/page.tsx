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
    TrendingUp,
    BarChart3,
    Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/item-actions";
import { getProfile } from "@/lib/user-actions";
import { getThumbnailColor } from "@/lib/utils";
import { getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";

// ── Color palette for tag distribution ──────────────────────
const TAG_COLORS = [
    "#16A34A", "#2563EB", "#D97706", "#DC2626", "#7C3AED", "#0D9488",
];

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const profile = await getProfile();
    const locale = await getLanguage();
    const displayName = profile.name || profile.username || profile.email.split("@")[0];
    const itemsLabel = profile.itemsLabel || t(locale, "items.title");
    const singleItemLabel = itemsLabel === t(locale, "items.title") ? t(locale, "items.title").toLowerCase() : itemsLabel.toLowerCase();

    // Time-based greeting
    const hour = new Date().getHours();
    const greetingKey = hour < 12 ? "dashboard.greetingMorning" : hour < 18 ? "dashboard.greetingAfternoon" : "dashboard.greetingEvening";

    // Weekly activity max for bar height calc
    const maxActivity = Math.max(...stats.weeklyActivity.map((d) => d.count), 1);
    const totalWeekly = stats.weeklyActivity.reduce((s, d) => s + d.count, 0);

    const statCards = [
        {
            label: itemsLabel,
            value: stats.itemsCount,
            icon: Bookmark,
            color: "var(--primary)",
            bg: "rgba(100, 116, 139, 0.08)",
            delta: stats.itemsThisWeek > 0 ? `+${stats.itemsThisWeek} ${t(locale, "dashboard.thisWeek")}` : null,
            deltaColor: "#16A34A",
        },
        {
            label: t(locale, "dashboard.collections"),
            value: stats.listsCount,
            icon: FolderOpen,
            color: "var(--primary)",
            bg: "color-mix(in srgb, var(--primary) 10%, transparent)",
            delta: null,
            deltaColor: "",
        },
        {
            label: t(locale, "sidebar.tags"),
            value: stats.tagsCount,
            icon: Tags,
            color: "#2563EB",
            bg: "rgba(37, 99, 235, 0.08)",
            delta: null,
            deltaColor: "",
        },
        {
            label: t(locale, "common.public"),
            value: stats.publicCount,
            icon: Globe,
            color: "#16A34A",
            bg: "rgba(22, 163, 74, 0.08)",
            delta: null,
            deltaColor: "",
        },
    ];

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">

            {/* ═══════════ 1. HERO BANNER ═══════════ */}
            <div
                className="rounded-2xl p-5 sm:p-7 mb-6 md:mb-8 relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--primary-dark) 100%)",
                }}
            >
                <div className="relative z-10">
                    <p className="text-xs mb-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                        📅 {new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : locale === "zh" ? "zh-CN" : locale === "ru" ? "ru-RU" : "en-US", { weekday: "long", day: "numeric", month: "2-digit", year: "numeric" })}
                    </p>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        {t(locale, greetingKey, { name: displayName })}
                    </h1>
                    <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {t(locale, "dashboard.heroSummary", {
                            items: String(stats.itemsCount),
                            itemLabel: singleItemLabel,
                            lists: String(stats.listsCount),
                        })}
                    </p>
                    <Link
                        href="/items/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                        style={{ color: "var(--primary-dark)" }}
                    >
                        <Plus className="w-4 h-4" />
                        {t(locale, "dashboard.addNewItem", { item: singleItemLabel })}
                    </Link>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>

            {/* ═══════════ 2. KPI STAT CARDS ═══════════ */}
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
                        <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                            {card.value}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                            {card.label}
                        </p>
                        {card.delta && (
                            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: card.deltaColor }}>
                                <TrendingUp className="w-3 h-3" />
                                {card.delta}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* ═══════════ 3. ACTIVITY CHART + TAG DISTRIBUTION ═══════════ */}
            <div className="grid md:grid-cols-5 gap-4 md:gap-5 mb-6 md:mb-8">
                {/* Weekly Activity Bar Chart */}
                <div className="md:col-span-3 glass-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E293B" }}>
                            <BarChart3 className="w-4 h-4" style={{ color: "var(--primary)" }} />
                            {t(locale, "dashboard.weeklyActivity")}
                        </h2>
                        <span className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                            {t(locale, "dashboard.totalAdded", { count: String(totalWeekly) })}
                        </span>
                    </div>
                    <div className="flex items-end gap-2 sm:gap-3 h-[140px]">
                        {stats.weeklyActivity.map((day, i) => {
                            const pct = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
                            const isToday = i === stats.weeklyActivity.length - 1;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                                    <span className="text-xs font-medium" style={{ color: "#64748B" }}>
                                        {day.count > 0 ? day.count : ""}
                                    </span>
                                    <div
                                        className="w-full rounded-lg transition-all"
                                        style={{
                                            height: `${Math.max(pct, 6)}%`,
                                            background: isToday
                                                ? "var(--primary)"
                                                : day.count > 0
                                                    ? "color-mix(in srgb, var(--primary) 40%, transparent)"
                                                    : "rgba(226,232,240,0.5)",
                                            minHeight: "8px",
                                        }}
                                    />
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: isToday ? "var(--primary)" : "#94A3B8",
                                            fontWeight: isToday ? 600 : 400,
                                        }}
                                    >
                                        {day.day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tag Distribution */}
                <div className="md:col-span-2 glass-card p-4 sm:p-6">
                    <h2 className="font-semibold flex items-center gap-2 mb-5" style={{ color: "#1E293B" }}>
                        <Tags className="w-4 h-4" style={{ color: "var(--primary)" }} />
                        {t(locale, "dashboard.tagDistribution")}
                    </h2>
                    {stats.topTags.length === 0 ? (
                        <div className="flex items-center justify-center h-[120px]">
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                {t(locale, "dashboard.noData")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {stats.topTags.map((tag, i) => {
                                const totalTagItems = stats.topTags.reduce((s, t) => s + t.count, 0) || 1;
                                const pct = Math.round((tag.count / totalTagItems) * 100);
                                return (
                                    <div key={tag.id} className="flex items-center gap-2.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}
                                        />
                                        <span className="text-sm flex-1 truncate" style={{ color: "#475569" }}>
                                            {tag.name}
                                        </span>
                                        <span className="text-xs font-medium tabular-nums" style={{ color: "#94A3B8" }}>
                                            {tag.count}
                                        </span>
                                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(226,232,240,0.5)" }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: TAG_COLORS[i % TAG_COLORS.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════ 4. RECENT ITEMS + QUICK ACTIONS ═══════════ */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
                {/* Recent Items */}
                <div className="md:col-span-2 glass-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E293B" }}>
                            <Clock className="w-4 h-4" style={{ color: "var(--primary)" }} />
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
                                <Bookmark className="w-6 h-6" style={{ color: "var(--primary-light)" }} />
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
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
                                            style={{ background: getThumbnailColor(item.title) }}
                                        >
                                            {item.title.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate text-sm" style={{ color: "#334155" }}>
                                            {item.title}
                                        </p>
                                        {item.tags.length > 0 && (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag.id} className="text-xs" style={{ color: "var(--primary-light)" }}>
                                                        #{tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`badge ${item.viewMode === "PUBLIC" ? "badge-public" : "badge-private"}`}>
                                        {item.viewMode === "PUBLIC" ? (
                                            <><Globe className="w-3 h-3" /> {t(locale, "common.public")}</>
                                        ) : (
                                            <><Lock className="w-3 h-3" /> {t(locale, "common.private")}</>
                                        )}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-4 sm:p-6">
                    <h2 className="font-semibold mb-5 flex items-center gap-2" style={{ color: "#1E293B" }}>
                        <Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} />
                        {t(locale, "dashboard.quickActions")}
                    </h2>
                    <div className="space-y-2">
                        <Link
                            href="/items/new"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)", color: "var(--primary)" }}
                        >
                            <Plus className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.addNewItem", { item: singleItemLabel })}
                        </Link>
                        <Link
                            href="/items"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{ background: "rgba(100, 116, 139, 0.05)", color: "var(--muted)" }}
                        >
                            <Bookmark className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.viewAllItems", { item: singleItemLabel })}
                        </Link>
                        <Link
                            href="/lists"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{ background: "rgba(100, 116, 139, 0.05)", color: "var(--muted)" }}
                        >
                            <FolderOpen className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.manageCollections")}
                        </Link>
                        <Link
                            href="/tags"
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                            style={{ background: "rgba(100, 116, 139, 0.05)", color: "var(--muted)" }}
                        >
                            <Tags className="w-[18px] h-[18px]" />
                            {t(locale, "dashboard.manageTags")}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══════════ 5. FEATURED COLLECTIONS + POPULAR TAGS ═══════════ */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
                {/* Featured Collections */}
                <div className="glass-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E293B" }}>
                            <FolderOpen className="w-4 h-4" style={{ color: "var(--primary)" }} />
                            {t(locale, "dashboard.featuredCollections")}
                        </h2>
                        <Link href="/lists" className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--primary)" }}>
                            {t(locale, "common.viewAll")}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    {stats.featuredLists.length === 0 ? (
                        <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>
                            {t(locale, "dashboard.noData")}
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {stats.featuredLists.map((list) => (
                                <Link
                                    key={list.id}
                                    href={`/lists/${list.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50/80 cursor-pointer"
                                >
                                    {list.thumbnail ? (
                                        <img
                                            src={list.thumbnail}
                                            alt={list.name}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: getThumbnailColor(list.name) }}
                                        >
                                            <FolderOpen className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate" style={{ color: "#334155" }}>
                                            {list.name}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                                            {t(locale, "dashboard.items2", { count: String(list.itemCount) })}
                                        </p>
                                    </div>
                                    <div
                                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                                            color: "var(--primary)",
                                        }}
                                    >
                                        {list.itemCount}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Tags */}
                <div className="glass-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E293B" }}>
                            <Tags className="w-4 h-4" style={{ color: "var(--primary)" }} />
                            {t(locale, "dashboard.popularTags")}
                        </h2>
                        <Link href="/tags" className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--primary)" }}>
                            {t(locale, "common.viewAll")}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    {stats.topTags.length === 0 ? (
                        <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>
                            {t(locale, "dashboard.noData")}
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {stats.topTags.map((tag, i) => (
                                <Link
                                    key={tag.id}
                                    href={`/tags/${tag.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
                                    style={{
                                        background: TAG_COLORS[i % TAG_COLORS.length] + "14",
                                        color: TAG_COLORS[i % TAG_COLORS.length],
                                    }}
                                >
                                    #{tag.name}
                                    <span
                                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                        style={{
                                            background: TAG_COLORS[i % TAG_COLORS.length] + "20",
                                        }}
                                    >
                                        {tag.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════ 6. TIP BANNER ═══════════ */}
            <div
                className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                style={{ border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)", background: "color-mix(in srgb, var(--primary) 3%, transparent)" }}
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
                >
                    <Lightbulb className="w-5 h-5" style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                        {t(locale, "dashboard.tipTitle")}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {t(locale, "dashboard.tipDesc")}
                    </p>
                </div>
                <Link
                    href="/tags"
                    className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                    style={{
                        background: "var(--primary)",
                        color: "white",
                    }}
                >
                    {t(locale, "dashboard.tryNow")}
                </Link>
            </div>
        </div>
    );
}
