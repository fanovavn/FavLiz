"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import {
    X,
    Tags,
    Bookmark,
    Globe,
    Lock,
    Inbox,
    Loader2,
    Trash2,
    AlertTriangle,
    ExternalLink,
} from "lucide-react";
import { getTagWithItems, deleteTag } from "@/lib/item-actions";
import { useRouter } from "next/navigation";

// ─── TYPES ──────────────────────────────────────────────────

interface TagItem {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    viewMode: string;
    tags: { id: string; name: string }[];
    createdAt: string;
}

interface TagData {
    id: string;
    name: string;
    itemCount: number;
    createdAt: string;
    items: TagItem[];
}

// ─── CONTEXT ────────────────────────────────────────────────

interface TagPopupContextType {
    openTag: (tagId: string, tagName?: string) => void;
}

const TagPopupContext = createContext<TagPopupContextType>({
    openTag: () => { },
});

export function useTagPopup() {
    return useContext(TagPopupContext);
}

// ─── PROVIDER ───────────────────────────────────────────────

export function TagPopupProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [tagId, setTagId] = useState<string | null>(null);
    const [tagName, setTagName] = useState<string>("");
    const [tagData, setTagData] = useState<TagData | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const openTag = useCallback((id: string, name?: string) => {
        setTagId(id);
        setTagName(name || "");
        setIsOpen(true);
        setTagData(null);
        setLoading(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setTagId(null);
        setTagData(null);
        setDeleteOpen(false);
    }, []);

    // Fetch tag data when opened
    useEffect(() => {
        if (!tagId || !isOpen) return;
        let cancelled = false;

        (async () => {
            try {
                const data = await getTagWithItems(tagId);
                if (!cancelled && data) {
                    setTagData(data as TagData);
                    setTagName(data.name);
                }
            } catch {
                // silently fail
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [tagId, isOpen]);

    const handleDelete = async () => {
        if (!tagId) return;
        setDeleting(true);
        try {
            const result = await deleteTag(tagId);
            if (result.error) {
                alert(result.error);
                return;
            }
            close();
            router.push("/tags");
            router.refresh();
        } catch {
            alert("Có lỗi xảy ra khi xóa tag.");
        } finally {
            setDeleting(false);
        }
    };

    // Get related tags (other tags that appear on items in this tag)
    const relatedTags = tagData
        ? Array.from(
            new Map(
                tagData.items
                    .flatMap((item) => item.tags)
                    .filter((t) => t.id !== tagData.id)
                    .map((t) => [t.id, t])
            ).values()
        )
        : [];

    return (
        <TagPopupContext.Provider value={{ openTag }}>
            {children}

            {/* ─── Popup Modal ──────────────────────────────── */}
            {isOpen && (
                <div className="dialog-overlay" onClick={close} style={{ zIndex: 100 }}>
                    <div
                        className="glass-card w-full mx-4 overflow-hidden"
                        style={{ maxWidth: "520px", maxHeight: "85vh" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="px-6 py-5"
                            style={{
                                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: "rgba(255,255,255,0.2)",
                                            backdropFilter: "blur(8px)",
                                        }}
                                    >
                                        <Tags className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            #{tagName}
                                        </h2>
                                        {tagData && (
                                            <p className="text-xs text-white/70">
                                                {tagData.itemCount} mục sử dụng tag này
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={close}
                                    className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
                                    style={{
                                        borderRadius: "var(--radius-full)",
                                        background: "rgba(255,255,255,0.2)",
                                        border: "none",
                                        color: "#fff",
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Quick stats */}
                            {tagData && (
                                <div className="flex items-center gap-2 mt-3">
                                    <span
                                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1"
                                        style={{
                                            borderRadius: "var(--radius-full)",
                                            background: "rgba(255,255,255,0.2)",
                                            color: "#fff",
                                        }}
                                    >
                                        <Bookmark className="w-3 h-3" />
                                        {tagData.itemCount} mục
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Body - scrollable */}
                        <div
                            className="overflow-y-auto px-6 py-5"
                            style={{ maxHeight: "calc(85vh - 140px)" }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
                                </div>
                            ) : tagData ? (
                                <>
                                    {/* Items Section */}
                                    <div className="mb-5">
                                        <h3
                                            className="text-xs font-semibold uppercase tracking-wider mb-3"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            Các mục trong tag này
                                        </h3>

                                        {tagData.items.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Inbox className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--muted-light)" }} />
                                                <p className="text-sm" style={{ color: "var(--muted)" }}>
                                                    Chưa có mục nào
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {tagData.items.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/items/${item.id}`}
                                                        onClick={close}
                                                        className="flex items-center gap-3 px-3 py-2.5 transition-all"
                                                        style={{
                                                            borderRadius: "var(--radius-md)",
                                                            background: "rgba(241,245,249,0.5)",
                                                            border: "1px solid rgba(226,232,240,0.4)",
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        {/* Thumbnail */}
                                                        <div
                                                            className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
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
                                                                    className="w-full h-full flex items-center justify-center text-xs font-bold"
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
                                                            <h4
                                                                className="text-sm font-semibold truncate"
                                                                style={{ color: "#1E293B" }}
                                                            >
                                                                {item.title}
                                                            </h4>
                                                            {item.description && (
                                                                <p
                                                                    className="text-xs truncate mt-0.5"
                                                                    style={{ color: "var(--muted)" }}
                                                                >
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Badge */}
                                                        <span
                                                            className={`badge shrink-0 ${item.viewMode === "PUBLIC" ? "badge-public" : "badge-private"}`}
                                                        >
                                                            {item.viewMode === "PUBLIC" ? (
                                                                <Globe className="w-3 h-3" />
                                                            ) : (
                                                                <Lock className="w-3 h-3" />
                                                            )}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Related Tags */}
                                    {relatedTags.length > 0 && (
                                        <div className="mb-5">
                                            <h3
                                                className="text-xs font-semibold uppercase tracking-wider mb-3"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                Tags liên quan
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {relatedTags.map((tag) => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => openTag(tag.id, tag.name)}
                                                        className="tag-chip cursor-pointer"
                                                    >
                                                        {tag.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer actions */}
                                    <div
                                        className="flex items-center justify-between pt-4"
                                        style={{ borderTop: "1px solid rgba(226,232,240,0.6)" }}
                                    >
                                        <Link
                                            href={`/tags/${tagData.id}`}
                                            onClick={close}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                                            style={{ color: "var(--primary)", textDecoration: "none" }}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Xem trang đầy đủ
                                        </Link>
                                        <button
                                            onClick={() => setDeleteOpen(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 cursor-pointer transition-colors"
                                            style={{
                                                borderRadius: "var(--radius-md)",
                                                background: "rgba(239,68,68,0.06)",
                                                color: "#EF4444",
                                                border: "none",
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Xóa tag
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                                        Không tìm thấy tag
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Confirmation ──────────────────────── */}
            {deleteOpen && (
                <div
                    className="dialog-overlay"
                    style={{ zIndex: 110 }}
                    onClick={() => setDeleteOpen(false)}
                >
                    <div
                        className="glass-card p-8 max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-5">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(239, 68, 68, 0.06)" }}
                            >
                                <AlertTriangle className="w-7 h-7" style={{ color: "#EF4444" }} />
                            </div>
                        </div>
                        <h3
                            className="text-lg font-bold text-center mb-2"
                            style={{ color: "#1E293B" }}
                        >
                            Xóa tag &quot;{tagName}&quot;?
                        </h3>
                        <p
                            className="text-sm text-center mb-6"
                            style={{ color: "var(--muted)" }}
                        >
                            Tag sẽ bị xóa khỏi tất cả các mục. Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteOpen(false)}
                                className="flex-1 py-2.5 font-medium text-sm cursor-pointer transition-colors"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    color: "var(--muted)",
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 font-medium text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: "#EF4444",
                                    color: "white",
                                }}
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                {deleting ? "Đang xóa..." : "Xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TagPopupContext.Provider>
    );
}
