"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { getItems } from "@/lib/admin-actions";

interface ItemData {
    id: string;
    title: string;
    viewMode: string;
    createdAt: Date;
    user: { email: string; name: string | null };
    tags: { name: string }[];
    _count: { attachments: number };
}

export default function ItemsPage() {
    const [items, setItems] = useState<ItemData[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const data = await getItems(page, search, visibility);
        setItems(data.items as ItemData[]);
        setTotal(data.total);
        setPages(data.pages);
        setLoading(false);
    }, [page, search, visibility]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="animate-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bookmark className="w-6 h-6" style={{ color: "#EC4899" }} />
                        Items
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Quản lý {total} items
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {/* Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                        <select
                            className="input-admin appearance-none cursor-pointer"
                            style={{ paddingLeft: "36px", width: "160px" }}
                            value={visibility}
                            onChange={(e) => { setVisibility(e.target.value); setPage(1); }}
                        >
                            <option value="">Tất cả</option>
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                        </select>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                            <input
                                type="text"
                                className="input-admin"
                                style={{ paddingLeft: "36px", width: "250px" }}
                                placeholder="Tìm theo tiêu đề..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary">Tìm</button>
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Owner</th>
                                <th>Tags</th>
                                <th>Files</th>
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
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Không tìm thấy item nào
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <p className="text-sm font-medium text-white truncate max-w-[250px]">
                                                {item.title}
                                            </p>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm">{item.user.name || "—"}</p>
                                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                                    {item.user.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag.name} className="badge badge-accent text-[11px]">
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {item.tags.length > 3 && (
                                                    <span className="badge badge-info text-[11px]">
                                                        +{item.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-sm">
                                            {item._count.attachments}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.viewMode === "PUBLIC" ? "badge-success" : "badge-warning"}`}>
                                                {item.viewMode === "PUBLIC" ? "Public" : "Private"}
                                            </span>
                                        </td>
                                        <td className="text-sm">
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
