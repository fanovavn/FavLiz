"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ImagePlus,
    X,
    Lock,
    Globe,
    GripVertical,
    Loader2,
    Save,
} from "lucide-react";
import { updateList, updateItemOrder, updateListSortMode } from "@/lib/list-actions";

// ─── TYPES ──────────────────────────────────────────────────

interface ListItem {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    tags: { id: string; name: string }[];
}

interface ListEditClientProps {
    list: {
        id: string;
        name: string;
        description: string | null;
        thumbnail: string | null;
        viewMode: "PRIVATE" | "PUBLIC";
        sortMode: "NEWEST" | "CUSTOM";
        itemOrder: string[];
        items: ListItem[];
    };
}

// ─── COMPONENT ──────────────────────────────────────────────

export function ListEditClient({ list }: ListEditClientProps) {

    // Form state
    const [name, setName] = useState(list.name);
    const [description, setDescription] = useState(list.description || "");
    const [thumbnail, setThumbnail] = useState<string | null>(list.thumbnail);
    const [viewMode, setViewMode] = useState<"PRIVATE" | "PUBLIC">(list.viewMode);
    const [sortMode, setSortMode] = useState<"NEWEST" | "CUSTOM">(list.sortMode);
    const [items, setItems] = useState<ListItem[]>(list.items);

    // UI state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploadingThumb, setUploadingThumb] = useState(false);

    // Drag state
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);
    const dragItemRef = useRef<number | null>(null);

    // ─── Thumbnail Upload ───────────────────────────────────

    const handleThumbnailUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Ảnh tối đa 5MB");
            return;
        }

        setUploadingThumb(true);
        setError("");
        try {
            const reader = new FileReader();
            reader.onload = () => {
                setThumbnail(reader.result as string);
                setUploadingThumb(false);
            };
            reader.readAsDataURL(file);
        } catch {
            setError("Không thể tải ảnh lên");
            setUploadingThumb(false);
        }
    }, []);

    // ─── Drag & Drop Handlers ───────────────────────────────

    const handleDragStart = useCallback((idx: number) => {
        dragItemRef.current = idx;
        setDragIdx(idx);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
        e.preventDefault();
        setOverIdx(idx);
    }, []);

    const handleDrop = useCallback((idx: number) => {
        const from = dragItemRef.current;
        if (from === null || from === idx) {
            setDragIdx(null);
            setOverIdx(null);
            return;
        }

        setItems((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(idx, 0, moved);
            return updated;
        });
        setSortMode("CUSTOM");
        setDragIdx(null);
        setOverIdx(null);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDragIdx(null);
        setOverIdx(null);
    }, []);

    // ─── Sort Mode Toggle ───────────────────────────────────

    const handleSortModeChange = useCallback((mode: "NEWEST" | "CUSTOM") => {
        setSortMode(mode);
        if (mode === "NEWEST") {
            // Re-sort by newest (items came from server already sorted by createdAt desc)
            setItems((prev) => [...prev].sort((a, b) => {
                const aItem = list.items.find((i) => i.id === a.id);
                const bItem = list.items.find((i) => i.id === b.id);
                const aIdx = aItem ? list.items.indexOf(aItem) : 0;
                const bIdx = bItem ? list.items.indexOf(bItem) : 0;
                // original list from server was already sorted by createdAt desc
                // We need to reconstruct that order
                return aIdx - bIdx;
            }));
        }
    }, [list.items]);

    // ─── Save ───────────────────────────────────────────────

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Tên bộ sưu tập không được để trống");
            return;
        }

        setSaving(true);
        setError("");

        try {
            // Update list info
            const result = await updateList({
                id: list.id,
                name: name.trim(),
                description: description.trim() || undefined,
                thumbnail: thumbnail ?? undefined,
                viewMode,
            });

            if ("error" in result) {
                setError(result.error || "Có lỗi xảy ra");
                setSaving(false);
                return;
            }

            // Update sort mode
            const sortResult = await updateListSortMode(list.id, sortMode);
            if (sortResult && "error" in sortResult) {
                setError(sortResult.error || "Có lỗi khi cập nhật chế độ sắp xếp");
                setSaving(false);
                return;
            }

            // If custom sort, save item order
            if (sortMode === "CUSTOM") {
                const orderResult = await updateItemOrder(list.id, items.map((i) => i.id));
                if (orderResult && "error" in orderResult) {
                    setError(orderResult.error || "Có lỗi khi cập nhật thứ tự");
                    setSaving(false);
                    return;
                }
            }

            window.location.href = `/lists/${list.id}`;
        } catch (err) {
            console.error("Save error:", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu");
            setSaving(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/lists/${list.id}`}
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
                    <div>
                        <h1
                            className="text-xl sm:text-2xl font-bold"
                            style={{ color: "#1E293B" }}
                        >
                            Chỉnh sửa bộ sưu tập
                        </h1>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                            Thay đổi thông tin bộ sưu tập của bạn
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/lists/${list.id}`}
                        className="px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            color: "var(--muted)",
                            textDecoration: "none",
                            borderRadius: "var(--radius-md)",
                        }}
                    >
                        Huỷ
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="gradient-btn"
                        style={{ gap: "6px" }}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Lưu thay đổi</span>
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="mb-4 px-4 py-3 text-sm font-medium"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#DC2626",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Thumbnail Banner */}
            <div className="glass-card overflow-hidden mb-6">
                <label
                    className="block relative cursor-pointer group"
                    style={{ height: "220px" }}
                >
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                    />
                    {thumbnail ? (
                        <>
                            <img
                                src={thumbnail}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: "rgba(0,0,0,0.4)" }}
                            >
                                <div className="text-white text-center">
                                    <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                                    <span className="text-sm font-medium">
                                        Thay đổi ảnh đại diện
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setThumbnail(null);
                                }}
                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-colors"
                                style={{
                                    borderRadius: "var(--radius-full)",
                                    background: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <div
                            className="w-full h-full flex flex-col items-center justify-center gap-2 transition-colors"
                            style={{
                                background: "rgba(248, 250, 252, 0.8)",
                                border: "2px dashed rgba(203, 213, 225, 0.6)",
                                borderRadius: "var(--radius-lg)",
                            }}
                        >
                            {uploadingThumb ? (
                                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
                            ) : (
                                <>
                                    <ImagePlus className="w-8 h-8" style={{ color: "var(--muted)" }} />
                                    <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                                        Nhấn để tải ảnh đại diện
                                    </span>
                                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                                        PNG, JPG tối đa 5MB
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </label>
            </div>

            {/* Basic Info Section */}
            <div className="glass-card p-6 mb-6">
                <h2
                    className="text-base font-semibold mb-4"
                    style={{ color: "#1E293B" }}
                >
                    Thông tin cơ bản
                </h2>

                {/* Name */}
                <div className="mb-4">
                    <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "#475569" }}
                    >
                        Tên bộ sưu tập <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Món Việt, Phim hay..."
                        className="w-full px-4 py-2.5 text-sm transition-all outline-none"
                        style={{
                            borderRadius: "var(--radius-lg)",
                            border: "1.5px solid rgba(226,232,240,0.8)",
                            background: "#fff",
                            color: "#1E293B",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(226,232,240,0.8)")}
                    />
                </div>

                {/* Description */}
                <div>
                    <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "#475569" }}
                    >
                        Mô tả
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả bộ sưu tập của bạn..."
                        rows={3}
                        className="w-full px-4 py-2.5 text-sm transition-all outline-none resize-none"
                        style={{
                            borderRadius: "var(--radius-lg)",
                            border: "1.5px solid rgba(226,232,240,0.8)",
                            background: "#fff",
                            color: "#1E293B",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(226,232,240,0.8)")}
                    />
                </div>
            </div>

            {/* View Mode Section */}
            <div className="glass-card p-6 mb-6">
                <h2
                    className="text-base font-semibold mb-4"
                    style={{ color: "#1E293B" }}
                >
                    Chế độ hiển thị
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {/* Private */}
                    <button
                        type="button"
                        onClick={() => setViewMode("PRIVATE")}
                        className="flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer"
                        style={{
                            borderRadius: "var(--radius-lg)",
                            border: viewMode === "PRIVATE"
                                ? "2px solid var(--primary)"
                                : "1.5px solid rgba(226,232,240,0.8)",
                            background: viewMode === "PRIVATE"
                                ? "rgba(22, 163, 74, 0.04)"
                                : "#fff",
                        }}
                    >
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                background: viewMode === "PRIVATE"
                                    ? "color-mix(in srgb, var(--primary) 12%, transparent)"
                                    : "rgba(100,116,139,0.08)",
                            }}
                        >
                            <Lock
                                className="w-4 h-4"
                                style={{
                                    color: viewMode === "PRIVATE"
                                        ? "var(--primary)"
                                        : "#94A3B8",
                                }}
                            />
                        </div>
                        <div>
                            <div
                                className="text-sm font-semibold"
                                style={{ color: "#1E293B" }}
                            >
                                Private
                            </div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                                Chỉ mình bạn thấy
                            </div>
                        </div>
                        {viewMode === "PRIVATE" && (
                            <div className="ml-auto" style={{ color: "var(--primary)" }}>
                                ✓
                            </div>
                        )}
                    </button>

                    {/* Public */}
                    <button
                        type="button"
                        onClick={() => setViewMode("PUBLIC")}
                        className="flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer"
                        style={{
                            borderRadius: "var(--radius-lg)",
                            border: viewMode === "PUBLIC"
                                ? "2px solid var(--primary)"
                                : "1.5px solid rgba(226,232,240,0.8)",
                            background: viewMode === "PUBLIC"
                                ? "rgba(22, 163, 74, 0.04)"
                                : "#fff",
                        }}
                    >
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                background: viewMode === "PUBLIC"
                                    ? "color-mix(in srgb, var(--primary) 12%, transparent)"
                                    : "rgba(100,116,139,0.08)",
                            }}
                        >
                            <Globe
                                className="w-4 h-4"
                                style={{
                                    color: viewMode === "PUBLIC"
                                        ? "var(--primary)"
                                        : "#94A3B8",
                                }}
                            />
                        </div>
                        <div>
                            <div
                                className="text-sm font-semibold"
                                style={{ color: "#1E293B" }}
                            >
                                Public
                            </div>
                            <div className="text-xs" style={{ color: "var(--muted)" }}>
                                Mọi người có thể xem
                            </div>
                        </div>
                        {viewMode === "PUBLIC" && (
                            <div className="ml-auto" style={{ color: "var(--primary)" }}>
                                ✓
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Items Section */}
            {items.length > 0 && (
                <div className="glass-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2
                                className="text-base font-semibold"
                                style={{ color: "#1E293B" }}
                            >
                                Sắp xếp công thức
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                                Kéo và thả để thay đổi thứ tự
                            </p>
                        </div>

                        {/* Sort Mode Toggle */}
                        <div
                            className="flex items-center p-1"
                            style={{
                                borderRadius: "var(--radius-lg)",
                                background: "rgba(241,245,249,0.8)",
                                border: "1px solid rgba(226,232,240,0.6)",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => handleSortModeChange("NEWEST")}
                                className="px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: sortMode === "NEWEST" ? "#fff" : "transparent",
                                    color: sortMode === "NEWEST" ? "#1E293B" : "var(--muted)",
                                    boxShadow: sortMode === "NEWEST" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                }}
                            >
                                Mới nhất
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSortModeChange("CUSTOM")}
                                className="px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: sortMode === "CUSTOM" ? "var(--primary)" : "transparent",
                                    color: sortMode === "CUSTOM" ? "#fff" : "var(--muted)",
                                    boxShadow: sortMode === "CUSTOM" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                }}
                            >
                                Tuỳ chỉnh ✦
                            </button>
                        </div>
                    </div>

                    {/* Item List */}
                    <div className="space-y-1">
                        {items.map((item, idx) => (
                            <div
                                key={item.id}
                                draggable={sortMode === "CUSTOM"}
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={handleDragEnd}
                                className="flex items-center gap-3 px-3 py-2.5 transition-all"
                                style={{
                                    borderRadius: "var(--radius-lg)",
                                    background: dragIdx === idx
                                        ? "rgba(22, 163, 74, 0.06)"
                                        : overIdx === idx
                                            ? "rgba(241, 245, 249, 0.8)"
                                            : "transparent",
                                    border: overIdx === idx
                                        ? "1.5px dashed var(--primary)"
                                        : "1.5px solid transparent",
                                    opacity: dragIdx === idx ? 0.5 : 1,
                                    cursor: sortMode === "CUSTOM" ? "grab" : "default",
                                }}
                            >
                                {/* Drag Handle */}
                                {sortMode === "CUSTOM" && (
                                    <div
                                        className="shrink-0 flex flex-col items-center"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                                            {idx + 1}
                                        </span>
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                )}

                                {/* Item Thumbnail */}
                                <div
                                    className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                                    style={{
                                        background: "rgba(241,245,249,0.8)",
                                    }}
                                >
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                                                📷
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Item Info */}
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-sm font-medium truncate"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {item.title}
                                    </div>
                                    {item.description && (
                                        <div
                                            className="text-xs truncate"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            {item.description}
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                    {item.tags.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-0.5 text-xs font-medium"
                                            style={{
                                                borderRadius: "var(--radius-full)",
                                                background: "rgba(22, 163, 74, 0.08)",
                                                color: "var(--primary)",
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                    {item.tags.length > 2 && (
                                        <span
                                            className="text-xs"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            +{item.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hint */}
                    <p
                        className="text-xs mt-4 text-center"
                        style={{ color: "var(--muted)" }}
                    >
                        💡 Đổi chế độ sắp xếp từ &quot;Mới nhất&quot; sang{" "}
                        <strong style={{ color: "var(--primary)" }}>Tuỳ chỉnh</strong>{" "}
                        rồi kéo thả để sắp xếp theo ý muốn
                    </p>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pb-8">
                <Link
                    href={`/lists/${list.id}`}
                    className="px-5 py-2.5 text-sm font-medium transition-colors"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        color: "var(--muted)",
                        textDecoration: "none",
                        border: "1.5px solid rgba(226,232,240,0.8)",
                        background: "#fff",
                    }}
                >
                    Huỷ bỏ
                </Link>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="gradient-btn"
                    style={{ gap: "6px" }}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span>Lưu thay đổi</span>
                </button>
            </div>
        </div>
    );
}
