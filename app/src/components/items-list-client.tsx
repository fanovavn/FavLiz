"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    Plus,
    SlidersHorizontal,
    Bookmark,
    LayoutList,
    LayoutGrid,
    FolderOpen,
    Tags as TagsIcon,
    X,
    Filter,
    Lock,
    Globe,
    Calendar,
} from "lucide-react";
import { ItemCard } from "@/components/item-card";
import { useItemsLabel } from "@/components/items-label-provider";
import { useLanguage } from "@/components/language-provider";
import { getThumbnailColor } from "@/lib/utils";
import { useTagPopup } from "@/components/tag-detail-popup";
import Link from "next/link";

interface ItemType {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    viewMode: string;
    tags: { id: string; name: string }[];
    lists: { id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
}

interface ListType {
    id: string;
    name: string;
    itemCount: number;
}

interface TagType {
    id: string;
    name: string;
    itemCount: number;
}

interface ItemsListClientProps {
    initialData: {
        items: ItemType[];
        total: number;
        totalPages: number;
        currentPage: number;
    };
    lists: ListType[];
    tags: TagType[];
}

function ItemRow({ item, openTag }: { item: ItemType; openTag: (id: string, name: string) => void }) {
    const bgColor = getThumbnailColor(item.title);
    return (
        <Link href={`/items/${item.id}`} className="block">
            <div
                className="flex items-center gap-4 px-5 py-4 transition-all hover:shadow-sm"
                style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(226,232,240,0.5)",
                }}
            >
                {/* Thumbnail */}
                {item.thumbnail ? (
                    <div
                        className="shrink-0 overflow-hidden"
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "var(--radius-md)",
                        }}
                    >
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="shrink-0 flex items-center justify-center text-sm font-bold text-white uppercase"
                        style={{
                            width: 52,
                            height: 52,
                            background: bgColor,
                            borderRadius: "var(--radius-md)",
                            textShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        }}
                    >
                        {item.title.slice(0, 2)}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3
                        className="font-semibold text-sm truncate"
                        style={{ color: "#334155" }}
                    >
                        {item.title}
                    </h3>
                    {item.description && (
                        <p
                            className="text-xs truncate mt-0.5"
                            style={{ color: "var(--muted)" }}
                        >
                            {item.description}
                        </p>
                    )}
                    {/* Tags + Date row */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {item.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className="tag-chip cursor-pointer"
                                style={{ padding: "1px 7px", fontSize: "0.65rem" }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openTag(tag.id, tag.name);
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                        {item.tags.length > 3 && (
                            <span
                                className="text-xs"
                                style={{ color: "var(--muted-light)" }}
                            >
                                +{item.tags.length - 3}
                            </span>
                        )}
                        <span
                            className="text-xs flex items-center gap-1"
                            style={{ color: "var(--muted-light)" }}
                        >
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                </div>

                {/* Badge */}
                <span
                    className={`badge shrink-0 ${item.viewMode === "PUBLIC" ? "badge-public" : "badge-private"}`}
                >
                    {item.viewMode === "PUBLIC" ? (
                        <>
                            <Globe className="w-3 h-3" /> Public
                        </>
                    ) : (
                        <>
                            <Lock className="w-3 h-3" /> Private
                        </>
                    )}
                </span>
            </div>
        </Link>
    );
}

function SkeletonRow() {
    return (
        <div
            className="flex items-center gap-4 px-5 py-4 animate-pulse"
            style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(226,232,240,0.5)",
            }}
        >
            <div className="shrink-0 rounded-lg" style={{ width: 52, height: 52, background: "rgba(226,232,240,0.6)" }} />
            <div className="flex-1 space-y-2">
                <div className="rounded" style={{ width: "40%", height: 14, background: "rgba(226,232,240,0.6)" }} />
                <div className="rounded" style={{ width: "65%", height: 10, background: "rgba(226,232,240,0.4)" }} />
                <div className="flex gap-2">
                    <div className="rounded-full" style={{ width: 48, height: 16, background: "rgba(226,232,240,0.4)" }} />
                    <div className="rounded-full" style={{ width: 40, height: 16, background: "rgba(226,232,240,0.4)" }} />
                </div>
            </div>
            <div className="shrink-0 rounded-full" style={{ width: 72, height: 24, background: "rgba(226,232,240,0.4)" }} />
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="glass-card overflow-hidden animate-pulse">
            <div style={{ width: "100%", aspectRatio: "16/10", background: "rgba(226,232,240,0.5)" }} />
            <div className="p-4 space-y-2">
                <div className="rounded" style={{ width: "60%", height: 14, background: "rgba(226,232,240,0.6)" }} />
                <div className="rounded" style={{ width: "80%", height: 10, background: "rgba(226,232,240,0.4)" }} />
                <div className="flex gap-1.5 mt-2">
                    <div className="rounded-full" style={{ width: 48, height: 16, background: "rgba(226,232,240,0.4)" }} />
                    <div className="rounded-full" style={{ width: 40, height: 16, background: "rgba(226,232,240,0.4)" }} />
                </div>
            </div>
        </div>
    );
}

export function ItemsListClient({ initialData, lists, tags }: ItemsListClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "newest");
    const [selectedListId, setSelectedListId] = useState(searchParams.get("listId") || "");
    const [selectedTagId, setSelectedTagId] = useState(searchParams.get("tagId") || "");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const { openTag } = useTagPopup();

    const updateUrl = useCallback(
        (newSearch: string, newSort: string, newPage: number, newListId: string, newTagId: string) => {
            const params = new URLSearchParams();
            if (newSearch) params.set("search", newSearch);
            if (newSort !== "newest") params.set("sort", newSort);
            if (newPage > 1) params.set("page", String(newPage));
            if (newListId) params.set("listId", newListId);
            if (newTagId) params.set("tagId", newTagId);
            const query = params.toString();
            startTransition(() => {
                router.push(`/items${query ? `?${query}` : ""}`);
            });
        },
        [router]
    );

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateUrl(search, sort, 1, selectedListId, selectedTagId);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, sort, selectedListId, selectedTagId, updateUrl]);

    const { items, total, totalPages, currentPage } = initialData;
    const { itemsLabel, singleItemLabel } = useItemsLabel();
    const { t } = useLanguage();

    const hasActiveFilters = selectedListId || selectedTagId;

    const clearFilters = () => {
        setSelectedListId("");
        setSelectedTagId("");
    };

    /* ── Filter Sidebar Content (shared between desktop & mobile modal) ── */
    const filterContent = (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--muted-light)" }}
                    />
                    <input
                        type="text"
                        className="input-glass !pl-10 w-full text-sm"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Collections */}
            {lists.length > 0 && (
                <div>
                    <h4
                        className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                        style={{ color: "#64748B" }}
                    >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Bộ sưu tập
                    </h4>
                    <div className="space-y-1">
                        {lists.map((list) => (
                            <button
                                key={list.id}
                                onClick={() =>
                                    setSelectedListId(
                                        selectedListId === list.id ? "" : list.id
                                    )
                                }
                                className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-all cursor-pointer"
                                style={{
                                    background:
                                        selectedListId === list.id
                                            ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                                            : "transparent",
                                    color:
                                        selectedListId === list.id
                                            ? "var(--primary)"
                                            : "#475569",
                                    fontWeight:
                                        selectedListId === list.id ? 600 : 400,
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedListId === list.id}
                                        readOnly
                                        className="accent-green-500 cursor-pointer"
                                        style={{ width: 14, height: 14 }}
                                    />
                                    {list.name}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{ color: "var(--muted-light)" }}
                                >
                                    {list.itemCount}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div>
                    <h4
                        className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                        style={{ color: "#64748B" }}
                    >
                        <TagsIcon className="w-3.5 h-3.5" />
                        Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() =>
                                    setSelectedTagId(
                                        selectedTagId === tag.id ? "" : tag.id
                                    )
                                }
                                className="tag-chip cursor-pointer transition-all"
                                style={{
                                    padding: "3px 10px",
                                    fontSize: "0.75rem",
                                    background:
                                        selectedTagId === tag.id
                                            ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                                            : undefined,
                                    color:
                                        selectedTagId === tag.id
                                            ? "var(--primary)"
                                            : undefined,
                                    borderColor:
                                        selectedTagId === tag.id
                                            ? "color-mix(in srgb, var(--primary) 30%, transparent)"
                                            : undefined,
                                    fontWeight:
                                        selectedTagId === tag.id ? 600 : 400,
                                }}
                            >
                                #{tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 page-header-responsive">
                <div>
                    <h1
                        className="text-xl sm:text-2xl font-bold flex items-center gap-3"
                        style={{ color: "#1E293B" }}
                    >
                        {itemsLabel}
                        <span
                            className="text-sm font-medium px-2.5 py-0.5 rounded-full"
                            style={{
                                background: "rgba(100, 116, 139, 0.1)",
                                color: "#475569",
                            }}
                        >
                            {total}
                        </span>
                    </h1>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--muted)" }}
                    >
                        {t("items.subtitle", { item: singleItemLabel })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div
                        className="hidden sm:flex items-center gap-0.5 p-1"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(241,245,249,0.8)",
                            border: "1px solid rgba(226,232,240,0.6)",
                        }}
                    >
                        <button
                            onClick={() => setViewMode("list")}
                            className="w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer"
                            style={{
                                background: viewMode === "list" ? "#fff" : "transparent",
                                color: viewMode === "list" ? "var(--primary)" : "var(--muted-light)",
                                boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            }}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className="w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer"
                            style={{
                                background: viewMode === "grid" ? "#fff" : "transparent",
                                color: viewMode === "grid" ? "var(--primary)" : "var(--muted-light)",
                                boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            }}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    <Link href="/items/new" className="gradient-btn">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {t("items.addItem", { item: singleItemLabel })}
                        </span>
                    </Link>
                </div>
            </div>

            {/* Mobile: Filter bar + count */}
            <div className="sm:hidden flex items-center justify-between mb-4">
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                    Hiện thị {items.length}/{total} {singleItemLabel}
                </span>
                <div className="flex items-center gap-2">
                    {/* Mobile view toggle */}
                    <div
                        className="flex items-center gap-0.5 p-0.5"
                        style={{
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(241,245,249,0.8)",
                            border: "1px solid rgba(226,232,240,0.6)",
                        }}
                    >
                        <button
                            onClick={() => setViewMode("list")}
                            className="w-7 h-7 flex items-center justify-center rounded transition-all cursor-pointer"
                            style={{
                                background: viewMode === "list" ? "#fff" : "transparent",
                                color: viewMode === "list" ? "var(--primary)" : "var(--muted-light)",
                            }}
                        >
                            <LayoutList className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className="w-7 h-7 flex items-center justify-center rounded transition-all cursor-pointer"
                            style={{
                                background: viewMode === "grid" ? "#fff" : "transparent",
                                color: viewMode === "grid" ? "var(--primary)" : "var(--muted-light)",
                            }}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors relative"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(226,232,240,0.8)",
                            color: hasActiveFilters ? "var(--primary)" : "var(--muted)",
                        }}
                    >
                        <Filter className="w-4 h-4" />
                        {hasActiveFilters && (
                            <span
                                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                                style={{ background: "var(--primary)" }}
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* Sub header bar: count + sort */}
            <div
                className="hidden sm:flex items-center justify-between mb-5 px-5 py-3"
                style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(226,232,240,0.5)",
                }}
            >
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                    Hiện thị <strong style={{ color: "#334155" }}>{items.length}</strong> / {total} {singleItemLabel}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="ml-3 text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                            style={{ color: "var(--primary)" }}
                        >
                            <X className="w-3 h-3" />
                            Xóa bộ lọc
                        </button>
                    )}
                </span>
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--muted-light)" }} />
                    <select
                        className="text-sm cursor-pointer border-none bg-transparent font-medium outline-none"
                        style={{ color: "#475569" }}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="newest">{t("items.sortNewest")}</option>
                        <option value="oldest">{t("items.sortOldest")}</option>
                        <option value="az">{t("items.sortAZ")}</option>
                        <option value="za">{t("items.sortZA")}</option>
                    </select>
                </div>
            </div>

            {/* Main layout: content + sidebar (right) */}
            <div className="flex gap-6">

                {/* Content (left) */}
                <div className="flex-1 min-w-0">
                    {items.length === 0 ? (
                        <div className="glass-card p-12">
                            <div className="empty-state">
                                <div className="icon">
                                    <Bookmark
                                        className="w-6 h-6"
                                        style={{ color: "var(--primary-light)" }}
                                    />
                                </div>
                                <h3
                                    className="text-lg font-semibold mb-2"
                                    style={{ color: "#334155" }}
                                >
                                    {search || hasActiveFilters
                                        ? t("items.noSearchResults", { item: singleItemLabel })
                                        : t("items.noItems", { item: singleItemLabel })}
                                </h3>
                                <p
                                    className="text-sm mb-4"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {search || hasActiveFilters
                                        ? t("items.tryDifferent")
                                        : t("items.noItemsDesc", { item: singleItemLabel })}
                                </p>
                                {!search && !hasActiveFilters && (
                                    <Link
                                        href="/items/new"
                                        className="gradient-btn inline-flex items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t("items.startAdding", { item: singleItemLabel })}
                                    </Link>
                                )}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="gradient-btn inline-flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : isPending ? (
                        /* Loading skeleton */
                        viewMode === "list" ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <SkeletonRow key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="item-grid">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        )
                    ) : viewMode === "list" ? (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <ItemRow key={item.id} item={item} openTag={openTag} />
                            ))}
                        </div>
                    ) : (
                        <div className="item-grid">
                            {items.map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                className="pagination-btn"
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    updateUrl(search, sort, currentPage - 1, selectedListId, selectedTagId)
                                }
                            >
                                ←
                            </button>
                            {Array.from(
                                { length: Math.min(totalPages, 5) },
                                (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            className={`pagination-btn ${page === currentPage ? "active" : ""}`}
                                            onClick={() =>
                                                updateUrl(search, sort, page, selectedListId, selectedTagId)
                                            }
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                            )}
                            <button
                                className="pagination-btn"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    updateUrl(search, sort, currentPage + 1, selectedListId, selectedTagId)
                                }
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop sidebar (right) */}
                <aside
                    className="hidden sm:block shrink-0"
                    style={{ width: 240 }}
                >
                    <div
                        className="glass-card p-4 sticky"
                        style={{ top: 80 }}
                    >
                        {filterContent}
                    </div>
                </aside>
            </div>

            {/* Mobile Filter Modal */}
            {mobileFilterOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:hidden"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                    onClick={() => setMobileFilterOpen(false)}
                >
                    <div
                        className="w-full max-h-[80vh] overflow-y-auto p-5 pb-8"
                        style={{
                            background: "#fff",
                            borderRadius: "20px 20px 0 0",
                            animation: "slideUp 0.3s ease",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3
                                className="text-lg font-bold"
                                style={{ color: "#1E293B" }}
                            >
                                Bộ lọc
                            </h3>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="w-8 h-8 flex items-center justify-center cursor-pointer"
                                style={{
                                    borderRadius: "50%",
                                    background: "rgba(241,245,249,0.8)",
                                    color: "var(--muted)",
                                }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {filterContent}
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    clearFilters();
                                    setMobileFilterOpen(false);
                                }}
                                className="w-full mt-4 py-2.5 text-sm font-medium cursor-pointer transition-all"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: "rgba(239, 68, 68, 0.08)",
                                    color: "#EF4444",
                                    border: "1px solid rgba(239, 68, 68, 0.15)",
                                }}
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Slide-up animation for mobile modal */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
