"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { signUp, verifyOtp } from "@/lib/auth-actions";

type Step = "credentials" | "otp";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("credentials");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Vui lòng nhập email");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }

        setLoading(true);
        try {
            const result = await signUp(email, password);
            if (result.error) {
                setError(result.error);
                return;
            }
            setStep("otp");
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (otp.length !== 6) {
            setError("Mã OTP phải có 6 chữ số");
            return;
        }

        setLoading(true);
        try {
            const result = await verifyOtp(email, otp);
            if (result.error) {
                setError(result.error);
                return;
            }
            router.push("/dashboard");
        } catch {
            setError("Mã OTP không đúng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        credentials: {
            title: "Tạo tài khoản",
            subtitle: "Nhập email và mật khẩu để bắt đầu",
            handler: handleSignUp,
        },
        otp: {
            title: "Xác thực email",
            subtitle: `Chúng tôi đã gửi mã OTP đến ${email}`,
            handler: handleVerifyOTP,
        },
    };

    const currentStep = stepConfig[step];

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
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {(["credentials", "otp"] as Step[]).map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === s
                                        ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg"
                                        : (["credentials", "otp"] as Step[]).indexOf(step) >
                                            i
                                            ? "bg-pink-200 text-pink-700"
                                            : "bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    {i + 1}
                                </div>
                                {i < 1 && (
                                    <div
                                        className={`w-12 h-0.5 ${(["credentials", "otp"] as Step[]).indexOf(step) > i
                                            ? "bg-pink-300"
                                            : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-1" style={{ color: "#1E293B" }}>
                        {currentStep.title}
                    </h1>
                    <p className="text-center mb-6 text-sm" style={{ color: "#94A3B8" }}>
                        {currentStep.subtitle}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={currentStep.handler} className="space-y-4">
                        {step === "credentials" && (
                            <>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        className="input-glass !pl-12"
                                        placeholder="your@email.com"
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
                                        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        className="input-glass !pl-12 !pr-12"
                                        placeholder="Xác nhận mật khẩu"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === "otp" && (
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="input-glass !pl-12 text-center tracking-[0.5em] text-xl font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(e.target.value.replace(/\D/g, ""))
                                    }
                                    autoFocus
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="gradient-btn w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {step === "credentials" && "Đăng ký & Gửi mã OTP"}
                                    {step === "otp" && "Xác thực"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {step === "otp" && (
                        <button
                            onClick={() => setStep("credentials")}
                            className="w-full text-center text-sm mt-4 transition-colors"
                            style={{ color: "#64748B" }}
                        >
                            ← Quay lại
                        </button>
                    )}
                </div>

                <p className="text-center text-sm mt-6 auth-slide-up" style={{ color: "#64748B", animationDelay: "200ms" }}>
                    Đã có tài khoản?{" "}
                    <Link
                        href="/login"
                        className="font-semibold"
                        style={{ color: "#DB2777" }}
                    >
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
