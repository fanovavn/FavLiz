"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Type,
    FileText,
    Lock,
    Globe,
    Loader2,
    ImagePlus,
    Trash2,
} from "lucide-react";
import { createList, updateList } from "@/lib/list-actions";
import { getThumbnailColor, getInitials } from "@/lib/utils";

interface ListFormProps {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        name: string;
        description?: string | null;
        thumbnail?: string | null;
        viewMode: string;
    };
}

export function ListForm({ mode, initialData }: ListFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(
        initialData?.description || ""
    );
    const [thumbnail, setThumbnail] = useState<string | null>(
        initialData?.thumbnail || null
    );
    const [uploadingImage, setUploadingImage] = useState(false);
    const [viewMode, setViewMode] = useState<"PRIVATE" | "PUBLIC">(
        (initialData?.viewMode as "PRIVATE" | "PUBLIC") || "PRIVATE"
    );

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

    const removeThumbnail = () => {
        setThumbnail(null);
    };

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
                thumbnail: thumbnail || undefined,
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

    // Preview color for the default avatar
    const previewColor = name.trim()
        ? getThumbnailColor(name.trim())
        : "linear-gradient(135deg, #94A3B8, #CBD5E1)";
    const previewInitials = name.trim()
        ? getInitials(name.trim())
        : "FL";

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
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
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />

                {/* Thumbnail */}
                <div>
                    <label
                        className="flex items-center gap-2 text-sm font-medium mb-3"
                        style={{ color: "var(--muted)" }}
                    >
                        <ImagePlus className="w-4 h-4" />
                        Hình đại diện
                    </label>
                    <div className="flex items-center gap-5">
                        {/* Preview */}
                        {thumbnail ? (
                            <div
                                className="relative overflow-hidden group shrink-0"
                                style={{
                                    borderRadius: "var(--radius-lg)",
                                    border: "1px solid var(--card-border)",
                                    width: "100px",
                                    height: "100px",
                                }}
                            >
                                <img
                                    src={thumbnail}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                        background: "rgba(0,0,0,0.45)",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="w-8 h-8 flex items-center justify-center cursor-pointer"
                                        style={{
                                            borderRadius:
                                                "var(--radius-sm)",
                                            background:
                                                "rgba(255,255,255,0.9)",
                                            color: "#334155",
                                            border: "none",
                                        }}
                                    >
                                        <ImagePlus className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removeThumbnail}
                                        className="w-8 h-8 flex items-center justify-center cursor-pointer"
                                        style={{
                                            borderRadius:
                                                "var(--radius-sm)",
                                            background:
                                                "rgba(239, 68, 68, 0.9)",
                                            color: "#fff",
                                            border: "none",
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="shrink-0 flex items-center justify-center"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "var(--radius-lg)",
                                    background: previewColor,
                                }}
                            >
                                <span className="text-white font-bold text-xl">
                                    {previewInitials}
                                </span>
                            </div>
                        )}

                        {/* Upload button + hint */}
                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                disabled={uploadingImage}
                                className="text-sm font-medium flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all mb-2"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    background: "rgba(255,255,255,0.6)",
                                    color: "var(--muted)",
                                }}
                            >
                                {uploadingImage ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang upload...
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus className="w-4 h-4" />
                                        {thumbnail
                                            ? "Đổi hình"
                                            : "Tải hình lên"}
                                    </>
                                )}
                            </button>
                            <p
                                className="text-xs"
                                style={{ color: "var(--muted-light)" }}
                            >
                                Tối đa 5MB · JPG, PNG, WebP
                            </p>
                            {!thumbnail && (
                                <p
                                    className="text-xs mt-1"
                                    style={{
                                        color: "var(--muted-light)",
                                    }}
                                >
                                    Nếu bỏ trống, sẽ dùng hình mặc định
                                    giống ảnh item
                                </p>
                            )}
                        </div>
                    </div>
                </div>

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
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setViewMode("PRIVATE")}
                            className="flex flex-col items-center gap-1.5 py-4 text-sm font-medium cursor-pointer transition-all"
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
                            <Lock className="w-5 h-5" />
                            <span className="font-semibold">Private</span>
                            <span className="text-xs font-normal" style={{ color: "var(--muted-light)" }}>
                                Chỉ mình bạn thấy
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("PUBLIC")}
                            className="flex flex-col items-center gap-1.5 py-4 text-sm font-medium cursor-pointer transition-all"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border:
                                    viewMode === "PUBLIC"
                                        ? "1.5px solid var(--primary)"
                                        : "1.5px solid rgba(226,232,240,0.8)",
                                background:
                                    viewMode === "PUBLIC"
                                        ? "color-mix(in srgb, var(--primary) 6%, transparent)"
                                        : "rgba(255,255,255,0.4)",
                                color:
                                    viewMode === "PUBLIC"
                                        ? "var(--primary)"
                                        : "var(--muted-light)",
                            }}
                        >
                            <Globe className="w-5 h-5" />
                            <span className="font-semibold">Public</span>
                            <span className="text-xs font-normal" style={{ color: "var(--muted-light)" }}>
                                Mọi người có thể xem
                            </span>
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
