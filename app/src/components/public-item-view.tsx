import Link from "next/link";
import { Heart } from "lucide-react";
import { getThumbnailColor } from "@/lib/utils";
import { AttachmentViewer } from "@/components/attachment-viewer";

interface PublicItemViewProps {
    item: {
        title: string;
        description: string | null;
        thumbnail: string | null;
        tags: { id: string; name: string }[];
        lists: { id: string; name: string }[];
        attachments: { id: string; type: string; url: string }[];
        user: { name: string | null; username: string | null; email: string };
        createdAt: Date;
        updatedAt: Date;
    };
}

export function PublicItemView({ item }: PublicItemViewProps) {
    const displayName = item.user.name || item.user.username || item.user.email.split("@")[0];
    const bgGradient = getThumbnailColor(item.title);
    const initials = item.title.slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen" style={{ background: "var(--background)" }}>
            {/* Header */}
            <header
                className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
                style={{
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(226,232,240,0.5)",
                }}
            >
                <Link href="/" className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                        }}
                    >
                        <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                    <span className="text-base font-bold gradient-text">FavLiz</span>
                </Link>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                    Shared by <strong>{item.user.username ? `@${item.user.username}` : displayName}</strong>
                </span>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto p-4 md:p-8">
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(226,232,240,0.5)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* Thumbnail */}
                    <div className="relative" style={{ height: "200px" }}>
                        {item.thumbnail ? (
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: bgGradient }}
                            >
                                <span
                                    className="text-5xl font-bold text-white"
                                    style={{ opacity: 0.7 }}
                                >
                                    {initials}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-6 md:p-8">
                        <h1
                            className="text-2xl md:text-3xl font-bold mb-3"
                            style={{ color: "#1E293B" }}
                        >
                            {item.title}
                        </h1>

                        {item.description && (
                            <p
                                className="text-base leading-relaxed whitespace-pre-wrap mb-6"
                                style={{ color: "var(--muted)" }}
                            >
                                {item.description}
                            </p>
                        )}

                        {/* Attachments with lightbox */}
                        {item.attachments.length > 0 && (
                            <div className="mb-6">
                                <AttachmentViewer attachments={item.attachments} />
                            </div>
                        )}

                        {/* Tags */}
                        {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {item.tags.map((tag) => (
                                    <span key={tag.id} className="tag-chip">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Lists */}
                        {item.lists.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {item.lists.map((list) => (
                                    <span
                                        key={list.id}
                                        className="px-3 py-1 text-sm font-medium"
                                        style={{
                                            borderRadius: "var(--radius-sm)",
                                            background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                                            color: "var(--primary)",
                                            border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)",
                                        }}
                                    >
                                        📋 {list.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Author + Date */}
                        <div
                            className="flex items-center gap-3 pt-4 text-xs"
                            style={{
                                borderTop: "1px solid rgba(226,232,240,0.6)",
                                color: "var(--muted-light)",
                            }}
                        >
                            <span>Bởi {displayName}</span>
                            <span>·</span>
                            <span>
                                Cập nhật{" "}
                                {new Date(item.updatedAt).toLocaleDateString("vi-VN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div
                    className="mt-8 text-center p-6 rounded-2xl"
                    style={{
                        background: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(226,232,240,0.5)",
                    }}
                >
                    <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                        Lưu mọi thứ yêu thích của bạn?
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                        style={{
                            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                            boxShadow: "0 4px 15px rgba(219,39,119,0.3)",
                        }}
                    >
                        Đăng ký FavLiz miễn phí →
                    </Link>
                </div>
            </main>
        </div>
    );
}
