import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Edit,
    Lock,
    Globe,
    Calendar,
    Tags,
    FolderOpen,
    Trash2,
} from "lucide-react";
import { getItem } from "@/lib/item-actions";
import { getShareUrl } from "@/lib/share-actions";
import { getThumbnailColor } from "@/lib/utils";
import { DeleteItemButton } from "@/components/delete-item-dialog";
import { AttachmentViewer } from "@/components/attachment-viewer";
import { ShareButton } from "@/components/share-button";
import { TagChipButton } from "@/components/tag-chip-button";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
    const { id } = await params;
    const item = await getItem(id);

    if (!item) notFound();

    const bgColor = getThumbnailColor(item.title);
    const shareUrl = item.viewMode === "PUBLIC" ? await getShareUrl("item", id) : null;

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Hero Card: Left-aligned Thumbnail + Badge + Title + Description */}
            <div
                className="glass-card mb-6 relative"
                style={{ padding: "32px" }}
            >
                {/* Action buttons - top right */}
                <div className="absolute flex items-center gap-2" style={{ top: 28, right: 28 }}>
                    <Link
                        href={`/items/${id}/edit`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold cursor-pointer transition-all"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
                            color: "#fff",
                            border: "none",
                            boxShadow: "0 2px 8px color-mix(in srgb, var(--primary) 35%, transparent)",
                        }}
                    >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                    </Link>
                    <DeleteItemButton itemId={id} itemTitle={item.title} />
                </div>

                {/* Thumbnail */}
                <div className="mb-4">
                    {item.thumbnail ? (
                        <div
                            className="overflow-hidden"
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                border: "3px solid rgba(255,255,255,0.9)",
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
                            className="flex items-center justify-center text-2xl font-bold text-white uppercase tracking-widest"
                            style={{
                                width: 96,
                                height: 96,
                                background: bgColor,
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                border: "3px solid rgba(255,255,255,0.9)",
                                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            {item.title.slice(0, 2)}
                        </div>
                    )}
                </div>

                {/* Badge */}
                <div className="mb-3">
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

                {/* Title */}
                <h1
                    className="text-2xl sm:text-[28px] font-bold mb-2"
                    style={{ color: "#1E293B", lineHeight: 1.3 }}
                >
                    {item.title}
                </h1>

                {/* Description */}
                {item.description && (
                    <p
                        className="leading-relaxed whitespace-pre-wrap"
                        style={{ color: "var(--muted)", fontSize: "0.95rem" }}
                    >
                        {item.description}
                    </p>
                )}
            </div>

            {/* Attachments Card */}
            {item.attachments.length > 0 && (
                <AttachmentViewer attachments={item.attachments} />
            )}

            {/* Tags & Collections - Side by side */}
            {(item.tags.length > 0 || item.lists.length > 0) && (
                <div
                    className="grid gap-4 mb-6"
                    style={{
                        gridTemplateColumns:
                            item.tags.length > 0 && item.lists.length > 0
                                ? "1fr 1fr"
                                : "1fr",
                    }}
                >
                    {/* Tags */}
                    {item.tags.length > 0 && (
                        <div className="glass-card p-5">
                            <h3
                                className="text-sm font-semibold mb-3 flex items-center gap-2"
                                style={{ color: "#334155" }}
                            >
                                <Tags
                                    className="w-4 h-4"
                                    style={{ color: "var(--primary)" }}
                                />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag) => (
                                    <TagChipButton
                                        key={tag.id}
                                        tagId={tag.id}
                                        tagName={tag.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collections */}
                    {item.lists.length > 0 && (
                        <div className="glass-card p-5">
                            <h3
                                className="text-sm font-semibold mb-3 flex items-center gap-2"
                                style={{ color: "#334155" }}
                            >
                                <FolderOpen
                                    className="w-4 h-4"
                                    style={{ color: "var(--primary)" }}
                                />
                                Bộ sưu tập
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {item.lists.map((list) => (
                                    <Link
                                        key={list.id}
                                        href={`/lists/${list.id}`}
                                        className="px-3 py-1 text-sm font-medium hover:opacity-80 transition-opacity"
                                        style={{
                                            borderRadius: "999px",
                                            background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                                            color: "var(--primary)",
                                            border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)",
                                        }}
                                    >
                                        {list.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dates */}
            <div
                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs mb-6"
                style={{ color: "var(--muted-light)" }}
            >
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Tạo:{" "}
                    {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </span>
                <span style={{ color: "rgba(203,213,225,0.6)" }}>•</span>
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Cập nhật:{" "}
                    {new Date(item.updatedAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </span>
            </div>

            {/* Share URL Bar */}
            {shareUrl && (
                <div className="mb-4">
                    <ShareButton shareUrl={shareUrl} />
                </div>
            )}
        </div>
    );
}
