"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Mail,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-actions";
import { useAuthLocale } from "@/hooks/use-auth-locale";
import { LandingLanguageSwitcher } from "@/components/landing-language-switcher";

export default function ForgotPasswordPage() {
    const { locale, t } = useAuthLocale();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError(t.errEnterEmail);
            return;
        }

        setLoading(true);
        try {
            const result = await requestPasswordReset(email);
            if (result.error) {
                setError(result.error);
                return;
            }
            setSent(true);
        } catch {
            setError(t.errGeneral);
        } finally {
            setLoading(false);
        }
    };

    /* ── Email sent confirmation ──────────────── */
    if (sent) {
        return (
            <div
                className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
                style={{ background: "#F8FAFC" }}
            >
                <div className="landing-bg-gradient" />
                <div className="landing-grid-overlay" />
                <div className="landing-orb landing-orb-1" />
                <div className="landing-orb landing-orb-2" />

                <div className="relative z-10 w-full max-w-md auth-fade-in text-center">
                    <div
                        className="p-10 rounded-[20px] auth-slide-up"
                        style={{
                            background: "rgba(255, 255, 255, 0.78)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.65)",
                            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06)",
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: "linear-gradient(135deg, #DB2777, #EC4899)" }}
                        >
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "#1E293B" }}>
                            {t.fpSentTitle}
                        </h2>
                        <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>
                            {t.fpSentSubtitle}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: "#DB2777" }}>
                            {email}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-6 auth-slide-up" style={{ animationDelay: "200ms" }}>
                        <p className="text-sm" style={{ color: "#64748B" }}>
                            {t.fpRemember}{" "}
                            <Link href="/login" className="font-semibold" style={{ color: "#DB2777" }}>
                                {t.loginLink}
                            </Link>
                        </p>
                        <LandingLanguageSwitcher currentLocale={locale} dropUp />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8"
            style={{ background: "#F8FAFC" }}
        >
            {/* Background */}
            <div className="landing-bg-gradient" />
            <div className="landing-grid-overlay" />
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
                        {t.fpTitle}
                    </h1>
                    <p className="text-center mb-6 text-sm" style={{ color: "#94A3B8" }}>
                        {t.fpSubtitle}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                className="input-glass !pl-12"
                                placeholder={t.fpEmailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
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
                                    {t.fpSendLink}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 auth-slide-up" style={{ animationDelay: "200ms" }}>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                        {t.fpRemember}{" "}
                        <Link href="/login" className="font-semibold" style={{ color: "#DB2777" }}>
                            {t.loginLink}
                        </Link>
                    </p>
                    <LandingLanguageSwitcher currentLocale={locale} dropUp />
                </div>
            </div>
        </div>
    );
}
