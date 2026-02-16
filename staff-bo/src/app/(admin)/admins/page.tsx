"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    ShieldCheck,
    Plus,
    Trash2,
    Power,
    X,
    Loader2,
    AlertCircle,
    User,
    Lock,
} from "lucide-react";
import { getAdmins, createAdmin, toggleAdminStatus, deleteAdmin, getAllRolesSimple } from "@/lib/admin-actions";

interface RoleInfo {
    id: string;
    name: string;
    slug: string;
}

interface AdminData {
    id: string;
    username: string;
    name: string | null;
    isRoot: boolean;
    isActive: boolean;
    createdAt: Date;
    createdBy: string | null;
    roles: { role: RoleInfo }[];
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState<AdminData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [newAdmin, setNewAdmin] = useState({ username: "", password: "", name: "" });
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        const data = await getAdmins();
        if (data.admins) setAdmins(data.admins as AdminData[]);
        setLoading(false);
    }, []);

    const fetchRoles = useCallback(async () => {
        const roles = await getAllRolesSimple();
        setAvailableRoles(roles as RoleInfo[]);
    }, []);

    useEffect(() => {
        fetchAdmins();
        fetchRoles();
    }, [fetchAdmins, fetchRoles]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!selectedRole) {
            setError("Vui lòng chọn vai trò");
            return;
        }
        setCreating(true);

        const result = await createAdmin({
            ...newAdmin,
            roleIds: [selectedRole],
        });
        if (result.success) {
            setShowCreate(false);
            setNewAdmin({ username: "", password: "", name: "" });
            setSelectedRole("");
            fetchAdmins();
        } else {
            setError(result.error || "Tạo thất bại");
        }
        setCreating(false);
    };

    const handleToggle = async (id: string) => {
        const result = await toggleAdminStatus(id);
        if (result.success) fetchAdmins();
        else alert(result.error);
    };

    const handleDelete = async (id: string, username: string) => {
        if (!confirm(`Bạn có chắc muốn xóa admin "${username}"?`)) return;
        const result = await deleteAdmin(id);
        if (result.success) fetchAdmins();
        else alert(result.error);
    };

    const selectRole = (roleId: string) => {
        setSelectedRole(roleId);
    };

    return (
        <div className="animate-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" style={{ color: "#6366F1" }} />
                        Quản trị viên
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                        Quản lý tài khoản admin
                    </p>
                </div>

                <button
                    className="btn-primary"
                    onClick={() => setShowCreate(true)}
                >
                    <Plus className="w-4 h-4" />
                    Tạo Admin mới
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
                        className="w-full max-w-md p-6 animate-in"
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
                                <ShieldCheck className="w-5 h-5" style={{ color: "#6366F1" }} />
                                Tạo Admin mới
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
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                    Họ tên
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                                    <input
                                        type="text"
                                        className="input-admin"
                                        style={{ paddingLeft: "44px" }}
                                        placeholder="Tên hiển thị..."
                                        value={newAdmin.name}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                                    <input
                                        type="text"
                                        className="input-admin"
                                        style={{ paddingLeft: "44px" }}
                                        placeholder="Tên đăng nhập..."
                                        value={newAdmin.username}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748B" }} />
                                    <input
                                        type="password"
                                        className="input-admin"
                                        style={{ paddingLeft: "44px" }}
                                        placeholder="Mật khẩu..."
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#94A3B8" }}>
                                    Vai trò
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles
                                        .filter((r) => r.slug !== "root-admin")
                                        .map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => selectRole(role.id)}
                                                className="cursor-pointer"
                                                style={{
                                                    padding: "6px 14px",
                                                    borderRadius: "var(--radius-md)",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    border: selectedRole === role.id
                                                        ? "1px solid #6366F1"
                                                        : "1px solid var(--color-border)",
                                                    background: selectedRole === role.id
                                                        ? "rgba(99, 102, 241, 0.15)"
                                                        : "transparent",
                                                    color: selectedRole === role.id ? "#818CF8" : "#94A3B8",
                                                    transition: "all 0.15s ease",
                                                }}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    className="btn-secondary flex-1"
                                    onClick={() => setShowCreate(false)}
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        "Tạo Admin"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Admin</th>
                                <th>Username</th>
                                <th>Vai trò</th>
                                <th>Status</th>
                                <th>Ngày tạo</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{
                                                        background: admin.isRoot
                                                            ? "linear-gradient(135deg, #DB2777, #EC4899)"
                                                            : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                                    }}
                                                >
                                                    {(admin.name || admin.username).charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-medium text-white">
                                                    {admin.name || "—"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="text-sm font-medium text-white">
                                            {admin.username}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {admin.isRoot && (
                                                    <span className="badge badge-accent">🔑 Root</span>
                                                )}
                                                {admin.roles.map((ur) => (
                                                    <span key={ur.role.id} className="badge badge-info">
                                                        {ur.role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${admin.isActive ? "badge-success" : "badge-danger"}`}>
                                                {admin.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="text-sm">
                                            {new Date(admin.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td>
                                            {!admin.isRoot && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggle(admin.id)}
                                                        className={`btn-${admin.isActive ? "danger" : "primary"} text-xs`}
                                                        style={{ padding: "6px 12px" }}
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin.id, admin.username)}
                                                        className="btn-danger text-xs"
                                                        style={{ padding: "6px 12px" }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
