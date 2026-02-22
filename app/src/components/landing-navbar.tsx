"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { LandingLogoutButton } from "./landing-logout-button";
import { LandingLanguageSwitcher } from "./landing-language-switcher";
import { trackEvent } from "@/lib/firebase";
import type { Locale } from "@/lib/i18n";

interface LandingNavbarProps {
    isLoggedIn: boolean;
    userName: string | null;
    locale: Locale;
    t: Record<string, string | string[]>;
}

export function LandingNavbar({ isLoggedIn, userName, locale, t }: LandingNavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: t.navFeatures as string, href: "#features" },
        { label: t.navUseCases as string, href: "#usecases" },
        { label: t.navProducts as string, href: "#products" },
        { label: t.navComparison as string, href: "#comparison" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-pink-100/50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        Fav<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Liz</span>
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-gray-600 hover:text-pink-600 transition-colors no-underline"
                            style={{ fontSize: "0.9rem", fontWeight: 500 }}
                            onClick={() => trackEvent("landing_nav_click", { target: link.href.replace("#", "") })}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <LandingLanguageSwitcher currentLocale={locale} />
                    {isLoggedIn ? (
                        <>
                            <span className="text-sm font-medium text-gray-500">
                                {t.navHello}{" "}
                                <span className="font-semibold text-gray-900">{userName || "bạn"}</span>
                            </span>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all no-underline"
                                style={{ fontSize: "0.9rem", fontWeight: 600 }}
                            >
                                {t.ctaApp}
                            </Link>
                            <LandingLogoutButton />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="px-4 py-2 text-gray-700 hover:text-pink-600 transition-colors no-underline"
                                style={{ fontSize: "0.9rem", fontWeight: 500 }}
                                onClick={() => trackEvent("landing_login_click")}
                            >
                                {t.navLogin}
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all no-underline"
                                style={{ fontSize: "0.9rem", fontWeight: 600 }}
                                onClick={() => trackEvent("landing_register_click")}
                            >
                                {t.navRegister}
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center gap-2">
                    <LandingLanguageSwitcher currentLocale={locale} />
                    <button
                        className="p-2 text-gray-700 cursor-pointer"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-pink-100 px-6 py-4 space-y-3">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="block py-2 text-gray-600 hover:text-pink-600 no-underline"
                            style={{ fontSize: "0.95rem", fontWeight: 500 }}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block text-center py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full no-underline"
                                    style={{ fontWeight: 600 }}
                                >
                                    {t.ctaApp}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block py-2 text-gray-600 no-underline" style={{ fontWeight: 500 }}>
                                    {t.navLogin}
                                </Link>
                                <Link
                                    href="/register"
                                    className="block text-center py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full no-underline"
                                    style={{ fontWeight: 600 }}
                                >
                                    {t.navRegister}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
