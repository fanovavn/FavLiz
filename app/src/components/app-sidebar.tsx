"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Heart,
    LayoutDashboard,
    Bookmark,
    FolderOpen,
    Tags,
    LogOut,
    Settings,
    Globe,
    ChevronDown,
    Check,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { useLanguage } from "@/components/language-provider";
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from "@/lib/i18n";
import { updateLanguage } from "@/lib/user-actions";

interface AppSidebarProps {
    userEmail: string;
    itemsLabel?: string;
}

function getInitials(email: string): string {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
}

// ─── Language Switcher ───────────────────────────────────────
function LanguageSwitcher() {
    const { locale, t } = useLanguage();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const handleSwitch = async (loc: Locale) => {
        if (loc === locale || switching) return;
        setSwitching(true);
        setOpen(false);
        try {
            await updateLanguage(loc);
            router.refresh();
        } catch {
            // silently fail
        } finally {
            setSwitching(false);
        }
    };

    return (
        <div ref={ref} className="relative px-3 mb-1">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                disabled={switching}
                className="sidebar-link w-full"
                style={{
                    color: "var(--muted-light)",
                    justifyContent: "space-between",
                    opacity: switching ? 0.6 : 1,
                }}
            >
                <span className="flex items-center gap-2.5">
                    <Globe className="w-[18px] h-[18px]" />
                    <span className="flex items-center gap-1.5">
                        <span>{LOCALE_FLAGS[locale]}</span>
                        <span>{LOCALE_NAMES[locale]}</span>
                    </span>
                </span>
                <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute left-3 right-3 bottom-full mb-1.5 py-1"
                    style={{
                        borderRadius: "var(--radius-md)",
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(226,232,240,0.7)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                        zIndex: 50,
                    }}
                >
                    {SUPPORTED_LOCALES.map((loc) => {
                        const isActive = locale === loc;
                        return (
                            <button
                                key={loc}
                                type="button"
                                onClick={() => handleSwitch(loc)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-all"
                                style={{
                                    background: isActive
                                        ? "rgba(var(--primary-rgb, 219, 39, 119), 0.06)"
                                        : "transparent",
                                    color: isActive ? "var(--primary)" : "#475569",
                                    fontWeight: isActive ? 600 : 400,
                                    border: "none",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.background = "rgba(241,245,249,0.8)";
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <span className="text-base">{LOCALE_FLAGS[loc]}</span>
                                <span className="flex-1 text-left">{LOCALE_NAMES[loc]}</span>
                                {isActive && (
                                    <Check
                                        className="w-3.5 h-3.5"
                                        style={{ color: "var(--primary)" }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Sidebar ────────────────────────────────────────────
export function AppSidebar({ userEmail, itemsLabel = "Items" }: AppSidebarProps) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const NAV_ITEMS = [
        { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
        { href: "/items", label: itemsLabel, icon: Bookmark },
        { href: "/lists", label: t("sidebar.collections"), icon: FolderOpen },
        { href: "/tags", label: t("sidebar.tags"), icon: Tags },
        { href: "/settings", label: t("sidebar.settings"), icon: Settings },
    ];

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex sidebar-glass fixed left-0 top-0 bottom-0 w-[260px] flex-col z-30">
                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-6 py-5"
                    style={{ borderBottom: "1px solid rgba(226,232,240,0.5)" }}
                >
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--primary), var(--primary-light))",
                        }}
                    >
                        <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-lg font-bold gradient-text">
                        FavLiz
                    </span>
                </Link>

                {/* Nav */}
                <nav className="flex-1 px-3 py-5 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" &&
                                pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? "active" : ""}`}
                            >
                                <item.icon className="w-[18px] h-[18px]" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div
                    className="py-3"
                    style={{ borderTop: "1px solid rgba(226,232,240,0.5)" }}
                >
                    {/* Language switcher */}
                    <LanguageSwitcher />

                    {/* User info */}
                    <div className="flex items-center gap-3 px-6 py-2 mt-1">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--primary-light), var(--primary))",
                            }}
                        >
                            {getInitials(userEmail)}
                        </div>
                        <p
                            className="text-xs truncate"
                            style={{ color: "var(--muted)" }}
                        >
                            {userEmail}
                        </p>
                    </div>
                    <div className="px-3">
                        <form action={signOut}>
                            <button
                                type="submit"
                                className="sidebar-link w-full"
                                style={{ color: "var(--muted-light)" }}
                            >
                                <LogOut className="w-[18px] h-[18px]" />
                                <span>{t("sidebar.logout")}</span>
                            </button>
                        </form>
                    </div>
                    <div className="px-4 py-2 text-center space-y-0.5">
                        <span style={{ fontSize: "10px", color: "var(--muted-light)", opacity: 0.5, display: "block" }}>
                            v1.0.1
                        </span>
                        <span style={{ fontSize: "9px", color: "var(--muted-light)", opacity: 0.4, display: "block" }}>
                            From Fanova with ❤️
                        </span>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="md:hidden mobile-nav">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mobile-nav-link ${isActive ? "active" : ""}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
