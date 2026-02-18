"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "@/lib/auth-actions";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        try {
            const result = await signIn(email, password);
            if (result.error) {
                setError(result.error);
                return;
            }
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi kết nối. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
            style={{ background: "#F8FAFC" }}
        >
            {/* Animated Background */}
            <div className="landing-bg-gradient" />
            <div className="landing-grid-overlay" />

            {/* Floating Orbs */}
            <div className="landing-orb landing-orb-1" />
            <div className="landing-orb landing-orb-2" />
            <div className="landing-orb landing-orb-3" />

            <div className="relative z-10 w-full max-w-md auth-fade-in">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 mb-8 no-underline auth-slide-down"
                >
                    <Heart className="w-8 h-8 fill-pink-500" style={{ color: "#DB2777" }} />
                    <span className="text-2xl font-bold landing-gradient-text">FavLiz</span>
                </Link>

                {/* Card */}
                <div
                    className="p-8 rounded-[20px] auth-slide-up"
                    style={{
                        background: "rgba(255, 255, 255, 0.78)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.65)",
                        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06)",
                    }}
                >
                    <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#1E293B" }}>
                        Chào mừng trở lại
                    </h1>
                    <p className="text-center mb-8 text-sm" style={{ color: "#94A3B8" }}>
                        Đăng nhập để quản lý danh sách yêu thích
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                className="input-glass !pl-12"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-glass !pl-12 !pr-12"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <div className="text-right">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium"
                                style={{ color: "#DB2777" }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="gradient-btn w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Đăng nhập
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm mt-6 auth-slide-up" style={{ color: "#64748B", animationDelay: "200ms" }}>
                    Chưa có tài khoản?{" "}
                    <Link
                        href="/register"
                        className="font-semibold"
                        style={{ color: "#DB2777" }}
                    >
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
