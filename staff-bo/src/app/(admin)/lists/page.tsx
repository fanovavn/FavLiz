"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getLists } from "@/lib/admin-actions";

interface ListData {
    id: string;
    name: string;
    description: string | null;
    viewMode: string;
    createdAt: Date;
    user: { email: string; name: string | null };
    _count: { items: number };
}

export default function ListsPage() {
    const [lists, setLists] = useState<ListData[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchLists = useCallback(async () => {
        setLoading(true);
        const data = await getLists(page, search);
        setLists(data.lists as ListData[]);
        setTotal(data.total);
        setPages(data.pages);
        setLoading(false);
    }, [page, search]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="animate-in space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FolderOpen className="w-6 h-6" style={{ color: "#8B5CF6" }} />
                        Bộ sưu tập
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Quản lý {total} bộ sưu tập
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                        <input
                            type="text"
                            className="input-admin"
                            style={{ paddingLeft: "36px", width: "280px" }}
                            placeholder="Tìm theo tên..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary">Tìm</button>
                </form>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Mô tả</th>
                                <th>Owner</th>
                                <th>Items</th>
                                <th>Visibility</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : lists.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Không tìm thấy bộ sưu tập nào
                                    </td>
                                </tr>
                            ) : (
                                lists.map((list) => (
                                    <tr key={list.id}>
                                        <td>
                                            <p className="text-sm font-medium text-white">{list.name}</p>
                                        </td>
                                        <td>
                                            <p className="text-sm truncate max-w-[200px]" style={{ color: "var(--color-text-muted)" }}>
                                                {list.description || "—"}
                                            </p>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm">{list.user.name || "—"}</p>
                                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{list.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="text-sm font-medium text-white">{list._count.items}</td>
                                        <td>
                                            <span className={`badge ${list.viewMode === "PUBLIC" ? "badge-success" : "badge-warning"}`}>
                                                {list.viewMode === "PUBLIC" ? "Public" : "Private"}
                                            </span>
                                        </td>
                                        <td className="text-sm">{new Date(list.createdAt).toLocaleDateString("vi-VN")}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            Hiển thị {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} / {total}
                        </p>
                        <div className="flex gap-1">
                            <button className="pagination-btn" onClick={() => setPage(page - 1)} disabled={page === 1}>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                                <button key={p} className={`pagination-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>
                                    {p}
                                </button>
                            ))}
                            <button className="pagination-btn" onClick={() => setPage(page + 1)} disabled={page === pages}>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
