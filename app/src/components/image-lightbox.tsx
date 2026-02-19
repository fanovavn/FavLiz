"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, onClose, onNavigate }: ImageLightboxProps) {
    const hasMultiple = images.length > 1;

    const goNext = useCallback(() => {
        if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    }, [currentIndex, images.length, onNavigate]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) onNavigate(currentIndex - 1);
    }, [currentIndex, onNavigate]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose, goNext, goPrev]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.9)", zIndex: 9999 }}
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
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

            {/* Counter */}
            {hasMultiple && (
                <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-medium"
                    style={{
                        color: "rgba(255,255,255,0.8)",
                        zIndex: 10000,
                    }}
                >
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Previous button */}
            {hasMultiple && currentIndex > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                    }}
                    className="absolute left-3 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        border: "none",
                        zIndex: 10000,
                    }}
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            )}

            {/* Next button */}
            {hasMultiple && currentIndex < images.length - 1 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                    }}
                    className="absolute right-3 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                        border: "none",
                        zIndex: 10000,
                    }}
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            )}

            {/* Image */}
            <img
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] object-contain"
                style={{
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Thumbnail strip */}
            {hasMultiple && (
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(12px)",
                        zIndex: 10000,
                        maxWidth: "90vw",
                        overflowX: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => onNavigate(idx)}
                            className="shrink-0 overflow-hidden cursor-pointer transition-all"
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                border: idx === currentIndex
                                    ? "2px solid #fff"
                                    : "2px solid transparent",
                                opacity: idx === currentIndex ? 1 : 0.5,
                            }}
                        >
                            <img
                                src={img}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
