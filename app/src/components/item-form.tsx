"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Type,
    FileText,
    Link2,
    Plus,
    X,
    Tags,
    FolderOpen,
    Lock,
    Globe,
    Loader2,
    ImagePlus,
    Trash2,
    Paperclip,
    Image as ImageIcon,
    Check,
} from "lucide-react";
import { createItem, updateItem } from "@/lib/item-actions";
import { createList } from "@/lib/list-actions";
import { useItemsLabel } from "@/components/items-label-provider";
import { useLanguage } from "@/components/language-provider";

interface ItemFormProps {
    mode: "create" | "edit";
    initialData?: {
        id: string;
        title: string;
        description?: string | null;
        thumbnail?: string | null;
        viewMode: string;
        tags: { id: string; name: string }[];
        lists: { id: string; name: string }[];
        attachments: { id: string; type: string; url: string }[];
    };
    availableLists: { id: string; name: string }[];
    availableTags: { id: string; name: string }[];
}

export function ItemForm({
    mode,
    initialData,
    availableLists,
    availableTags,
}: ItemFormProps) {
    const router = useRouter();
    const { singleItemLabel } = useItemsLabel();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState(initialData?.title || "");
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
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(
        initialData?.tags.map((t) => t.name) || []
    );
    const [selectedListIds, setSelectedListIds] = useState<string[]>(
        initialData?.lists.map((l) => l.id) || []
    );
    const [localLists, setLocalLists] = useState(availableLists);
    const [showCreateList, setShowCreateList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [creatingList, setCreatingList] = useState(false);
    const [attachments, setAttachments] = useState<
        { type: "LINK" | "IMAGE"; url: string }[]
    >(
        initialData?.attachments.map((a) => ({
            type: a.type as "LINK" | "IMAGE",
            url: a.url,
        })) || []
    );
    const [uploadingAttachmentImage, setUploadingAttachmentImage] =
        useState(false);
    const attachmentFileRef = useRef<HTMLInputElement>(null);

    const MAX_ATTACHMENTS = 10;
    const canAddMore = attachments.length < MAX_ATTACHMENTS;

    const addTag = (name: string) => {
        const trimmed = name.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput("");
    };

    const removeTag = (name: string) => {
        setTags(tags.filter((t) => t !== name));
    };

    const addLinkAttachment = () => {
        if (!canAddMore) return;
        setAttachments([...attachments, { type: "LINK", url: "" }]);
    };
    const updateAttachmentUrl = (i: number, url: string) => {
        const updated = [...attachments];
        updated[i] = { ...updated[i], url };
        setAttachments(updated);
    };
    const removeAttachment = (i: number) => {
        setAttachments(attachments.filter((_, idx) => idx !== i));
    };

    const handleAttachmentImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = MAX_ATTACHMENTS - attachments.length;
        const toUpload = Array.from(files).slice(0, Math.min(remaining, 3));

        if (toUpload.length === 0) {
            setError(`Đã đạt giới hạn ${MAX_ATTACHMENTS} đính kèm.`);
            return;
        }

        setUploadingAttachmentImage(true);
        setError("");

        try {
            const newAttachments: { type: "LINK" | "IMAGE"; url: string }[] = [];
            for (const file of toUpload) {
                if (file.size > 5 * 1024 * 1024) {
                    setError(`File "${file.name}" quá lớn. Tối đa 5MB.`);
                    continue;
                }
                if (
                    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
                        file.type
                    )
                ) {
                    setError(
                        `File "${file.name}" không hợp lệ. Chỉ JPEG, PNG, WebP, GIF.`
                    );
                    continue;
                }
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Upload thất bại.");
                    continue;
                }
                newAttachments.push({ type: "IMAGE", url: data.url });
            }
            if (newAttachments.length > 0) {
                setAttachments((prev) => [...prev, ...newAttachments]);
            }
        } catch {
            setError("Có lỗi xảy ra khi upload ảnh.");
        } finally {
            setUploadingAttachmentImage(false);
            if (attachmentFileRef.current) attachmentFileRef.current.value = "";
        }
    };

    const toggleList = (id: string) => {
        setSelectedListIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCreateList = async () => {
        const trimmed = newListName.trim();
        if (!trimmed) return;
        setCreatingList(true);
        try {
            const result = await createList({
                name: trimmed,
                viewMode: "PRIVATE",
            });
            const newList = { id: result.id, name: trimmed };
            setLocalLists((prev) => [...prev, newList]);
            setSelectedListIds((prev) => [...prev, result.id]);
            setNewListName("");
            setShowCreateList(false);
        } catch {
            setError("Không thể tạo bộ sưu tập.");
        } finally {
            setCreatingList(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        if (file.size > 5 * 1024 * 1024) {
            setError("File quá lớn. Tối đa 5MB.");
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            setError("Định dạng không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP, GIF.");
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
            // Reset the input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeThumbnail = () => {
        setThumbnail(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError(t("itemForm.nameRequired", { item: singleItemLabel }));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                thumbnail: thumbnail || undefined,
                viewMode,
                tagNames: tags,
                listIds: selectedListIds,
                attachments: attachments.filter((a) => a.url.trim()),
            };

            if (mode === "edit" && initialData) {
                const result = await updateItem({
                    ...payload,
                    id: initialData.id,
                });
                if ("error" in result && result.error) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }
                window.location.href = `/items/${initialData.id}`;
            } else {
                const result = await createItem(payload);
                window.location.href = `/items/${result.id}`;
            }
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
            setLoading(false);
        }
    };

    // Filter suggestions for tags
    const tagSuggestions = availableTags
        .filter(
            (t) =>
                !tags.includes(t.name) &&
                t.name.toLowerCase().includes(tagInput.toLowerCase())
        )
        .slice(0, 5);

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href={
                        mode === "edit" && initialData
                            ? `/items/${initialData.id}`
                            : "/items"
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
                    {mode === "create" ? t("itemForm.addTitle", { item: singleItemLabel }) : t("itemForm.editTitle", { item: singleItemLabel })}
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
                {/* Top section: Thumbnail + Title & Description side by side */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />

                <div
                    className="grid gap-5"
                    style={{
                        gridTemplateColumns: "1fr",
                    }}
                >
                    <style>{`
                        @media (min-width: 640px) {
                            .item-form-grid {
                                grid-template-columns: 200px 1fr !important;
                            }
                        }
                    `}</style>
                    <div
                        className="item-form-grid grid gap-5"
                        style={{
                            gridTemplateColumns: "1fr",
                        }}
                    >
                        {/* Thumbnail - Left column */}
                        <div className="flex flex-col">
                            <label
                                className="flex items-center gap-2 text-sm font-medium mb-2"
                                style={{ color: "var(--muted)" }}
                            >
                                <ImagePlus className="w-4 h-4" />
                                Thumbnail
                            </label>

                            {thumbnail ? (
                                <div
                                    className="relative overflow-hidden group flex-1"
                                    style={{
                                        borderRadius: "var(--radius-lg)",
                                        border: "1px solid var(--card-border)",
                                        minHeight: "160px",
                                    }}
                                >
                                    <img
                                        src={thumbnail}
                                        alt="Thumbnail preview"
                                        className="w-full h-full object-cover"
                                        style={{ minHeight: "160px" }}
                                    />
                                    <div
                                        className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ background: "rgba(0,0,0,0.4)" }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                            style={{
                                                borderRadius: "var(--radius-md)",
                                                background: "rgba(255,255,255,0.9)",
                                                color: "#334155",
                                            }}
                                        >
                                            <ImagePlus className="w-3.5 h-3.5" />
                                            Đổi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeThumbnail}
                                            className="px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                            style={{
                                                borderRadius: "var(--radius-md)",
                                                background: "rgba(239, 68, 68, 0.9)",
                                                color: "#fff",
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                                    style={{
                                        borderRadius: "var(--radius-lg)",
                                        border: "2px dashed rgba(148, 163, 184, 0.4)",
                                        background: "rgba(100, 116, 139, 0.02)",
                                        color: "var(--muted)",
                                        minHeight: "160px",
                                    }}
                                >
                                    {uploadingImage ? (
                                        <>
                                            <Loader2
                                                className="w-6 h-6 animate-spin"
                                                style={{ color: "var(--primary)" }}
                                            />
                                            <span className="text-xs">Đang upload...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{
                                                    background: "rgba(100, 116, 139, 0.06)",
                                                }}
                                            >
                                                <ImagePlus
                                                    className="w-5 h-5"
                                                    style={{ color: "#64748B" }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-medium" style={{ color: "#475569" }}>
                                                    Chọn / Chụp ảnh
                                                </p>
                                                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-light)" }}>
                                                    Tối đa 5MB
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Right column: Title + Description */}
                        <div className="flex flex-col gap-4">
                            {/* Title */}
                            <div>
                                <label
                                    className="flex items-center gap-2 text-sm font-medium mb-2"
                                    style={{ color: "var(--muted)" }}
                                >
                                    <Type className="w-4 h-4" />
                                    {t("itemForm.nameLabel", { item: singleItemLabel })}{" "}
                                    <span style={{ color: "var(--primary)" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    placeholder={t("itemForm.namePlaceholder")}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div className="flex-1 flex flex-col">
                                <label
                                    className="flex items-center gap-2 text-sm font-medium mb-2"
                                    style={{ color: "var(--muted)" }}
                                >
                                    <FileText className="w-4 h-4" />
                                    {t("itemForm.descLabel")}
                                </label>
                                <textarea
                                    className="textarea-glass flex-1"
                                    placeholder={t("itemForm.descPlaceholder", { item: singleItemLabel })}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    style={{ minHeight: "80px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Đính kèm */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label
                            className="flex items-center gap-2 text-sm font-medium"
                            style={{ color: "var(--muted)" }}
                        >
                            <Paperclip className="w-4 h-4" />
                            {t("itemForm.attachments")}
                        </label>
                        <span
                            className="text-xs font-medium px-2 py-0.5"
                            style={{
                                borderRadius: "var(--radius-sm)",
                                background: attachments.length >= MAX_ATTACHMENTS
                                    ? "rgba(239, 68, 68, 0.08)"
                                    : "rgba(100, 116, 139, 0.08)",
                                color: attachments.length >= MAX_ATTACHMENTS
                                    ? "#EF4444"
                                    : "var(--muted-light)",
                            }}
                        >
                            {attachments.length}/{MAX_ATTACHMENTS}
                        </span>
                    </div>

                    {/* Hidden file input for attachment images */}
                    <input
                        ref={attachmentFileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentImageUpload}
                    />

                    {/* Attachment list */}
                    {attachments.length > 0 && (
                        <div className="space-y-2 mb-3">
                            {attachments.map((att, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    {att.type === "LINK" ? (
                                        <>
                                            <div
                                                className="w-9 h-9 shrink-0 flex items-center justify-center"
                                                style={{
                                                    borderRadius: "var(--radius-md)",
                                                    background: "rgba(59, 130, 246, 0.06)",
                                                    color: "#3B82F6",
                                                }}
                                            >
                                                <Link2 className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="url"
                                                className="input-glass flex-1"
                                                placeholder="https://youtube.com/watch?v=..."
                                                value={att.url}
                                                onChange={(e) =>
                                                    updateAttachmentUrl(
                                                        i,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="w-9 h-9 shrink-0 overflow-hidden"
                                                style={{
                                                    borderRadius: "var(--radius-md)",
                                                    border: "1px solid var(--card-border)",
                                                }}
                                            >
                                                <img
                                                    src={att.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span
                                                className="text-sm truncate flex-1"
                                                style={{ color: "var(--muted)" }}
                                            >
                                                {att.url.split("/").pop()}
                                            </span>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(i)}
                                        className="w-9 h-9 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            border: "1px solid rgba(239, 68, 68, 0.15)",
                                            color: "#EF4444",
                                        }}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add buttons */}
                    {canAddMore && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={addLinkAttachment}
                                className="text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                style={{ color: "var(--primary)" }}
                            >
                                <Plus className="w-3 h-3" />
                                <Link2 className="w-3.5 h-3.5" />
                                Thêm link
                            </button>
                            <span
                                className="text-xs"
                                style={{ color: "var(--muted-light)" }}
                            >
                                •
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    attachmentFileRef.current?.click()
                                }
                                disabled={uploadingAttachmentImage}
                                className="text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                style={{ color: "var(--primary)" }}
                            >
                                {uploadingAttachmentImage ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Đang upload...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3 h-3" />
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Thêm ảnh
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div>
                    <label
                        className="flex items-center gap-2 text-sm font-medium mb-2"
                        style={{ color: "var(--muted)" }}
                    >
                        <Tags className="w-4 h-4" />
                        Tags
                    </label>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span key={tag} className="tag-chip">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="Nhập tag rồi Enter..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addTag(tagInput);
                                }
                            }}
                        />
                        {tagInput && tagSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 glass-card p-2 z-20 space-y-0.5">
                                {tagSuggestions.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors"
                                        style={{
                                            borderRadius: "var(--radius-sm)",
                                            color: "var(--muted)",
                                        }}
                                        onClick={() => addTag(t.name)}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lists */}
                <div>
                    <label
                        className="flex items-center gap-2 text-sm font-medium mb-2"
                        style={{ color: "var(--muted)" }}
                    >
                        <FolderOpen className="w-4 h-4" />
                        Bộ sưu tập
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {localLists.map((list) => (
                            <button
                                key={list.id}
                                type="button"
                                onClick={() => toggleList(list.id)}
                                className="px-4 py-2 text-sm font-medium cursor-pointer transition-all flex items-center gap-1.5"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: selectedListIds.includes(list.id)
                                        ? "1.5px solid rgba(100, 116, 139, 0.5)"
                                        : "1.5px solid rgba(226,232,240,0.8)",
                                    background: selectedListIds.includes(list.id)
                                        ? "rgba(100, 116, 139, 0.06)"
                                        : "rgba(255,255,255,0.6)",
                                    color: selectedListIds.includes(list.id)
                                        ? "#334155"
                                        : "var(--muted)",
                                }}
                            >
                                {selectedListIds.includes(list.id) && (
                                    <Check className="w-3.5 h-3.5" />
                                )}
                                {list.name}
                            </button>
                        ))}
                        {/* Add new list button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateList(true)}
                            className="px-3 py-2 text-sm font-medium cursor-pointer transition-all flex items-center gap-1"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1.5px dashed color-mix(in srgb, var(--primary) 35%, transparent)",
                                background: "color-mix(in srgb, var(--primary) 5%, transparent)",
                                color: "var(--primary)",
                            }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Tạo mới
                        </button>
                    </div>

                    {/* Create list popup */}
                    {showCreateList && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.4)" }}
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setShowCreateList(false);
                            }}
                        >
                            <div
                                className="w-full max-w-sm p-6"
                                style={{
                                    borderRadius: "var(--radius-lg)",
                                    background: "rgba(255,255,255,0.95)",
                                    backdropFilter: "blur(20px)",
                                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                                    border: "1px solid rgba(255,255,255,0.5)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3
                                        className="text-base font-bold flex items-center gap-2"
                                        style={{ color: "#1E293B" }}
                                    >
                                        <FolderOpen className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                        Tạo bộ sưu tập mới
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateList(false)}
                                        className="cursor-pointer p-1 transition-colors"
                                        style={{ color: "var(--muted-light)" }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="input-glass mb-4"
                                    placeholder="Tên bộ sưu tập..."
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCreateList();
                                        }
                                    }}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateList(false)}
                                        className="flex-1 py-2.5 text-sm font-medium cursor-pointer transition-all"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            border: "1px solid rgba(226,232,240,0.8)",
                                            background: "rgba(255,255,255,0.6)",
                                            color: "var(--muted)",
                                        }}
                                    >
                                        Huỷ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateList}
                                        disabled={creatingList || !newListName.trim()}
                                        className="flex-1 py-2.5 text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                                            color: "#fff",
                                            opacity: creatingList || !newListName.trim() ? 0.5 : 1,
                                        }}
                                    >
                                        {creatingList ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            "Tạo & gán"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* View Mode */}
                <div>
                    <label
                        className="text-sm font-medium mb-3 block"
                        style={{ color: "var(--muted)" }}
                    >
                        {t("itemForm.visibility")}
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
                            {t("common.private")}
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
                            {t("common.public")}
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
                            {t("itemForm.saving")}
                        </>
                    ) : mode === "create" ? (
                        t("itemForm.saveItem", { item: singleItemLabel })
                    ) : (
                        t("itemForm.updateItem", { item: singleItemLabel })
                    )}
                </button>
            </form>
        </div>
    );
}
