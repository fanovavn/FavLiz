import {
    Users,
    Bookmark,
    FolderOpen,
    Tags,
    Globe,
    ShieldCheck,
    TrendingUp,
    Clock,
} from "lucide-react";
import { getDashboardStats, getRecentUsers, getRecentItems } from "@/lib/admin-actions";

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const recentUsers = await getRecentUsers(8);
    const recentItems = await getRecentItems(8);

    const statCards = [
        {
            label: "Users",
            value: stats.usersCount,
            icon: Users,
            color: "#3B82F6",
            bg: "rgba(59, 130, 246, 0.1)",
        },
        {
            label: "Items",
            value: stats.itemsCount,
            icon: Bookmark,
            color: "#EC4899",
            bg: "rgba(236, 72, 153, 0.1)",
        },
        {
            label: "Bộ sưu tập",
            value: stats.listsCount,
            icon: FolderOpen,
            color: "#8B5CF6",
            bg: "rgba(139, 92, 246, 0.1)",
        },
        {
            label: "Tags",
            value: stats.tagsCount,
            icon: Tags,
            color: "#F59E0B",
            bg: "rgba(245, 158, 11, 0.1)",
        },
        {
            label: "Public Items",
            value: stats.publicItems,
            icon: Globe,
            color: "#10B981",
            bg: "rgba(16, 185, 129, 0.1)",
        },
        {
            label: "Admins",
            value: stats.adminsCount,
            icon: ShieldCheck,
            color: "#6366F1",
            bg: "rgba(99, 102, 241, 0.1)",
        },
    ];

    return (
        <div className="animate-in space-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    Tổng quan hệ thống FavLiz
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className="stat-card">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: card.bg }}
                            >
                                <card.icon
                                    className="w-5 h-5"
                                    style={{ color: card.color }}
                                />
                            </div>
                        </div>
                        <p
                            className="text-2xl font-bold text-white"
                        >
                            {card.value.toLocaleString()}
                        </p>
                        <p
                            className="text-xs font-medium mt-1"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="glass-card overflow-hidden">
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Users
                                className="w-4 h-4"
                                style={{ color: "#3B82F6" }}
                            />
                            <h3 className="text-sm font-semibold text-white">
                                Users gần đây
                            </h3>
                        </div>
                        <span className="badge badge-info">
                            <Clock className="w-3 h-3 mr-1" />
                            Mới nhất
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {user.name || "—"}
                                                </p>
                                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                    {user.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm">
                                                {user._count.items}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${user.isActive ? "badge-success" : "badge-danger"}`}
                                            >
                                                {user.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-center py-8"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            Chưa có user nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Items */}
                <div className="glass-card overflow-hidden">
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Bookmark
                                className="w-4 h-4"
                                style={{ color: "#EC4899" }}
                            />
                            <h3 className="text-sm font-semibold text-white">
                                Items gần đây
                            </h3>
                        </div>
                        <span className="badge badge-accent">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Mới tạo
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Owner</th>
                                    <th>Visibility</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <p className="text-sm font-medium text-white truncate max-w-[180px]">
                                                {item.title}
                                            </p>
                                        </td>
                                        <td>
                                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                {item.user.name || item.user.email}
                                            </p>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${item.viewMode === "PUBLIC" ? "badge-success" : "badge-warning"}`}
                                            >
                                                {item.viewMode === "PUBLIC"
                                                    ? "Public"
                                                    : "Private"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentItems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-center py-8"
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            Chưa có item nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
