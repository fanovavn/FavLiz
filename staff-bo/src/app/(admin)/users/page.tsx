"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, ChevronLeft, ChevronRight, Power } from "lucide-react";
import { getUsers, toggleUserStatus } from "@/lib/admin-actions";

interface UserData {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    isActive: boolean;
    createdAt: Date;
    _count: { items: number; lists: number; tags: number };
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const data = await getUsers(page, search);
        setUsers(data.users as UserData[]);
        setTotal(data.total);
        setPages(data.pages);
        setLoading(false);
    }, [page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggle = async (userId: string) => {
        await toggleUserStatus(userId);
        fetchUsers();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    return (
        <div className="animate-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6" style={{ color: "#3B82F6" }} />
                        Users
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Quản lý {total} người dùng
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--color-text-muted)" }}
                        />
                        <input
                            type="text"
                            className="input-admin"
                            style={{ paddingLeft: "36px", width: "280px" }}
                            placeholder="Tìm theo email hoặc tên..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Tìm
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Username</th>
                                <th>Items</th>
                                <th>Lists</th>
                                <th>Tags</th>
                                <th>Status</th>
                                <th>Ngày tạo</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Không tìm thấy user nào
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
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
                                        <td className="text-sm">
                                            {user.username || "—"}
                                        </td>
                                        <td className="text-sm font-medium text-white">
                                            {user._count.items}
                                        </td>
                                        <td className="text-sm font-medium text-white">
                                            {user._count.lists}
                                        </td>
                                        <td className="text-sm font-medium text-white">
                                            {user._count.tags}
                                        </td>
                                        <td>
                                            <span className={`badge ${user.isActive ? "badge-success" : "badge-danger"}`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="text-sm">
                                            {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggle(user.id)}
                                                className={`btn-${user.isActive ? "danger" : "primary"} text-xs`}
                                                style={{ padding: "6px 12px" }}
                                                title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                            >
                                                <Power className="w-3.5 h-3.5" />
                                                {user.isActive ? "Disable" : "Enable"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            Hiển thị {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} / {total}
                        </p>
                        <div className="flex gap-1">
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    className={`pagination-btn ${page === p ? "active" : ""}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
