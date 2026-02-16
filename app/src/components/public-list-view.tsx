import Link from "next/link";
import { Heart } from "lucide-react";
import { getThumbnailColor } from "@/lib/utils";

interface PublicListViewProps {
    list: {
        name: string;
        description: string | null;
        thumbnail: string | null;
        items: {
            id: string;
            title: string;
            description: string | null;
            thumbnail: string | null;
            shareSlug: string | null;
            tags: { id: string; name: string }[];
        }[];
        user: { name: string | null; username: string | null; email: string; itemsLabel?: string | null };
        createdAt: Date;
        updatedAt: Date;
    };
}

export function PublicListView({ list }: PublicListViewProps) {
    const displayName = list.user.name || list.user.username || list.user.email.split("@")[0];
    const bgGradient = getThumbnailColor(list.name);
    const initials = list.name.slice(0, 2).toUpperCase();
    const singleItemLabel = list.user.itemsLabel ? list.user.itemsLabel.toLowerCase() : "items";

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
                    Shared by <strong>{list.user.username ? `@${list.user.username}` : displayName}</strong>
                </span>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto p-4 md:p-8">
                {/* List Header */}
                <div
                    className="rounded-2xl overflow-hidden mb-8"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(226,232,240,0.5)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* Thumbnail banner */}
                    <div className="relative" style={{ height: "160px" }}>
                        {list.thumbnail ? (
                            <img
                                src={list.thumbnail}
                                alt={list.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: bgGradient }}
                            >
                                <span
                                    className="text-4xl font-bold text-white"
                                    style={{ opacity: 0.5 }}
                                >
                                    {initials}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        <h1
                            className="text-2xl md:text-3xl font-bold mb-2"
                            style={{ color: "#1E293B" }}
                        >
                            {list.name}
                        </h1>
                        {list.description && (
                            <p
                                className="text-base mb-3"
                                style={{ color: "var(--muted)" }}
                            >
                                {list.description}
                            </p>
                        )}
                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-light)" }}>
                            <span>{list.items.length} {singleItemLabel}</span>
                            <span>·</span>
                            <span>Bởi {displayName}</span>
                            <span>·</span>
                            <span>
                                Cập nhật{" "}
                                {new Date(list.updatedAt).toLocaleDateString("vi-VN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.items.map((item) => {
                        const itemGradient = getThumbnailColor(item.title);
                        const itemInitials = item.title.slice(0, 2).toUpperCase();
                        const itemUrl = item.shareSlug
                            ? list.user.username
                                ? `/${list.user.username}/${item.shareSlug}`
                                : `/share/item/${item.shareSlug}`
                            : null;

                        const content = (
                            <>
                                {/* Thumbnail */}
                                <div style={{ height: "120px" }}>
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ background: itemGradient }}
                                        >
                                            <span
                                                className="text-2xl font-bold text-white"
                                                style={{ opacity: 0.6 }}
                                            >
                                                {itemInitials}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3
                                        className="font-semibold text-sm mb-1 truncate"
                                        style={{ color: "#1E293B" }}
                                    >
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p
                                            className="text-xs line-clamp-2 mb-2"
                                            style={{ color: "var(--muted-light)" }}
                                        >
                                            {item.description}
                                        </p>
                                    )}
                                    {item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="text-[10px] px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: "rgba(100,116,139,0.07)",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        );

                        const cardStyle = {
                            background: "rgba(255,255,255,0.7)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(226,232,240,0.5)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                        };

                        if (itemUrl) {
                            return (
                                <Link
                                    key={item.id}
                                    href={itemUrl}
                                    className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                                    style={cardStyle}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl overflow-hidden"
                                style={cardStyle}
                            >
                                {content}
                            </div>
                        );
                    })}
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
                        Lưu bộ sưu tập yêu thích của bạn?
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
