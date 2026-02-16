"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, SlidersHorizontal, Bookmark } from "lucide-react";
import { ItemCard } from "@/components/item-card";
import { useItemsLabel } from "@/components/items-label-provider";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";

interface ItemsListClientProps {
    initialData: {
        items: Array<{
            id: string;
            title: string;
            description?: string | null;
            thumbnail?: string | null;
            viewMode: string;
            tags: { id: string; name: string }[];
            lists: { id: string; name: string }[];
            createdAt: string;
            updatedAt: string;
        }>;
        total: number;
        totalPages: number;
        currentPage: number;
    };
}

export function ItemsListClient({ initialData }: ItemsListClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "newest");

    const updateUrl = useCallback(
        (newSearch: string, newSort: string, newPage: number) => {
            const params = new URLSearchParams();
            if (newSearch) params.set("search", newSearch);
            if (newSort !== "newest") params.set("sort", newSort);
            if (newPage > 1) params.set("page", String(newPage));
            const query = params.toString();
            router.push(`/items${query ? `?${query}` : ""}`);
        },
        [router]
    );

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateUrl(search, sort, 1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, sort, updateUrl]);

    const { items, total, totalPages, currentPage } = initialData;
    const { itemsLabel, singleItemLabel } = useItemsLabel();
    const { t } = useLanguage();

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-6xl">
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
                <Link href="/items/new" className="gradient-btn">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("items.addItem", { item: singleItemLabel })}</span>
                </Link>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--muted-light)" }}
                    />
                    <input
                        type="text"
                        className="search-glass"
                        placeholder={t("items.searchPlaceholder", { item: singleItemLabel })}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <SlidersHorizontal
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: "var(--muted-light)" }}
                    />
                    <select
                        className="input-glass !pl-10 !pr-8 appearance-none cursor-pointer text-sm min-w-[160px]"
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

            {/* Items Grid */}
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
                            {search
                                ? t("items.noSearchResults", { item: singleItemLabel })
                                : t("items.noItems", { item: singleItemLabel })}
                        </h3>
                        <p
                            className="text-sm mb-4"
                            style={{ color: "var(--muted)" }}
                        >
                            {search
                                ? t("items.tryDifferent")
                                : t("items.noItemsDesc", { item: singleItemLabel })}
                        </p>
                        {!search && (
                            <Link
                                href="/items/new"
                                className="gradient-btn inline-flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                {t("items.startAdding", { item: singleItemLabel })}
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="item-grid">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                className="pagination-btn"
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    updateUrl(search, sort, currentPage - 1)
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
                                                updateUrl(search, sort, page)
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
                                    updateUrl(search, sort, currentPage + 1)
                                }
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
