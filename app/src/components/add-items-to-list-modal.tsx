"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    X,
    Check,
    Loader2,
    Plus,
    Inbox,
} from "lucide-react";
import { getItemsForListPicker, updateListItems } from "@/lib/list-actions";

// ─── TYPES ──────────────────────────────────────────────────

interface PickerItem {
    id: string;
    title: string;
    thumbnail: string | null;
    isInList: boolean;
}

interface AddItemsToListModalProps {
    listId: string;
    singleItemLabel: string;
    open: boolean;
    onClose: () => void;
}

// ─── COMPONENT ──────────────────────────────────────────────

export function AddItemsToListModal({
    listId,
    singleItemLabel,
    open,
    onClose,
}: AddItemsToListModalProps) {
    const router = useRouter();
    const [items, setItems] = useState<PickerItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch items when opened
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setSearchQuery("");
        getItemsForListPicker(listId).then((data) => {
            setItems(data);
            // Pre-select items already in the list
            const preSelected = new Set(
                data.filter((item) => item.isInList).map((item) => item.id)
            );
            setSelectedIds(preSelected);
            setLoading(false);
        });
    }, [open, listId]);

    // Filter by search
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase().trim();
        return items.filter((item) => item.title.toLowerCase().includes(q));
    }, [items, searchQuery]);

    // Toggle selection
    const toggleItem = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    // Count changes
    const originalIds = useMemo(() => {
        return new Set(items.filter((i) => i.isInList).map((i) => i.id));
    }, [items]);

    const hasChanges = useMemo(() => {
        if (selectedIds.size !== originalIds.size) return true;
        for (const id of selectedIds) {
            if (!originalIds.has(id)) return true;
        }
        return false;
    }, [selectedIds, originalIds]);

    // Save
    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateListItems(listId, Array.from(selectedIds));
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
                onClose();
            }
        } catch {
            alert("Có lỗi xảy ra.");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="glass-card w-full max-w-lg mx-4 flex flex-col"
                style={{ maxHeight: "80vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ───────────────────────────── */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                                }}
                            >
                                <Plus className="w-5 h-5" style={{ color: "var(--primary)" }} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold" style={{ color: "#1E293B" }}>
                                    Thêm {singleItemLabel}
                                </h3>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    Chọn {singleItemLabel} muốn thêm vào bộ sưu tập
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
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

                    {/* Search */}
                    <div
                        className="flex items-center gap-2 px-3 py-2.5"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(241,245,249,0.8)",
                            border: "1px solid rgba(226,232,240,0.6)",
                        }}
                    >
                        <Search className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Tìm kiếm ${singleItemLabel}...`}
                            className="w-full text-sm outline-none bg-transparent"
                            style={{ color: "#1E293B" }}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="shrink-0 cursor-pointer"
                                style={{ background: "none", border: "none", color: "var(--muted)" }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── Items List ────────────────────────── */}
                <div
                    className="flex-1 overflow-y-auto px-6"
                    style={{ minHeight: "200px" }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                                style={{ background: "rgba(241,245,249,0.8)" }}
                            >
                                <Inbox className="w-6 h-6" style={{ color: "var(--muted)" }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                                {searchQuery ? `Không tìm thấy "${searchQuery}"` : `Chưa có ${singleItemLabel} nào`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredItems.map((item) => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 transition-all cursor-pointer"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            background: isSelected
                                                ? "color-mix(in srgb, var(--primary) 6%, transparent)"
                                                : "transparent",
                                            border: "none",
                                            textAlign: "left",
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                            style={{
                                                background: isSelected ? "var(--primary)" : "transparent",
                                                border: isSelected
                                                    ? "none"
                                                    : "2px solid rgba(148,163,184,0.5)",
                                            }}
                                        >
                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>

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

                                        {/* Title */}
                                        <span
                                            className="flex-1 text-sm font-medium truncate"
                                            style={{ color: "#1E293B" }}
                                        >
                                            {item.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── Footer ───────────────────────────── */}
                <div
                    className="px-6 py-4 flex items-center justify-between gap-3"
                    style={{
                        borderTop: "1px solid rgba(226,232,240,0.6)",
                    }}
                >
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Đã chọn {selectedIds.size} {singleItemLabel}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "transparent",
                                color: "var(--muted)",
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="px-5 py-2 text-sm font-semibold cursor-pointer transition-all flex items-center gap-2"
                            style={{
                                borderRadius: "var(--radius-md)",
                                background: hasChanges
                                    ? "linear-gradient(135deg, var(--primary-light), var(--primary))"
                                    : "rgba(226,232,240,0.6)",
                                color: hasChanges ? "#fff" : "var(--muted)",
                                border: "none",
                                boxShadow: hasChanges
                                    ? "0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)"
                                    : "none",
                                opacity: saving ? 0.7 : 1,
                            }}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Áp dụng"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
