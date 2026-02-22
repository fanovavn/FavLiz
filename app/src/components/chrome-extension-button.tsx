"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Chrome, Sparkles, X } from "lucide-react";
import { trackEvent } from "@/lib/firebase";

interface ChromeExtensionButtonProps {
    className?: string;
    style?: React.CSSProperties;
    location?: string;
    labelInstall?: string;
    labelComingSoon?: string;
    labelComingSoonDesc?: string;
    labelOk?: string;
}

export function ChromeExtensionButton({
    className,
    style,
    location = "hero",
    labelInstall = "Cài Chrome Extension",
    labelComingSoon = "Sắp ra mắt!",
    labelComingSoonDesc = "Tính năng này sẽ được ra mắt trong thời gian tới. Hãy theo dõi để không bỏ lỡ nhé!",
    labelOk = "Đã hiểu",
}: ChromeExtensionButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = () => {
        trackEvent("landing_chrome_ext_click", { location });
        setShowModal(true);
    };

    const modal = showModal ? (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={() => setShowModal(false)}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{
                    background: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    animation: "modalFadeIn 0.2s ease",
                }}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
                style={{
                    animation: "modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: "1px solid rgba(236, 72, 153, 0.1)",
                    boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.15)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div
                    className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #EC4899, #F43F5E)" }}
                >
                    <Sparkles className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-gray-900 mb-2" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    {labelComingSoon}
                </h3>
                <p className="text-gray-500 mb-6" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    {labelComingSoonDesc}
                </p>

                {/* Button */}
                <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 rounded-full text-white hover:shadow-lg transition-all cursor-pointer"
                    style={{
                        background: "linear-gradient(135deg, #EC4899, #F43F5E)",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                    }}
                >
                    {labelOk}
                </button>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                onClick={handleClick}
                className={className}
                style={style}
            >
                <Chrome className="w-5 h-5" />
                {labelInstall}
            </button>

            {mounted && modal && createPortal(modal, document.body)}
        </>
    );
}
