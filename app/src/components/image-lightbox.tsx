"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)", zIndex: 9999 }}
            onClick={onClose}
        >
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                style={{
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "none",
                    zIndex: 10000,
                }}
            >
                <X className="w-5 h-5" />
            </button>
            <img
                src={src}
                alt={alt || "Image"}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                style={{
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
