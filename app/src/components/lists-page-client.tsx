"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FolderOpen,
    Plus,
    Globe,
    Lock,
    Bookmark,
    Search,
    List,
    LayoutGrid,
    Inbox,
} from "lucide-react";
import { getThumbnailColor, getInitials } from "@/lib/utils";
import { CreateListModal } from "@/components/create-list-modal";

interface ListData {
    id: string;
    name: string;
    description: string | null;
    thumbnail: string | null;
    coverImage: string | null;
    viewMode: string;
    shareSlug: string | null;
    isDefault: boolean;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ListsPageClientProps {
    lists: ListData[];
    uncategorizedCount: number;
    locale: string;
    singleItemLabel: string;
    translations: {
        title: string;
        subtitle: string;
        createNew: string;
        emptyTitle: string;
        emptyDesc: string;
        createFirst: string;
        searchPlaceholder: string;
        uncategorized: string;
        uncategorizedDesc: string;
        totalItems: string;
        publicCount: string;
        createNewHint: string;
        publicLabel: string;
        privateLabel: string;
    };
}

export function ListsPageClient({
    lists,
    uncategorizedCount,
    locale,
    singleItemLabel,
    translations: t,
}: ListsPageClientProps) {
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    const totalItems = lists.reduce((sum, l) => sum + l.itemCount, 0);
    const publicCount = lists.filter((l) => l.viewMode === "PUBLIC").length;

    const filtered = lists.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase())
    );

    const showUncategorized =
        uncategorizedCount > 0 &&
        (search === "" ||
            t.uncategorized.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8 page-header-responsive">
                <div>
                    <div className="flex items-center gap-3">
                        <h1
                            className="text-xl sm:text-2xl font-bold"
                            style={{ color: "#1E293B" }}
                        >
                            {t.title}
                        </h1>
                        {lists.length > 0 && (
                            <span
                                className="text-xs font-bold px-2.5 py-0.5"
                                style={{
                                    background:
                                        "color-mix(in srgb, var(--primary) 10%, transparent)",
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
                        {t.subtitle}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="gradient-btn"
                    style={{ border: "none", cursor: "pointer" }}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.createNew}</span>
                </button>
            </div>

            {/* Search + View Toggle */}
            {lists.length > 0 && (
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--muted-light)" }}
                        />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.7)",
                                outline: "none",
                                color: "#334155",
                            }}
                        />
                    </div>
                    <div
                        className="flex items-center"
                        style={{
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(226,232,240,0.8)",
                            background: "rgba(255,255,255,0.7)",
                            overflow: "hidden",
                        }}
                    >
                        <button
                            onClick={() => setViewMode("list")}
                            className="p-2.5 cursor-pointer transition-colors"
                            style={{
                                background:
                                    viewMode === "list"
                                        ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                                        : "transparent",
                                color:
                                    viewMode === "list"
                                        ? "var(--primary)"
                                        : "var(--muted-light)",
                                border: "none",
                            }}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className="p-2.5 cursor-pointer transition-colors"
                            style={{
                                background:
                                    viewMode === "grid"
                                        ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                                        : "transparent",
                                color:
                                    viewMode === "grid"
                                        ? "var(--primary)"
                                        : "var(--muted-light)",
                                border: "none",
                            }}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {lists.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background:
                                "color-mix(in srgb, var(--primary) 8%, transparent)",
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
                        {t.emptyTitle}
                    </h3>
                    <p
                        className="text-sm mb-5"
                        style={{ color: "var(--muted)" }}
                    >
                        {t.emptyDesc}
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="gradient-btn"
                        style={{ border: "none", cursor: "pointer" }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t.createFirst}</span>
                    </button>
                </div>
            )}

            {/* LIST VIEW */}
            {lists.length > 0 && viewMode === "list" && (
                <div className="space-y-2">
                    {filtered.map((list) => (
                        <Link
                            key={list.id}
                            href={`/lists/${list.id}`}
                            className="glass-card glass-card-hover block px-3 py-2.5 group"
                            style={{ textDecoration: "none" }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Thumbnail / Avatar */}
                                {list.thumbnail ? (
                                    <div
                                        className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                                        style={{
                                            border: "1.5px solid rgba(0,0,0,0.06)",
                                        }}
                                    >
                                        <img
                                            src={list.thumbnail}
                                            alt={list.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: getThumbnailColor(
                                                list.name
                                            ),
                                        }}
                                    >
                                        <span className="text-white font-bold text-xs">
                                            {getInitials(list.name)}
                                        </span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="font-semibold truncate text-sm sm:text-base"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {list.name}
                                    </h3>
                                    {list.description && (
                                        <p
                                            className="text-xs truncate"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            {list.description}
                                        </p>
                                    )}
                                </div>

                                {/* Badges */}
                                <div className="hidden sm:flex items-center gap-3 shrink-0">
                                    <span
                                        className="flex items-center gap-1.5 text-sm"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <Bookmark className="w-3.5 h-3.5" />
                                        {list.itemCount}
                                    </span>
                                    <span
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                                        style={{
                                            borderRadius:
                                                "var(--radius-full)",
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
                                            ? t.publicLabel
                                            : t.privateLabel}
                                    </span>
                                </div>

                                {/* Mobile badges */}
                                <div className="flex items-center gap-2 sm:hidden shrink-0">
                                    <span
                                        className="text-xs"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <Bookmark className="w-3 h-3 inline mr-1" />
                                        {list.itemCount}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Uncategorized */}
                    {showUncategorized && (
                        <Link
                            href="/lists/uncategorized"
                            className="glass-card glass-card-hover block px-3 py-2.5 group"
                            style={{ textDecoration: "none" }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #94A3B8, #CBD5E1)",
                                    }}
                                >
                                    <span className="text-white font-bold text-xs">
                                        FL
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="font-semibold truncate text-sm sm:text-base"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {t.uncategorized}
                                    </h3>
                                    <p
                                        className="text-sm truncate mt-0.5"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        {t.uncategorizedDesc}
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 shrink-0">
                                    <span
                                        className="flex items-center gap-1.5 text-sm"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <Bookmark className="w-3.5 h-3.5" />
                                        {uncategorizedCount}
                                    </span>
                                    <span
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                                        style={{
                                            borderRadius:
                                                "var(--radius-full)",
                                            background:
                                                "rgba(100, 116, 139, 0.06)",
                                            color: "#94A3B8",
                                        }}
                                    >
                                        <Lock className="w-3 h-3" />
                                        {t.privateLabel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 sm:hidden shrink-0">
                                    <span
                                        className="text-xs"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <Bookmark className="w-3 h-3 inline mr-1" />
                                        {uncategorizedCount}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Create New Row */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="block p-4 group text-center w-full"
                        style={{
                            textDecoration: "none",
                            borderRadius: "var(--radius-lg)",
                            border: "2px dashed rgba(226,232,240,0.8)",
                            transition: "all 0.2s",
                            background: "transparent",
                            cursor: "pointer",
                        }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Plus
                                className="w-4 h-4"
                                style={{ color: "var(--muted-light)" }}
                            />
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--muted)" }}
                            >
                                {t.createNew === "Tạo mới"
                                    ? "Tạo bộ sưu tập mới"
                                    : "Create new collection"}
                            </span>
                        </div>
                        <p
                            className="text-xs mt-1"
                            style={{ color: "var(--muted-light)" }}
                        >
                            {t.createNewHint}
                        </p>
                    </button>
                </div>
            )}

            {/* GRID VIEW */}
            {lists.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filtered.map((list) => (
                        <Link
                            key={list.id}
                            href={`/lists/${list.id}`}
                            className="glass-card glass-card-hover block overflow-hidden group"
                            style={{ textDecoration: "none" }}
                        >
                            {/* Cover Image */}
                            <div
                                className="w-full relative overflow-hidden"
                                style={{ height: "160px" }}
                            >
                                {list.thumbnail ? (
                                    <img
                                        src={list.thumbnail}
                                        alt={list.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center"
                                        style={{
                                            background: getThumbnailColor(
                                                list.name
                                            ),
                                        }}
                                    >
                                        <FolderOpen className="w-10 h-10 text-white opacity-40" />
                                    </div>
                                )}

                                {/* Overlay badges */}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className="flex items-center gap-1 text-xs font-medium px-2 py-1"
                                        style={{
                                            borderRadius:
                                                "var(--radius-full)",
                                            background:
                                                list.viewMode === "PUBLIC"
                                                    ? "rgba(22, 163, 74, 0.85)"
                                                    : "rgba(100, 116, 139, 0.75)",
                                            color: "#fff",
                                            backdropFilter: "blur(4px)",
                                        }}
                                    >
                                        {list.viewMode === "PUBLIC" ? (
                                            <Globe className="w-3 h-3" />
                                        ) : (
                                            <Lock className="w-3 h-3" />
                                        )}
                                        {list.viewMode === "PUBLIC"
                                            ? t.publicLabel
                                            : t.privateLabel}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span
                                        className="flex items-center gap-1 text-xs font-medium px-2 py-1"
                                        style={{
                                            borderRadius:
                                                "var(--radius-full)",
                                            background:
                                                "rgba(0, 0, 0, 0.45)",
                                            color: "#fff",
                                            backdropFilter: "blur(4px)",
                                        }}
                                    >
                                        <Bookmark className="w-3 h-3" />
                                        {list.itemCount} {singleItemLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        background: getThumbnailColor(
                                            list.name
                                        ),
                                    }}
                                >
                                    <span className="text-white font-bold text-xs">
                                        {getInitials(list.name)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h3
                                        className="font-semibold text-sm truncate"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {list.name}
                                    </h3>
                                    {list.description && (
                                        <p
                                            className="text-xs truncate"
                                            style={{
                                                color: "var(--muted)",
                                            }}
                                        >
                                            {list.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Uncategorized Grid Card */}
                    {showUncategorized && (
                        <Link
                            href="/lists/uncategorized"
                            className="glass-card glass-card-hover block overflow-hidden group"
                            style={{ textDecoration: "none" }}
                        >
                            <div
                                className="w-full relative overflow-hidden flex items-center justify-center"
                                style={{
                                    height: "160px",
                                    background:
                                        "linear-gradient(135deg, #94A3B8, #CBD5E1)",
                                }}
                            >
                                <Inbox className="w-10 h-10 text-white opacity-40" />
                                <div className="absolute top-3 right-3">
                                    <span
                                        className="flex items-center gap-1 text-xs font-medium px-2 py-1"
                                        style={{
                                            borderRadius: "var(--radius-full)",
                                            background: "rgba(0, 0, 0, 0.45)",
                                            color: "#fff",
                                            backdropFilter: "blur(4px)",
                                        }}
                                    >
                                        <Bookmark className="w-3 h-3" />
                                        {uncategorizedCount} {singleItemLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #94A3B8, #CBD5E1)",
                                    }}
                                >
                                    <span className="text-white font-bold text-xs">
                                        FL
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h3
                                        className="font-semibold text-sm truncate"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {t.uncategorized}
                                    </h3>
                                    <p
                                        className="text-xs truncate"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        {t.uncategorizedDesc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            )}

            {/* No search results */}
            {lists.length > 0 &&
                filtered.length === 0 &&
                !showUncategorized && (
                    <div className="glass-card p-10 text-center">
                        <Search
                            className="w-8 h-8 mx-auto mb-3"
                            style={{ color: "var(--muted-light)" }}
                        />
                        <p
                            className="text-sm"
                            style={{ color: "var(--muted)" }}
                        >
                            Không tìm thấy bộ sưu tập nào
                        </p>
                    </div>
                )}
            {/* Create List Modal */}
            <CreateListModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
