"use client";

import { useState } from "react";
import { ExternalLink, Link2, Image as ImageIcon, Paperclip } from "lucide-react";
import { ImageLightbox } from "@/components/image-lightbox";

interface Attachment {
    id: string;
    type: string;
    url: string;
}

interface AttachmentViewerProps {
    attachments: Attachment[];
}

function formatLinkTitle(url: string): string {
    try {
        const u = new URL(url);
        const domain = u.hostname.replace(/^www\./, "");
        const path = u.pathname.replace(/\//g, " ").trim();
        if (path) {
            // Capitalize and clean up path segments
            const words = path.split(/[-_\s]+/).filter(Boolean);
            if (words.length > 0) {
                return words
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
            }
        }
        return domain;
    } catch {
        return url.length <= 40 ? url : url.slice(0, 30) + "…";
    }
}

function formatLinkUrl(url: string): string {
    try {
        const u = new URL(url);
        const display = u.hostname + u.pathname + u.search;
        return display.length > 50 ? display.slice(0, 47) + "…" : display;
    } catch {
        return url.length <= 50 ? url : url.slice(0, 47) + "…";
    }
}

export function AttachmentViewer({ attachments }: AttachmentViewerProps) {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    if (attachments.length === 0) return null;

    const links = attachments.filter((a) => a.type === "LINK");
    const images = attachments.filter((a) => a.type === "IMAGE");

    return (
        <>
            <div className="glass-card p-5 mb-6">
                {/* Header */}
                <h3
                    className="text-sm font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "#334155" }}
                >
                    <Paperclip
                        className="w-4 h-4"
                        style={{ color: "var(--primary)" }}
                    />
                    Đính kèm
                    <span
                        className="text-xs font-normal px-1.5 py-0.5"
                        style={{
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(100, 116, 139, 0.08)",
                            color: "var(--muted-light)",
                        }}
                    >
                        {attachments.length}
                    </span>
                </h3>

                {/* Links section */}
                {links.length > 0 && (
                    <div className="mb-4">
                        <p
                            className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5"
                            style={{ color: "var(--muted-light)" }}
                        >
                            <Link2 className="w-3 h-3" />
                            Links
                        </p>
                        <div className="space-y-2">
                            {links.map((att) => (
                                <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-4 py-3 group cursor-pointer transition-all hover:shadow-sm"
                                    style={{
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid rgba(226,232,240,0.6)",
                                        background: "rgba(255,255,255,0.5)",
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 shrink-0 flex items-center justify-center"
                                        style={{
                                            borderRadius: "50%",
                                            background: "rgba(59, 130, 246, 0.08)",
                                            color: "#3B82F6",
                                        }}
                                    >
                                        <Link2 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-sm font-medium truncate"
                                            style={{ color: "#334155" }}
                                        >
                                            {formatLinkTitle(att.url)}
                                        </div>
                                        <div
                                            className="text-xs truncate"
                                            style={{ color: "var(--muted-light)" }}
                                        >
                                            {formatLinkUrl(att.url)}
                                        </div>
                                    </div>
                                    <ExternalLink
                                        className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                                        style={{ color: "var(--muted-light)" }}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Images section */}
                {images.length > 0 && (
                    <div>
                        <p
                            className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5"
                            style={{ color: "var(--muted-light)" }}
                        >
                            <ImageIcon className="w-3 h-3" />
                            Hình ảnh
                        </p>
                        <div
                            className="grid gap-3"
                            style={{
                                gridTemplateColumns: images.length === 1
                                    ? "1fr"
                                    : "repeat(auto-fill, minmax(200px, 1fr))",
                            }}
                        >
                            {images.map((att) => (
                                <button
                                    key={att.id}
                                    type="button"
                                    onClick={() => setLightboxSrc(att.url)}
                                    className="overflow-hidden cursor-pointer group relative"
                                    style={{
                                        borderRadius: "var(--radius-md)",
                                        border: "1.5px solid rgba(0,0,0,0.07)",
                                        aspectRatio: "16/10",
                                    }}
                                >
                                    <img
                                        src={att.url}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ background: "rgba(0,0,0,0.25)" }}
                                    >
                                        <ImageIcon className="w-5 h-5 text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <ImageLightbox
                    src={lightboxSrc}
                    onClose={() => setLightboxSrc(null)}
                />
            )}
        </>
    );
}
