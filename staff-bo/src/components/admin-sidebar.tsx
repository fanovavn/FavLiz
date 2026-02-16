"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Heart,
    LayoutDashboard,
    Users,
    Bookmark,
    FolderOpen,
    Tags,
    ShieldCheck,
    Shield,
    LogOut,
    ChevronLeft,
    Menu,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/lib/auth-actions";
import { hasPermission, type Resource } from "@/lib/permissions";

interface SidebarProps {
    adminName: string | null;
    isRoot: boolean;
    permissions: string[];
    roles: string[];
}

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; requiredPermission?: { resource: Resource; action: "read" } }[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users, requiredPermission: { resource: "users", action: "read" } },
    { href: "/items", label: "Items", icon: Bookmark, requiredPermission: { resource: "items", action: "read" } },
    { href: "/lists", label: "Bộ sưu tập", icon: FolderOpen, requiredPermission: { resource: "lists", action: "read" } },
    { href: "/tags", label: "Tags", icon: Tags, requiredPermission: { resource: "tags", action: "read" } },
    { href: "/admins", label: "Quản trị viên", icon: ShieldCheck, requiredPermission: { resource: "admins", action: "read" } },
    { href: "/roles", label: "Phân quyền", icon: Shield, requiredPermission: { resource: "roles", action: "read" } },
];

export default function AdminSidebar({ adminName, isRoot, permissions = [], roles = [] }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    // Filter nav items based on permissions (root sees all)
    const visibleNavItems = navItems.filter((item) => {
        if (!item.requiredPermission) return true; // Dashboard always visible
        if (isRoot) return true;
        return hasPermission(permissions, item.requiredPermission.resource, item.requiredPermission.action);
    });

    // Role display
    const roleDisplay = isRoot ? "Root Admin" : roles.join(", ") || "Admin";

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 lg:hidden"
                style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text-secondary)",
                }}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
                style={{
                    width: collapsed ? "72px" : "260px",
                    background: "var(--color-bg-card)",
                    borderRight: "1px solid var(--color-border)",
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-3 px-5 py-5 shrink-0"
                    style={{
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background:
                                "linear-gradient(135deg, #DB2777, #EC4899)",
                        }}
                    >
                        <Heart className="w-4.5 h-4.5 text-white fill-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <span className="text-sm font-bold text-white">
                                FavLiz
                            </span>
                            <span
                                className="text-xs font-semibold ml-1"
                                style={{ color: "var(--color-accent)" }}
                            >
                                Admin
                            </span>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <div className="space-y-1">
                        {visibleNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
                                    style={{
                                        borderRadius: "var(--radius-md)",
                                        color: isActive
                                            ? "white"
                                            : "var(--color-text-muted)",
                                        background: isActive
                                            ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.1))"
                                            : "transparent",
                                        border: isActive
                                            ? "1px solid rgba(236,72,153,0.2)"
                                            : "1px solid transparent",
                                        textDecoration: "none",
                                    }}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon
                                        className="w-[18px] h-[18px] shrink-0"
                                        style={{
                                            color: isActive
                                                ? "var(--color-accent)"
                                                : "var(--color-text-muted)",
                                        }}
                                    />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom */}
                <div
                    className="px-3 py-4 shrink-0"
                    style={{
                        borderTop: "1px solid var(--color-border)",
                    }}
                >
                    {/* Admin info */}
                    {!collapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                }}
                            >
                                {(adminName || "A").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {adminName || "Admin"}
                                </p>
                                <p
                                    className="text-xs truncate"
                                    style={{
                                        color: isRoot
                                            ? "var(--color-accent)"
                                            : "var(--color-text-muted)",
                                    }}
                                >
                                    {roleDisplay}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Collapse + Logout */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex items-center justify-center w-full py-2 text-sm cursor-pointer transition-colors"
                            style={{
                                borderRadius: "var(--radius-md)",
                                color: "var(--color-text-muted)",
                                background: "transparent",
                                border: "none",
                            }}
                            title={collapsed ? "Mở rộng" : "Thu gọn"}
                        >
                            <ChevronLeft
                                className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
                            />
                            {!collapsed && (
                                <span className="ml-2">Thu gọn</span>
                            )}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium cursor-pointer transition-all mt-1"
                        style={{
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-danger)",
                            background: "transparent",
                            border: "none",
                        }}
                    >
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                    <div className={`py-2 ${collapsed ? "text-center" : "px-3"}`}>
                        <span style={{ fontSize: "10px", color: "var(--color-text-muted)", opacity: 0.5 }}>
                            {collapsed ? "v1" : "v1.0.0"}
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
}
