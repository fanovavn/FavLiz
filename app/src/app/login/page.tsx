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
        } catch {
            setError("Email hoặc mật khẩu không đúng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center px-4 py-8">
            {/* Orbs */}
            <div
                className="orb"
                style={{
                    width: 280,
                    height: 280,
                    background: "rgba(244, 143, 177, 0.6)",
                    top: "15%",
                    left: "5%",
                }}
            />
            <div
                className="orb"
                style={{
                    width: 200,
                    height: 200,
                    background: "rgba(233, 30, 99, 0.35)",
                    bottom: "15%",
                    right: "10%",
                    animationDelay: "2s",
                }}
            />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 mb-8"
                >
                    <Heart className="w-8 h-8 text-white fill-white" />
                    <span className="text-2xl font-bold text-white">FavLiz</span>
                </Link>

                {/* Card */}
                <div className="glass-card p-8">
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
                        Chào mừng trở lại
                    </h1>
                    <p className="text-gray-500 text-center mb-8 text-sm">
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
                                className="text-sm text-pink-500 hover:text-pink-600 font-medium"
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

                <p className="text-center text-white/70 text-sm mt-6">
                    Chưa có tài khoản?{" "}
                    <Link
                        href="/register"
                        className="text-white font-semibold hover:underline"
                    >
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
