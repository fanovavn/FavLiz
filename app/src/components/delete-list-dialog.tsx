"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteList } from "@/lib/list-actions";
import { useLanguage } from "@/components/language-provider";

interface DeleteListButtonProps {
    listId: string;
    listName: string;
}

export function DeleteListButton({ listId, listName }: DeleteListButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteList(listId);
            if (result.error) {
                alert(result.error);
                setLoading(false);
                return;
            }
            router.replace("/lists");
        } catch {
            alert("Có lỗi xảy ra khi xóa bộ sưu tập.");
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
                style={{
                    borderRadius: "var(--radius-full)",
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    color: "#fff",
                }}
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {open && (
                <div className="dialog-overlay" onClick={() => setOpen(false)}>
                    <div
                        className="glass-card p-8 max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-5">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{
                                    background: "rgba(239, 68, 68, 0.06)",
                                }}
                            >
                                <AlertTriangle
                                    className="w-7 h-7"
                                    style={{ color: "#EF4444" }}
                                />
                            </div>
                        </div>
                        <h3
                            className="text-lg font-bold text-center mb-2"
                            style={{ color: "#1E293B" }}
                        >
                            {t("delete.deleteList")}
                        </h3>
                        <p
                            className="text-sm text-center mb-6"
                            style={{ color: "var(--muted)" }}
                        >
                            {t("delete.deleteListDesc")}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 py-2.5 font-medium text-sm cursor-pointer transition-colors"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    color: "var(--muted)",
                                }}
                            >
                                {t("delete.cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 py-2.5 font-medium text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: "#EF4444",
                                    color: "white",
                                }}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                {loading ? t("delete.deleting") : t("delete.confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
