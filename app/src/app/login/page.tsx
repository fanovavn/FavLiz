"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "@/lib/auth-actions";
import { useAuthLocale } from "@/hooks/use-auth-locale";
import { LandingLanguageSwitcher } from "@/components/landing-language-switcher";

export default function LoginPage() {
    const router = useRouter();
    const { locale, t } = useAuthLocale();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError(t.errFillAll);
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
            setError(err instanceof Error ? err.message : t.errConnection);
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
                    className="flex items-center justify-center mb-8 no-underline auth-slide-down"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.png"
                        alt="FavLiz"
                        style={{ height: "36px", width: "auto" }}
                    />
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
                        {t.loginTitle}
                    </h1>
                    <p className="text-center mb-8 text-sm" style={{ color: "#94A3B8" }}>
                        {t.loginSubtitle}
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
                                placeholder={t.emailPlaceholder}
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
                                placeholder={t.passwordPlaceholder}
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
                                {t.forgotPassword}
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
                                    {t.loginButton}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 auth-slide-up" style={{ animationDelay: "200ms" }}>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                        {t.noAccount}{" "}
                        <Link
                            href="/register"
                            className="font-semibold"
                            style={{ color: "#DB2777" }}
                        >
                            {t.registerLink}
                        </Link>
                    </p>
                    <LandingLanguageSwitcher currentLocale={locale} dropUp />
                </div>
            </div>
        </div>
    );
}
