"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Globe, Link2 } from "lucide-react";

interface ShareButtonProps {
    shareUrl: string | null;
}

export function ShareButton({ shareUrl }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [fullUrl, setFullUrl] = useState(shareUrl || "");

    useEffect(() => {
        if (shareUrl) {
            setFullUrl(`${window.location.origin}${shareUrl}`);
        }
    }, [shareUrl]);

    if (!shareUrl) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <div
            className="w-full"
            style={{
                borderRadius: "var(--radius-lg)",
                background: copied
                    ? "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.08))"
                    : `linear-gradient(135deg, color-mix(in srgb, var(--primary) 4%, transparent), color-mix(in srgb, var(--primary) 8%, transparent))`,
                border: `1.5px solid ${copied ? "rgba(16,185,129,0.2)" : "color-mix(in srgb, var(--primary) 15%, transparent)"}`,
                padding: "12px 16px",
                transition: "all 0.3s ease",
            }}
        >
            {/* Label */}
            <div
                className="flex items-center gap-1.5 mb-2"
                style={{ color: copied ? "#059669" : "var(--primary)" }}
            >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                    {copied ? "Đã sao chép!" : "Link chia sẻ công khai"}
                </span>
            </div>

            {/* URL + Copy Button */}
            <div className="flex items-center gap-2">
                <div
                    className="flex-1 flex items-center gap-2 min-w-0 px-3 py-2"
                    style={{
                        borderRadius: "var(--radius-md)",
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(226,232,240,0.6)",
                    }}
                >
                    <Link2
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "var(--muted-light)" }}
                    />
                    <span
                        className="text-sm truncate select-all"
                        style={{
                            color: "#334155",
                            fontFamily: "monospace",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {fullUrl}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
                    style={{
                        borderRadius: "var(--radius-md)",
                        background: copied
                            ? "linear-gradient(135deg, #10B981, #059669)"
                            : "linear-gradient(135deg, var(--primary-light), var(--primary))",
                        color: "#fff",
                        border: "none",
                        boxShadow: copied
                            ? "0 2px 8px rgba(16,185,129,0.3)"
                            : `0 2px 8px color-mix(in srgb, var(--primary) 35%, transparent)`,
                    }}
                    title="Sao chép link"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
