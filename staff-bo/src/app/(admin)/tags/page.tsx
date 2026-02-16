"use client";

import { useState, useEffect, useCallback } from "react";
import { Tags, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getTags } from "@/lib/admin-actions";

interface TagData {
    id: string;
    name: string;
    createdAt: Date;
    user: { email: string; name: string | null };
    _count: { items: number };
}

export default function TagsPage() {
    const [tags, setTags] = useState<TagData[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        const data = await getTags(page, search);
        setTags(data.tags as TagData[]);
        setTotal(data.total);
        setPages(data.pages);
        setLoading(false);
    }, [page, search]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="animate-in space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Tags className="w-6 h-6" style={{ color: "#F59E0B" }} />
                        Tags
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Quản lý {total} tags
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                        <input
                            type="text"
                            className="input-admin"
                            style={{ paddingLeft: "36px", width: "280px" }}
                            placeholder="Tìm theo tên tag..."
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
                                <th>Tag</th>
                                <th>Owner</th>
                                <th>Items</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : tags.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Không tìm thấy tag nào
                                    </td>
                                </tr>
                            ) : (
                                tags.map((tag) => (
                                    <tr key={tag.id}>
                                        <td>
                                            <span className="badge badge-accent">{tag.name}</span>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm">{tag.user.name || "—"}</p>
                                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{tag.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="text-sm font-medium text-white">{tag._count.items}</td>
                                        <td className="text-sm">{new Date(tag.createdAt).toLocaleDateString("vi-VN")}</td>
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
