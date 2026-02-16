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

function formatLinkLabel(url: string): string {
    try {
        const u = new URL(url);
        const domain = u.hostname.replace(/^www\./, "");
        const path = u.pathname + u.search + u.hash;
        if (path.length <= 1) return domain;
        const tail = path.length > 8 ? "…" + path.slice(-8) : path;
        return `${domain}${tail}`;
    } catch {
        if (url.length <= 30) return url;
        return url.slice(0, 16) + "…" + url.slice(-8);
    }
}

export function AttachmentViewer({ attachments }: AttachmentViewerProps) {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    if (attachments.length === 0) return null;

    return (
        <>
            <div className="glass-card p-5 mb-6">
                <h3
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
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

                {/* Horizontal scroll row */}
                <div
                    className="flex gap-2 overflow-x-auto pb-2"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(0,0,0,0.1) transparent",
                    }}
                >
                    {attachments.map((att) =>
                        att.type === "IMAGE" ? (
                            <button
                                key={att.id}
                                type="button"
                                onClick={() => setLightboxSrc(att.url)}
                                className="shrink-0 overflow-hidden cursor-pointer group relative"
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "var(--radius-md)",
                                    border: "1.5px solid rgba(0,0,0,0.1)",
                                }}
                            >
                                <img
                                    src={att.url}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: "rgba(0,0,0,0.3)" }}
                                >
                                    <ImageIcon className="w-4 h-4 text-white" />
                                </div>
                            </button>
                        ) : (
                            <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex items-center gap-2 px-3 py-2.5 text-xs group cursor-pointer transition-all hover:shadow-sm"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: "1.5px solid rgba(0,0,0,0.1)",
                                    background: "rgba(255,255,255,0.7)",
                                    maxWidth: 220,
                                    height: 80,
                                }}
                            >
                                <div
                                    className="w-6 h-6 shrink-0 flex items-center justify-center"
                                    style={{
                                        borderRadius: 6,
                                        background: "rgba(59, 130, 246, 0.08)",
                                        color: "#3B82F6",
                                    }}
                                >
                                    <Link2 className="w-3 h-3" />
                                </div>
                                <span
                                    className="truncate"
                                    style={{ color: "var(--muted)" }}
                                >
                                    {formatLinkLabel(att.url)}
                                </span>
                                <ExternalLink
                                    className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity"
                                    style={{ color: "var(--muted-light)" }}
                                />
                            </a>
                        )
                    )}
                </div>
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
