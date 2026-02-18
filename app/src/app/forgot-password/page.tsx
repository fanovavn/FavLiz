"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Heart,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    KeyRound,
    CheckCircle2,
    ArrowLeft,
} from "lucide-react";
import {
    requestPasswordReset,
    verifyRecoveryOtp,
    updatePassword,
} from "@/lib/auth-actions";

type Step = "email" | "otp" | "password";
const STEPS: Step[] = ["email", "otp", "password"];

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    /* ── Step 1: Request OTP ───────────────────── */
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Vui lòng nhập email");
            return;
        }

        setLoading(true);
        try {
            const result = await requestPasswordReset(email);
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

    /* ── Step 2: Verify OTP ────────────────────── */
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (otp.length !== 6) {
            setError("Mã OTP phải có 6 chữ số");
            return;
        }

        setLoading(true);
        try {
            const result = await verifyRecoveryOtp(email, otp);
            if (result.error) {
                setError(result.error);
                return;
            }
            setStep("password");
        } catch {
            setError("Mã OTP không đúng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 3: Set new password ──────────────── */
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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
            const result = await updatePassword(password);
            if (result.error) {
                setError(result.error);
                return;
            }
            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        email: {
            title: "Quên mật khẩu",
            subtitle: "Nhập email đã đăng ký để nhận mã OTP",
            handler: handleRequestOtp,
        },
        otp: {
            title: "Xác thực email",
            subtitle: `Nhập mã OTP đã gửi đến ${email}`,
            handler: handleVerifyOtp,
        },
        password: {
            title: "Mật khẩu mới",
            subtitle: "Thiết lập mật khẩu mới cho tài khoản",
            handler: handleUpdatePassword,
        },
    };

    const currentStep = stepConfig[step];
    const currentStepIndex = STEPS.indexOf(step);

    /* ── Success screen ────────────────────────── */
    if (success) {
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
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: "#1E293B" }}>
                            Đổi mật khẩu thành công!
                        </h2>
                        <p className="text-sm" style={{ color: "#94A3B8" }}>
                            Đang chuyển hướng đến trang đăng nhập...
                        </p>
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
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === s
                                            ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg"
                                            : currentStepIndex > i
                                                ? "bg-pink-200 text-pink-700"
                                                : "bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    {currentStepIndex > i ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={`w-10 h-0.5 transition-colors ${currentStepIndex > i ? "bg-pink-300" : "bg-gray-200"
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
                        {/* Step 1: Email */}
                        {step === "email" && (
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    className="input-glass !pl-12"
                                    placeholder="Email đã đăng ký"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Step 2: OTP */}
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

                        {/* Step 3: New Password */}
                        {step === "password" && (
                            <>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-glass !pl-12 !pr-12"
                                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
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
                                        placeholder="Xác nhận mật khẩu mới"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="gradient-btn w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {step === "email" && "Gửi mã OTP"}
                                    {step === "otp" && "Xác thực"}
                                    {step === "password" && "Đổi mật khẩu"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back button for steps 2 & 3 */}
                    {step !== "email" && (
                        <button
                            onClick={() => {
                                setError("");
                                setStep(step === "otp" ? "email" : "otp");
                            }}
                            className="w-full flex items-center justify-center gap-1 text-center text-sm mt-4 transition-colors"
                            style={{ color: "#64748B" }}
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Quay lại
                        </button>
                    )}
                </div>

                <p
                    className="text-center text-sm mt-6 auth-slide-up"
                    style={{ color: "#64748B", animationDelay: "200ms" }}
                >
                    Nhớ mật khẩu rồi?{" "}
                    <Link href="/login" className="font-semibold" style={{ color: "#DB2777" }}>
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
