"use client";

import { useState, useRef } from "react";
import {
    ArrowLeft,
    Type,
    FileText,
    Lock,
    Globe,
    Loader2,
    ImagePlus,
    X,
} from "lucide-react";
import { createList } from "@/lib/list-actions";

interface CreateListModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (list: { id: string; name: string }) => void;
}

export function CreateListModal({
    open,
    onClose,
    onCreated,
}: CreateListModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [viewMode, setViewMode] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    const reset = () => {
        setName("");
        setDescription("");
        setThumbnail(null);
        setViewMode("PRIVATE");
        setError("");
        setLoading(false);
        setUploadingImage(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("File quá lớn. Tối đa 5MB.");
            return;
        }
        if (
            !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
                file.type
            )
        ) {
            setError(
                "Định dạng không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP, GIF."
            );
            return;
        }

        setUploadingImage(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Upload thất bại.");
                return;
            }

            setThumbnail(data.url);
        } catch {
            setError("Có lỗi xảy ra khi upload ảnh.");
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        setError("");

        if (!name.trim()) {
            setError("Tên bộ sưu tập không được để trống");
            return;
        }

        setLoading(true);
        try {
            const result = await createList({
                name: name.trim(),
                description: description.trim() || undefined,
                thumbnail: thumbnail || undefined,
                viewMode,
            });

            const created = { id: result.id, name: name.trim() };
            reset();
            onCreated?.(created);
            onClose();
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
                style={{
                    borderRadius: "var(--radius-xl, 20px)",
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255,255,255,0.5)",
                }}
            >
                <div className="p-6 sm:p-7">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                            style={{
                                borderRadius: "var(--radius-md)",
                                background: "rgba(241,245,249,0.8)",
                                border: "none",
                                color: "var(--muted)",
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h3
                            className="text-base font-bold"
                            style={{ color: "#1E293B" }}
                        >
                            Tạo bộ sưu tập mới
                        </h3>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="text-sm px-4 py-2.5 mb-5"
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

                    {/* Name */}
                    <div className="mb-4">
                        <label
                            className="flex items-center gap-2 text-sm font-medium mb-2"
                            style={{ color: "var(--muted)" }}
                        >
                            <Type className="w-3.5 h-3.5" />
                            Tên bộ sưu tập{" "}
                            <span style={{ color: "var(--primary)" }}>*</span>
                        </label>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="VD: Món Việt, Phim hay..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label
                            className="flex items-center gap-2 text-sm font-medium mb-2"
                            style={{ color: "var(--muted)" }}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Mô tả
                        </label>
                        <textarea
                            className="textarea-glass"
                            placeholder="Mô tả bộ sưu tập của bạn..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Thumbnail */}
                    <div className="mb-5">
                        <label
                            className="flex items-center gap-2 text-sm font-medium mb-2"
                            style={{ color: "var(--muted)" }}
                        >
                            <ImagePlus className="w-3.5 h-3.5" />
                            Ảnh đại diện
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />

                        {thumbnail ? (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-16 h-16 overflow-hidden shrink-0"
                                    style={{
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--card-border)",
                                    }}
                                >
                                    <img
                                        src={thumbnail}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="text-xs font-medium px-3 py-1.5 cursor-pointer"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            border: "1px solid rgba(226,232,240,0.8)",
                                            background: "rgba(255,255,255,0.6)",
                                            color: "var(--muted)",
                                        }}
                                    >
                                        Đổi ảnh
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setThumbnail(null)}
                                        className="text-xs font-medium px-3 py-1.5 cursor-pointer"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            border: "1px solid rgba(239, 68, 68, 0.2)",
                                            background: "rgba(239, 68, 68, 0.04)",
                                            color: "#EF4444",
                                        }}
                                    >
                                        Xoá
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-all py-5"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: "2px dashed rgba(148, 163, 184, 0.35)",
                                    background: "rgba(248, 250, 252, 0.6)",
                                    color: "var(--muted)",
                                }}
                            >
                                {uploadingImage ? (
                                    <Loader2
                                        className="w-6 h-6 animate-spin"
                                        style={{ color: "var(--primary)" }}
                                    />
                                ) : (
                                    <>
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                                            style={{
                                                background:
                                                    "rgba(100, 116, 139, 0.06)",
                                            }}
                                        >
                                            <ImagePlus
                                                className="w-4.5 h-4.5"
                                                style={{ color: "#94A3B8" }}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <span
                                                className="text-xs font-medium block"
                                                style={{ color: "#64748B" }}
                                            >
                                                Nhấn để tải ảnh lên
                                            </span>
                                            <span
                                                className="text-[10px] block mt-0.5"
                                                style={{ color: "#94A3B8" }}
                                            >
                                                PNG, JPG tối đa 5MB
                                            </span>
                                        </div>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* View Mode */}
                    <div className="mb-6">
                        <label
                            className="text-sm font-medium mb-2.5 block"
                            style={{ color: "var(--muted)" }}
                        >
                            Chế độ hiển thị
                        </label>
                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={() => setViewMode("PRIVATE")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium cursor-pointer transition-all"
                                style={{
                                    borderRadius: "var(--radius-full)",
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
                                <Lock className="w-3.5 h-3.5" />
                                Private
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("PUBLIC")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium cursor-pointer transition-all"
                                style={{
                                    borderRadius: "var(--radius-full)",
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
                                <Globe className="w-3.5 h-3.5" />
                                Public
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="gradient-btn w-full flex items-center justify-center gap-2 py-3"
                        style={{
                            opacity: !name.trim() ? 0.5 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            "Tạo bộ sưu tập"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
