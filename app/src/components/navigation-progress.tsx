"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const cleanup = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    // Listen for link clicks to start the progress bar immediately
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("a");
            if (!target) return;

            const href = target.getAttribute("href");
            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("http") ||
                href.startsWith("mailto:") ||
                target.target === "_blank"
            ) return;

            // Same page link — skip
            if (href === pathname) return;

            // Start progress
            cleanup();
            setVisible(true);
            setProgress(15);

            // Slowly increment
            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 300);
        };

        document.addEventListener("click", handleClick, true);
        return () => {
            document.removeEventListener("click", handleClick, true);
            cleanup();
        };
    }, [pathname, cleanup]);

    // When route actually changes, complete the progress bar
    useEffect(() => {
        if (!visible) return;

        cleanup();
        setProgress(100);

        timerRef.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 300);

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    if (!visible && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0"
            style={{ zIndex: 99999, height: 3, pointerEvents: "none" }}
        >
            <div
                style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)",
                    transition: progress === 100
                        ? "width 200ms ease-out, opacity 300ms ease 200ms"
                        : "width 400ms ease",
                    opacity: progress === 100 ? 0 : 1,
                    borderRadius: "0 2px 2px 0",
                    boxShadow: "0 0 8px rgba(139,92,246,0.5), 0 0 4px rgba(236,72,153,0.3)",
                }}
            />
        </div>
    );
}
