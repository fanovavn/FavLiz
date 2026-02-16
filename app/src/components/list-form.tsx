"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Type,
    FileText,
    Lock,
    Globe,
    Loader2,
} from "lucide-react";
import { createList, updateList } from "@/lib/list-actions";

interface ListFormProps {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        name: string;
        description?: string | null;
        viewMode: string;
    };
}

export function ListForm({ mode, initialData }: ListFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(
        initialData?.description || ""
    );
    const [viewMode, setViewMode] = useState<"PRIVATE" | "PUBLIC">(
        (initialData?.viewMode as "PRIVATE" | "PUBLIC") || "PRIVATE"
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Tên bộ sưu tập không được để trống");
            return;
        }

        setLoading(true);
        try {
            const data = {
                name: name.trim(),
                description: description.trim() || undefined,
                viewMode,
            };

            if (mode === "edit" && initialData) {
                const result = await updateList({ ...data, id: initialData.id });
                if (result.error) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }
                window.location.href = `/lists/${initialData.id}`;
            } else {
                const result = await createList(data);
                window.location.href = `/lists/${result.id}`;
            }
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
            setLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href={
                        mode === "edit" && initialData
                            ? `/lists/${initialData.id}`
                            : "/lists"
                    }
                    className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                    style={{
                        borderRadius: "var(--radius-md)",
                        background: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(226,232,240,0.8)",
                        color: "var(--muted)",
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1
                    className="text-2xl font-bold"
                    style={{ color: "#1E293B" }}
                >
                    {mode === "create"
                        ? "Tạo bộ sưu tập mới"
                        : "Chỉnh sửa bộ sưu tập"}
                </h1>
            </div>

            {error && (
                <div
                    className="text-sm px-4 py-3 mb-6"
                    style={{
                        background: "rgba(239, 68, 68, 0.06)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        borderRadius: "var(--radius-md)",
                        color: "#DC2626",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label
                        className="flex items-center gap-2 text-sm font-medium mb-2"
                        style={{ color: "var(--muted)" }}
                    >
                        <Type className="w-4 h-4" />
                        Tên bộ sưu tập{" "}
                        <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <input
                        type="text"
                        className="input-glass"
                        placeholder="VD: Món Việt, Phim hay..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Description */}
                <div>
                    <label
                        className="flex items-center gap-2 text-sm font-medium mb-2"
                        style={{ color: "var(--muted)" }}
                    >
                        <FileText className="w-4 h-4" />
                        Mô tả
                    </label>
                    <textarea
                        className="textarea-glass"
                        placeholder="Mô tả bộ sưu tập của bạn..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* View Mode */}
                <div>
                    <label
                        className="text-sm font-medium mb-3 block"
                        style={{ color: "var(--muted)" }}
                    >
                        Chế độ hiển thị
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setViewMode("PRIVATE")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium cursor-pointer transition-all"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border:
                                    viewMode === "PRIVATE"
                                        ? "1.5px solid #94A3B8"
                                        : "1.5px solid rgba(226,232,240,0.8)",
                                background:
                                    viewMode === "PRIVATE"
                                        ? "rgba(100, 116, 139, 0.06)"
                                        : "rgba(255,255,255,0.4)",
                                color:
                                    viewMode === "PRIVATE"
                                        ? "#475569"
                                        : "var(--muted-light)",
                            }}
                        >
                            <Lock className="w-4 h-4" />
                            Private
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("PUBLIC")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium cursor-pointer transition-all"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border:
                                    viewMode === "PUBLIC"
                                        ? "1.5px solid #86EFAC"
                                        : "1.5px solid rgba(226,232,240,0.8)",
                                background:
                                    viewMode === "PUBLIC"
                                        ? "rgba(34, 197, 94, 0.06)"
                                        : "rgba(255,255,255,0.4)",
                                color:
                                    viewMode === "PUBLIC"
                                        ? "#16A34A"
                                        : "var(--muted-light)",
                            }}
                        >
                            <Globe className="w-4 h-4" />
                            Public
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="gradient-btn w-full flex items-center justify-center gap-2 py-3.5"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang lưu...
                        </>
                    ) : mode === "create" ? (
                        "Tạo bộ sưu tập"
                    ) : (
                        "Cập nhật bộ sưu tập"
                    )}
                </button>
            </form>
        </div>
    );
}
