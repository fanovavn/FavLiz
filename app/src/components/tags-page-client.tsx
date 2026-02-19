"use client";

import { useState, useMemo } from "react";
import { Tags, Search, Bookmark, Calendar, Hash } from "lucide-react";
import { useTagPopup } from "@/components/tag-detail-popup";

interface TagData {
    id: string;
    name: string;
    itemCount: number;
    createdAt: string;
}

interface TagsPageClientProps {
    tags: TagData[];
    singleItemLabel: string;
}

// Generate a deterministic color for a tag
function getTagColor(name: string): string {
    const colors = [
        "#22C55E", "#3B82F6", "#F59E0B", "#EF4444",
        "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
        "#6366F1", "#06B6D4", "#84CC16", "#E11D48",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export function TagsPageClient({ tags, singleItemLabel }: TagsPageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { openTag } = useTagPopup();

    const filteredTags = useMemo(() => {
        if (!searchQuery.trim()) return tags;
        const q = searchQuery.toLowerCase();
        return tags.filter((tag) => tag.name.toLowerCase().includes(q));
    }, [tags, searchQuery]);

    // Stats
    const totalItems = tags.reduce((acc, t) => acc + t.itemCount, 0);
    const mostUsedTag = tags.length > 0
        ? tags.reduce((a, b) => (a.itemCount > b.itemCount ? a : b))
        : null;

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Hero Header */}
            <div
                className="relative overflow-hidden mb-8 p-6 sm:p-8"
                style={{
                    borderRadius: "var(--radius-xl)",
                    background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                }}
            >
                {/* Decorative elements */}
                <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div
                    className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.2)" }}
                        >
                            <Tags className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Tags
                        </h1>
                    </div>
                    <p className="text-sm text-white/70 mb-5">
                        Khám phá và quản lý hệ thống tags để phân loại {singleItemLabel} yêu thích của bạn
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3">
                        <div
                            className="px-4 py-2 flex items-center gap-2"
                            style={{
                                borderRadius: "var(--radius-lg)",
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <Hash className="w-4 h-4 text-white/70" />
                            <span className="text-sm font-semibold text-white">{tags.length}</span>
                            <span className="text-xs text-white/60">Tags</span>
                        </div>
                        <div
                            className="px-4 py-2 flex items-center gap-2"
                            style={{
                                borderRadius: "var(--radius-lg)",
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <Bookmark className="w-4 h-4 text-white/70" />
                            <span className="text-sm font-semibold text-white">{totalItems}</span>
                            <span className="text-xs text-white/60">{singleItemLabel}</span>
                        </div>
                        {mostUsedTag && (
                            <div
                                className="px-4 py-2 flex items-center gap-2"
                                style={{
                                    borderRadius: "var(--radius-lg)",
                                    background: "rgba(255,255,255,0.15)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <Tags className="w-4 h-4 text-white/70" />
                                <span className="text-xs text-white/60">Phổ biến nhất:</span>
                                <span className="text-sm font-semibold text-white">{mostUsedTag.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search */}
            {tags.length > 0 && (
                <div className="mb-6">
                    <div
                        className="relative"
                        style={{ maxWidth: "400px" }}
                    >
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--muted-light)" }}
                        />
                        <input
                            type="text"
                            placeholder="Tìm tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm"
                            style={{
                                borderRadius: "var(--radius-lg)",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.8)",
                                color: "#1E293B",
                                outline: "none",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Tags Grid */}
            {tags.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(37, 99, 235, 0.06)" }}
                    >
                        <Tags className="w-8 h-8" style={{ color: "var(--primary)" }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: "#1E293B" }}>
                        Chưa có tags nào
                    </h3>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Tags sẽ tự động tạo khi bạn thêm {singleItemLabel}
                    </p>
                </div>
            ) : filteredTags.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Search className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--muted-light)" }} />
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        Không tìm thấy tag nào phù hợp
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredTags.map((tag) => {
                        const color = getTagColor(tag.name);
                        return (
                            <button
                                key={tag.id}
                                onClick={() => openTag(tag.id, tag.name)}
                                className="glass-card glass-card-hover p-4 text-left cursor-pointer transition-all group"
                                style={{ border: "none" }}
                            >
                                {/* Tag Icon + Name */}
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                                        style={{
                                            background: `${color}15`,
                                        }}
                                    >
                                        <Hash
                                            className="w-4 h-4"
                                            style={{ color }}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h3
                                            className="text-sm font-bold truncate"
                                            style={{ color: "#1E293B" }}
                                        >
                                            {tag.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Item count */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className="flex items-center gap-1 text-xs"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        <Bookmark className="w-3 h-3" />
                                        {tag.itemCount} {singleItemLabel}
                                    </span>
                                    <span
                                        className="text-xs font-bold px-2 py-0.5"
                                        style={{
                                            borderRadius: "var(--radius-full)",
                                            background: `${color}15`,
                                            color,
                                        }}
                                    >
                                        {tag.itemCount}
                                    </span>
                                </div>

                                {/* Date */}
                                <div
                                    className="flex items-center gap-1 mt-2.5 text-xs"
                                    style={{ color: "var(--muted-light)" }}
                                >
                                    <Calendar className="w-3 h-3" />
                                    {new Date(tag.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
