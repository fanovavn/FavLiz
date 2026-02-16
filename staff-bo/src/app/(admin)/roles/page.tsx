"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    Shield,
    Plus,
    Trash2,
    X,
    Loader2,
    AlertCircle,
    Check,
    Settings2,
} from "lucide-react";
import { getRoles, createRole, updateRolePermissions, deleteRole, getAllPermissions } from "@/lib/admin-actions";
import { RESOURCES, ACTIONS, RESOURCE_LABELS, ACTION_LABELS, type Resource, type Action } from "@/lib/permissions";

interface PermissionData {
    id: string;
    resource: string;
    action: string;
    description: string | null;
}

interface RoleData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isSystem: boolean;
    createdAt: Date;
    permissions: { permission: PermissionData }[];
    _count: { users: number };
}

export default function RolesPage() {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [allPermissions, setAllPermissions] = useState<PermissionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [editingRole, setEditingRole] = useState<RoleData | null>(null);
    const [editPermIds, setEditPermIds] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);

    const [newRole, setNewRole] = useState({ name: "", slug: "", description: "" });
    const [newPermIds, setNewPermIds] = useState<Set<string>>(new Set());

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [rolesData, permsData] = await Promise.all([
            getRoles(),
            getAllPermissions(),
        ]);
        if (rolesData.roles) setRoles(rolesData.roles as RoleData[]);
        setAllPermissions(permsData as PermissionData[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPermIds.size === 0) {
            setError("Vui lòng chọn ít nhất một quyền");
            return;
        }
        setCreating(true);
        const result = await createRole({
            ...newRole,
            slug: newRole.slug || newRole.name.toLowerCase().replace(/\s+/g, "-"),
            permissionIds: Array.from(newPermIds),
        });
        if (result.success) {
            setShowCreate(false);
            setNewRole({ name: "", slug: "", description: "" });
            setNewPermIds(new Set());
            fetchData();
        } else {
            setError(result.error || "Tạo thất bại");
        }
        setCreating(false);
    };

    const startEdit = (role: RoleData) => {
        setEditingRole(role);
        setEditPermIds(new Set(role.permissions.map((rp) => rp.permission.id)));
    };

    const handleSavePermissions = async () => {
        if (!editingRole) return;
        setSaving(true);
        const result = await updateRolePermissions(editingRole.id, Array.from(editPermIds));
        if (result.success) {
            setEditingRole(null);
            fetchData();
        }
        setSaving(false);
    };

    const handleDeleteRole = async (roleId: string, roleName: string) => {
        if (!confirm(`Bạn có chắc muốn xóa role "${roleName}"?`)) return;
        const result = await deleteRole(roleId);
        if (result.success) fetchData();
        else alert(result.error);
    };

    const getPermId = (resource: string, action: string): string | undefined => {
        return allPermissions.find((p) => p.resource === resource && p.action === action)?.id;
    };

    const renderPermissionGrid = (
        permIds: Set<string>,
        togglePerm: (id: string) => void,
        readOnly = false
    ) => (
        <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ fontSize: "13px" }}>
                <thead>
                    <tr>
                        <th style={{ width: "160px" }}>Resource</th>
                        {ACTIONS.map((a) => (
                            <th key={a} className="text-center" style={{ width: "100px" }}>
                                {ACTION_LABELS[a]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {RESOURCES.map((resource) => (
                        <tr key={resource}>
                            <td className="font-medium text-white">
                                {RESOURCE_LABELS[resource]}
                            </td>
                            {ACTIONS.map((action) => {
                                const pid = getPermId(resource, action);
                                const checked = pid ? permIds.has(pid) : false;
                                return (
                                    <td key={action} className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => !readOnly && pid && togglePerm(pid)}
                                            className="cursor-pointer"
                                            disabled={readOnly}
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "6px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: checked
                                                    ? "1px solid #22C55E"
                                                    : "1px solid var(--color-border)",
                                                background: checked
                                                    ? "rgba(34, 197, 94, 0.12)"
                                                    : "transparent",
                                                color: checked ? "#22C55E" : "transparent",
                                                transition: "all 0.15s ease",
                                                opacity: readOnly ? 0.6 : 1,
                                            }}
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="animate-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-6 h-6" style={{ color: "#8B5CF6" }} />
                        Phân quyền
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Quản lý vai trò và quyền hạn
                    </p>
                </div>

                <button className="btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus className="w-4 h-4" />
                    Tạo vai trò mới
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
                >
                    <div
                        className="w-full max-w-2xl p-6 animate-in"
                        style={{
                            borderRadius: "var(--radius-xl)",
                            background: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                                Tạo vai trò mới
                            </h3>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="p-1 cursor-pointer"
                                style={{ color: "var(--color-text-muted)", background: "none", border: "none" }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 mb-4 text-sm"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: "rgba(239, 68, 68, 0.08)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "#EF4444",
                                }}
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                        Tên vai trò
                                    </label>
                                    <input
                                        type="text"
                                        className="input-admin"
                                        placeholder="VD: Editor"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        className="input-admin"
                                        placeholder="VD: editor"
                                        value={newRole.slug}
                                        onChange={(e) => setNewRole({ ...newRole, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                    Mô tả
                                </label>
                                <input
                                    type="text"
                                    className="input-admin"
                                    placeholder="Mô tả ngắn gọn..."
                                    value={newRole.description}
                                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#94A3B8" }}>
                                    Quyền hạn
                                </label>
                                {renderPermissionGrid(newPermIds, (id) => {
                                    setNewPermIds((prev) => {
                                        const next = new Set(prev);
                                        next.has(id) ? next.delete(id) : next.add(id);
                                        return next;
                                    });
                                })}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>
                                    Huỷ
                                </button>
                                <button type="submit" className="btn-primary flex-1" disabled={creating}>
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        "Tạo vai trò"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Permissions Modal */}
            {editingRole && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setEditingRole(null); }}
                >
                    <div
                        className="w-full max-w-2xl p-6 animate-in"
                        style={{
                            borderRadius: "var(--radius-xl)",
                            background: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Settings2 className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                                Chỉnh quyền: {editingRole.name}
                            </h3>
                            <button
                                onClick={() => setEditingRole(null)}
                                className="p-1 cursor-pointer"
                                style={{ color: "var(--color-text-muted)", background: "none", border: "none" }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {renderPermissionGrid(editPermIds, (id) => {
                            setEditPermIds((prev) => {
                                const next = new Set(prev);
                                next.has(id) ? next.delete(id) : next.add(id);
                                return next;
                            });
                        })}

                        <div className="flex gap-3 pt-4">
                            <button className="btn-secondary flex-1" onClick={() => setEditingRole(null)}>
                                Huỷ
                            </button>
                            <button
                                className="btn-primary flex-1"
                                onClick={handleSavePermissions}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    "Lưu thay đổi"
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Roles Cards */}
            {loading ? (
                <div className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                    Đang tải...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {roles.map((role) => (
                        <div key={role.id} className="glass-card p-5 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <Shield className="w-4 h-4" style={{ color: "#8B5CF6" }} />
                                        {role.name}
                                    </h3>
                                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                                        {role.description || "—"}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {role.isSystem && (
                                        <span className="badge badge-info text-xs">Hệ thống</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs" style={{ color: "#94A3B8" }}>
                                <span>🔑 {role.permissions.length} quyền</span>
                                <span>👤 {role._count.users} admin</span>
                            </div>

                            {/* Permission tags */}
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 6).map((rp) => (
                                    <span
                                        key={rp.permission.id}
                                        className="text-xs px-2 py-0.5"
                                        style={{
                                            borderRadius: "4px",
                                            background: "rgba(139, 92, 246, 0.1)",
                                            color: "#A78BFA",
                                        }}
                                    >
                                        {rp.permission.resource}.{rp.permission.action}
                                    </span>
                                ))}
                                {role.permissions.length > 6 && (
                                    <span className="text-xs px-2 py-0.5" style={{ color: "#64748B" }}>
                                        +{role.permissions.length - 6} more
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    className="btn-secondary text-xs flex-1"
                                    onClick={() => startEdit(role)}
                                >
                                    <Settings2 className="w-3.5 h-3.5" />
                                    Chỉnh quyền
                                </button>
                                {!role.isSystem && (
                                    <button
                                        className="btn-danger text-xs"
                                        style={{ padding: "6px 12px" }}
                                        onClick={() => handleDeleteRole(role.id, role.name)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
