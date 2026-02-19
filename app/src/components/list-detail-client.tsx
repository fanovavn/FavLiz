"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Edit3,
    Globe,
    Lock,
    Bookmark,
    Calendar,
    Search,
    LayoutGrid,
    List,
    Inbox,
    ChevronDown,
    ChevronUp,
    Share2,
    Copy,
    Check,
    X,
    Link2,
} from "lucide-react";
import { ItemCard } from "@/components/item-card";
import { DeleteListButton } from "@/components/delete-list-dialog";
import { useTagPopup } from "@/components/tag-detail-popup";

// ─── TYPES ──────────────────────────────────────────────────

interface ListItem {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    viewMode: string;
    tags: { id: string; name: string }[];
    createdAt: string;
}

interface ListDetailClientProps {
    list: {
        id: string;
        name: string;
        description: string | null;
        thumbnail: string | null;
        viewMode: "PRIVATE" | "PUBLIC";
        itemCount: number;
        createdAt: string;
        items: ListItem[];
    };
    shareUrl: string | null;
    singleItemLabel: string;
    locale: string;
    emptyTitle: string;
    emptyDesc: string;
    addItemLabel: string;
}

// ─── COMPONENT ──────────────────────────────────────────────

export function ListDetailClient({
    list,
    shareUrl,
    singleItemLabel,
    emptyTitle,
    emptyDesc,
    addItemLabel,
}: ListDetailClientProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [descExpanded, setDescExpanded] = useState(false);
    const [sharePopupOpen, setSharePopupOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [fullShareUrl, setFullShareUrl] = useState("");
    const { openTag } = useTagPopup();

    useEffect(() => {
        if (shareUrl) {
            setFullShareUrl(`${window.location.origin}${shareUrl}`);
        }
    }, [shareUrl]);

    const handleCopyShareUrl = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(fullShareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = fullShareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    }, [fullShareUrl]);

    // ─── Filter items by search ─────────────────────────────
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return list.items;
        const q = searchQuery.toLowerCase().trim();
        return list.items.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
        );
    }, [list.items, searchQuery]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
        },
        []
    );

    return (
        <div className="max-w-[1280px] mx-auto">
            {/* ─── Hero Banner ──────────────────────────────── */}
            <div
                className="relative overflow-hidden"
                style={{
                    height: list.thumbnail ? "280px" : "180px",
                    borderRadius: "0 0 var(--radius-xl) var(--radius-xl)",
                }}
            >
                {/* Background Image */}
                {list.thumbnail ? (
                    <>
                        <img
                            src={list.thumbnail}
                            alt={list.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Dark Gradient Overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)",
                            }}
                        />
                    </>
                ) : (
                    <div
                        className="w-full h-full"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--primary-dark) 100%)",
                        }}
                    />
                )}

                {/* Top Nav Buttons */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <Link
                        href="/lists"
                        className="w-9 h-9 flex items-center justify-center transition-colors shrink-0"
                        style={{
                            borderRadius: "var(--radius-full)",
                            background: "rgba(0,0,0,0.35)",
                            backdropFilter: "blur(8px)",
                            color: "#fff",
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/lists/${list.id}/edit`}
                            className="w-9 h-9 flex items-center justify-center transition-colors"
                            style={{
                                borderRadius: "var(--radius-full)",
                                background: "rgba(0,0,0,0.35)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
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

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-10">
                    <div className="flex items-end gap-4">
                        {/* Collection Icon */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: "rgba(255,255,255,0.2)",
                                backdropFilter: "blur(12px)",
                                border: "1.5px solid rgba(255,255,255,0.3)",
                            }}
                        >
                            <Bookmark className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1
                                className="text-2xl sm:text-3xl font-bold truncate"
                                style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                            >
                                {list.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                {/* View Mode Badge */}
                                {list.viewMode === "PUBLIC" && shareUrl ? (
                                    <button
                                        onClick={() => setSharePopupOpen(true)}
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 cursor-pointer transition-opacity hover:opacity-80"
                                        style={{
                                            borderRadius: "var(--radius-full)",
                                            background: "rgba(34,197,94,0.25)",
                                            color: "#fff",
                                            backdropFilter: "blur(4px)",
                                            border: "none",
                                        }}
                                    >
                                        <Globe className="w-3 h-3" />
                                        Public
                                        <Share2 className="w-3 h-3 ml-0.5" />
                                    </button>
                                ) : (
                                    <span
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                                        style={{
                                            borderRadius: "var(--radius-full)",
                                            background: "rgba(255,255,255,0.2)",
                                            color: "#fff",
                                            backdropFilter: "blur(4px)",
                                        }}
                                    >
                                        <Lock className="w-3 h-3" />
                                        Private
                                    </span>
                                )}
                                {/* Item Count */}
                                <span
                                    className="flex items-center gap-1 text-xs font-medium"
                                    style={{ color: "rgba(255,255,255,0.85)" }}
                                >
                                    <Bookmark className="w-3 h-3" />
                                    {list.itemCount} {singleItemLabel}
                                </span>
                                {/* Created Date */}
                                <span
                                    className="flex items-center gap-1 text-xs"
                                    style={{ color: "rgba(255,255,255,0.7)" }}
                                >
                                    <Calendar className="w-3 h-3" />
                                    Tạo lúc {new Date(list.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Share Popup ──────────────────────────────── */}
            {sharePopupOpen && (
                <div
                    className="dialog-overlay"
                    onClick={() => setSharePopupOpen(false)}
                >
                    <div
                        className="glass-card p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center"
                                    style={{
                                        background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                                    }}
                                >
                                    <Share2 className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                </div>
                                <h3 className="text-base font-bold" style={{ color: "#1E293B" }}>
                                    Chia sẻ bộ sưu tập
                                </h3>
                            </div>
                            <button
                                onClick={() => setSharePopupOpen(false)}
                                className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
                                style={{
                                    borderRadius: "var(--radius-full)",
                                    background: "rgba(241,245,249,0.8)",
                                    border: "none",
                                    color: "var(--muted)",
                                }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                            Bất kỳ ai có link đều có thể xem bộ sưu tập này
                        </p>
                        <div
                            className="flex items-center gap-2 px-3 py-2.5"
                            style={{
                                borderRadius: "var(--radius-md)",
                                background: "rgba(241,245,249,0.8)",
                                border: "1px solid rgba(226,232,240,0.6)",
                            }}
                        >
                            <Link2 className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
                            <span
                                className="text-sm truncate flex-1 select-all"
                                style={{ color: "#334155", fontFamily: "monospace" }}
                            >
                                {fullShareUrl}
                            </span>
                            <button
                                onClick={handleCopyShareUrl}
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: copied
                                        ? "linear-gradient(135deg, #10B981, #059669)"
                                        : "linear-gradient(135deg, var(--primary-light), var(--primary))",
                                    color: "#fff",
                                    border: "none",
                                    boxShadow: copied
                                        ? "0 2px 8px rgba(16,185,129,0.3)"
                                        : "0 2px 8px color-mix(in srgb, var(--primary) 35%, transparent)",
                                }}
                            >
                                {copied ? (
                                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                                ) : (
                                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-4 sm:px-6 md:px-10 py-6">
                {/* ─── Description ──────────────────────────────── */}
                {list.description && (
                    <div className="glass-card p-5 mb-6">
                        <p
                            className={`text-sm leading-relaxed ${descExpanded ? "" : "line-clamp-2"}`}
                            style={{ color: "#475569" }}
                        >
                            {list.description}
                        </p>
                        {list.description.length > 120 && (
                            <button
                                onClick={() => setDescExpanded((prev) => !prev)}
                                className="flex items-center gap-1 mt-2 text-xs font-semibold cursor-pointer"
                                style={{
                                    color: "var(--primary)",
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                }}
                            >
                                {descExpanded ? (
                                    <>
                                        Thu gọn <ChevronUp className="w-3 h-3" />
                                    </>
                                ) : (
                                    <>
                                        Xem thêm <ChevronDown className="w-3 h-3" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* ─── Search & View Toggle ──────────────────────── */}
                {list.items.length > 0 && (
                    <div className="glass-card px-4 py-3 mb-6 flex items-center gap-3">
                        {/* Search Input */}
                        <div className="flex-1 flex items-center gap-2">
                            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder={`Tìm kiếm ${singleItemLabel} trong bộ sưu tập...`}
                                className="w-full text-sm outline-none bg-transparent"
                                style={{ color: "#1E293B" }}
                            />
                        </div>

                        {/* Item Count */}
                        <span className="text-xs shrink-0 hidden sm:block" style={{ color: "var(--muted)" }}>
                            {filteredItems.length} {singleItemLabel}
                        </span>

                        {/* View Toggle */}
                        <div
                            className="flex items-center p-1 shrink-0"
                            style={{
                                borderRadius: "var(--radius-md)",
                                background: "rgba(241,245,249,0.8)",
                                border: "1px solid rgba(226,232,240,0.6)",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className="w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
                                style={{
                                    borderRadius: "var(--radius-sm)",
                                    background: viewMode === "list" ? "#fff" : "transparent",
                                    color: viewMode === "list" ? "#1E293B" : "var(--muted)",
                                    boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                }}
                                title="List view"
                            >
                                <List className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("grid")}
                                className="w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
                                style={{
                                    borderRadius: "var(--radius-sm)",
                                    background: viewMode === "grid" ? "#fff" : "transparent",
                                    color: viewMode === "grid" ? "#1E293B" : "var(--muted)",
                                    boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                }}
                                title="Grid view"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Items ─────────────────────────────────────── */}
                {list.items.length === 0 ? (
                    /* Empty State */
                    <div className="glass-card p-12 text-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{
                                background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                            }}
                        >
                            <Inbox className="w-8 h-8" style={{ color: "var(--primary)" }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: "#1E293B" }}>
                            {emptyTitle}
                        </h3>
                        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                            {emptyDesc}
                        </p>
                        <Link href="/items/new" className="gradient-btn" style={{ textDecoration: "none" }}>
                            <span>{addItemLabel}</span>
                        </Link>
                    </div>
                ) : filteredItems.length === 0 ? (
                    /* No Search Results */
                    <div className="glass-card p-12 text-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{
                                background: "rgba(241,245,249,0.8)",
                            }}
                        >
                            <Search className="w-8 h-8" style={{ color: "var(--muted)" }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: "#1E293B" }}>
                            Không tìm thấy kết quả
                        </h3>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                            Không có {singleItemLabel} nào phù hợp với &quot;{searchQuery}&quot;
                        </p>
                    </div>
                ) : viewMode === "grid" ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-2">
                        {filteredItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/items/${item.id}`}
                                className="glass-card glass-card-hover flex items-center gap-4 px-4 py-3 transition-all"
                                style={{ textDecoration: "none" }}
                            >
                                {/* Thumbnail */}
                                <div
                                    className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                                    style={{ background: "rgba(241,245,249,0.8)" }}
                                >
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-sm font-bold"
                                            style={{
                                                background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                                                color: "#94A3B8",
                                            }}
                                        >
                                            {item.title.slice(0, 2)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="text-sm font-semibold truncate"
                                        style={{ color: "#1E293B" }}
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
                                    {/* Tags */}
                                    {item.tags.length > 0 && (
                                        <div className="flex items-center gap-1 mt-1.5">
                                            {item.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="tag-chip cursor-pointer"
                                                    style={{ padding: "1px 6px", fontSize: "0.65rem" }}
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
                                                <span className="text-xs" style={{ color: "var(--muted)" }}>
                                                    +{item.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                </div>

                                {/* Right side */}
                                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                    </span>
                                    <span
                                        className={`badge ${item.viewMode === "PUBLIC" ? "badge-public" : "badge-private"}`}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
