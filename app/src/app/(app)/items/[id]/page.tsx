import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Edit,
    Lock,
    Globe,
    Calendar,
    ExternalLink,
    Share2,
    Tags,
    FolderOpen,
    Link2,
    Paperclip,
} from "lucide-react";
import { getItem } from "@/lib/item-actions";
import { getShareUrl } from "@/lib/share-actions";
import { getThumbnailColor } from "@/lib/utils";
import { DeleteItemButton } from "@/components/delete-item-dialog";
import { AttachmentViewer } from "@/components/attachment-viewer";
import { ShareButton } from "@/components/share-button";

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
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/items"
                    className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                    style={{
                        borderRadius: "var(--radius-md)",
                        background: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(226,232,240,0.8)",
                        color: "var(--muted)",
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/items/${id}/edit`}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                        }}
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteItemButton itemId={id} itemTitle={item.title} />
                </div>
            </div>

            {/* Hero: Thumbnail + Title/Description */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6" style={{ alignItems: "flex-start" }}>
                {/* Thumbnail */}
                <div className="shrink-0 w-[120px] sm:w-[200px] mx-auto sm:mx-0">
                    {item.thumbnail ? (
                        <div
                            className="w-full overflow-hidden"
                            style={{
                                aspectRatio: "1",
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
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
                            className="w-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white uppercase tracking-widest"
                            style={{
                                aspectRatio: "1",
                                background: bgColor,
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                                textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            {item.title.slice(0, 2)}
                        </div>
                    )}
                </div>

                {/* Title + Description */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h1
                            className="text-xl sm:text-2xl font-bold"
                            style={{ color: "#1E293B" }}
                        >
                            {item.title}
                        </h1>
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
                    {item.description && (
                        <p
                            className="leading-relaxed whitespace-pre-wrap"
                            style={{ color: "var(--muted)" }}
                        >
                            {item.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Attachments */}
            {item.attachments.length > 0 && (
                <AttachmentViewer attachments={item.attachments} />
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
                <div className="mb-5">
                    <h3
                        className="text-sm font-semibold mb-2 flex items-center gap-2"
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
                            <Link key={tag.id} href={`/tags/${tag.id}`} className="tag-chip hover:opacity-80 transition-opacity">
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Lists */}
            {item.lists.length > 0 && (
                <div className="mb-5">
                    <h3
                        className="text-sm font-semibold mb-2 flex items-center gap-2"
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
                                    borderRadius: "var(--radius-sm)",
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

            {/* Dates */}
            <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs mt-6 pt-4"
                style={{
                    borderTop: "1px solid rgba(226,232,240,0.6)",
                    color: "var(--muted-light)",
                }}
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
                <span>
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
                <div className="mt-6">
                    <ShareButton shareUrl={shareUrl} />
                </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-3 mt-4">
                <Link
                    href={`/items/${id}/edit`}
                    className="gradient-btn"
                >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                </Link>
            </div>
        </div>
    );
}
