"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { login } from "@/lib/auth-actions";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            router.push("/dashboard");
        } else {
            setError(result.error || "Đăng nhập thất bại");
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background:
                    "radial-gradient(ellipse at top, #1E293B 0%, #0F172A 60%)",
            }}
        >
            <div className="w-full max-w-md animate-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background:
                                "linear-gradient(135deg, #DB2777, #EC4899)",
                            boxShadow: "0 8px 32px rgba(219, 39, 119, 0.3)",
                        }}
                    >
                        <Heart className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        FavLiz Admin
                    </h1>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                        Back-Office Administration Panel
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 text-sm"
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

                        {/* Username */}
                        <div>
                            <label
                                className="block text-xs font-semibold uppercase tracking-wide mb-2"
                                style={{ color: "#94A3B8" }}
                            >
                                Tài khoản
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: "#64748B" }}
                                />
                                <input
                                    type="text"
                                    className="input-admin"
                                    style={{ paddingLeft: "44px" }}
                                    placeholder="Nhập tài khoản..."
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className="block text-xs font-semibold uppercase tracking-wide mb-2"
                                style={{ color: "#94A3B8" }}
                            >
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: "#64748B" }}
                                />
                                <input
                                    type="password"
                                    className="input-admin"
                                    style={{ paddingLeft: "44px" }}
                                    placeholder="Nhập mật khẩu..."
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !username || !password}
                            className="btn-primary w-full py-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xác thực...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p
                    className="text-center text-xs mt-6"
                    style={{ color: "#475569" }}
                >
                    © 2026 FavLiz · Admin Panel v1.0
                </p>
            </div>
        </div>
    );
}
