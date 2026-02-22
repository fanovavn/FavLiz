"use client";

import Link from "next/link";
import { Lock, Globe } from "lucide-react";
import { getThumbnailColor } from "@/lib/utils";
import { useTagPopup } from "@/components/tag-detail-popup";

interface ItemCardProps {
    item: {
        id: string;
        title: string;
        description?: string | null;
        thumbnail?: string | null;
        viewMode: string;
        tags: { id: string; name: string }[];
        createdAt: string;
    };
}

export function ItemCard({ item }: ItemCardProps) {
    const bgColor = getThumbnailColor(item.title);
    const { openTag } = useTagPopup();

    return (
        <Link href={`/items/${item.id}`} className="block">
            <div className="glass-card glass-card-hover overflow-hidden group">
                {/* Thumbnail */}
                {item.thumbnail ? (
                    <div className="w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div
                        className="thumbnail-placeholder"
                        style={{ background: bgColor }}
                    >
                        {item.title.slice(0, 2)}
                    </div>
                )}

                {/* Content */}
                <div className="p-4">
                    <h3
                        className="font-semibold text-sm mb-1 truncate transition-colors"
                        style={{ color: "#334155" }}
                    >
                        {item.title}
                    </h3>
                    {item.description && (
                        <p
                            className="text-xs line-clamp-2 mb-3"
                            style={{ color: "var(--muted)" }}
                        >
                            {item.description}
                        </p>
                    )}

                    {/* Tags */}
                    {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {item.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag.id}
                                    className="tag-chip cursor-pointer"
                                    style={{
                                        padding: "2px 8px",
                                        fontSize: "0.7rem",
                                    }}
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
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <span
                            className="text-xs"
                            style={{ color: "var(--muted-light)" }}
                        >
                            {new Date(item.createdAt).toLocaleDateString(
                                "vi-VN"
                            )}
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
                </div>
            </div>
        </Link>
    );
}
