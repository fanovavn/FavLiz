"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LOCALE_FLAGS, LOCALE_NAMES } from "@/lib/i18n";

const LOCALES: Locale[] = ["vi", "en", "zh", "ru"];

interface LandingLanguageSwitcherProps {
    currentLocale: Locale;
    /** Open the dropdown upward instead of downward */
    dropUp?: boolean;
}

export function LandingLanguageSwitcher({ currentLocale, dropUp = false }: LandingLanguageSwitcherProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const switchLocale = (locale: Locale) => {
        // Store in cookie and reload
        document.cookie = `landing_locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`;
        window.location.reload();
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-pink-600 hover:bg-pink-50/50 transition-colors cursor-pointer"
                style={{ fontSize: "0.85rem", fontWeight: 500 }}
                title="Change language"
            >
                <Globe className="w-4 h-4" />
                <span>{LOCALE_FLAGS[currentLocale]}</span>
            </button>

            {open && (
                <div
                    className={`absolute right-0 w-44 bg-white rounded-xl shadow-xl shadow-pink-500/10 border border-pink-100/50 py-1 overflow-hidden ${dropUp ? "bottom-full mb-2" : "top-full mt-2"
                        }`}
                    style={{ animation: "modalFadeIn 0.15s ease" }}
                >
                    {LOCALES.map((locale) => (
                        <button
                            key={locale}
                            onClick={() => { switchLocale(locale); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${locale === currentLocale
                                ? "bg-pink-50 text-pink-600"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                            style={{ fontSize: "0.85rem", fontWeight: locale === currentLocale ? 600 : 400 }}
                        >
                            <span style={{ fontSize: "1.1rem" }}>{LOCALE_FLAGS[locale]}</span>
                            <span>{LOCALE_NAMES[locale]}</span>
                            {locale === currentLocale && (
                                <span className="ml-auto text-pink-500" style={{ fontSize: "0.75rem" }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
