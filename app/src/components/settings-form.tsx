"use client";

import { useState } from "react";
import { updateProfile, changePassword, updateThemeColor, updateItemsLabel, updateLanguage } from "@/lib/user-actions";
import { LOCALE_NAMES, LOCALE_FLAGS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import {
    User,
    AtSign,
    Loader2,
    Check,
    AlertCircle,
    Lock,
    Eye,
    EyeOff,
    Palette,
    RotateCcw,
    Bookmark,
    Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

interface SettingsFormProps {
    profile: {
        id: string;
        email: string;
        name: string | null;
        username: string | null;
        themeColor: string | null;
        itemsLabel: string | null;
        language: string | null;
    };
}

// ─── Preset color swatches ──────────────────────────────────
const PRESET_COLORS = [
    { name: "Hồng", hex: "#DB2777" },      // default
    { name: "Đỏ", hex: "#DC2626" },
    { name: "Cam", hex: "#EA580C" },
    { name: "Vàng", hex: "#D97706" },
    { name: "Xanh lá", hex: "#16A34A" },
    { name: "Ngọc", hex: "#0D9488" },
    { name: "Xanh dương", hex: "#2563EB" },
    { name: "Chàm", hex: "#4F46E5" },
    { name: "Tím", hex: "#7C3AED" },
    { name: "Tím hồng", hex: "#9333EA" },
    { name: "Xám", hex: "#475569" },
    { name: "Đen", hex: "#1E293B" },
];

const DEFAULT_PRIMARY = "#DB2777";

export function SettingsForm({ profile }: SettingsFormProps) {
    const router = useRouter();
    const { t } = useLanguage();

    // ─── Profile State ─────────────────────────────────────
    const [name, setName] = useState(profile.name || "");
    const [username, setUsername] = useState(profile.username || "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ─── Password State ────────────────────────────────────
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    // ─── Theme State ───────────────────────────────────────
    const [themeColor, setThemeColor] = useState(profile.themeColor || DEFAULT_PRIMARY);
    const [savingTheme, setSavingTheme] = useState(false);
    const [themeMessage, setThemeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ─── Items Label State ───────────────────────────────────
    const [itemsLabelVal, setItemsLabelVal] = useState(profile.itemsLabel || "");
    const [savingLabel, setSavingLabel] = useState(false);
    const [labelMessage, setLabelMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ─── Language State ─────────────────────────────────────
    const [language, setLanguageVal] = useState<Locale>((profile.language as Locale) || "vi");
    const [savingLanguage, setSavingLanguage] = useState(false);
    const [languageMessage, setLanguageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const usernameValid = username === "" || /^[a-z0-9._-]{3,30}$/.test(username);
    const previewUrl = username ? `favliz.com/${username}` : "";

    // ─── Profile Submit ────────────────────────────────────
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameValid) return;

        setSaving(true);
        setMessage(null);

        try {
            const result = await updateProfile({ username: username.trim(), name: name.trim() });
            if (result.error) {
                setMessage({ type: "error", text: result.error });
            } else {
                setMessage({ type: "success", text: t("settings.savedSuccess") });
            }
        } catch {
            setMessage({ type: "error", text: t("settings.saveError") });
        } finally {
            setSaving(false);
        }
    };

    // ─── Password Submit ───────────────────────────────────
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: t("settings.passwordMinLength") });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: t("settings.passwordMismatch") });
            return;
        }

        setChangingPassword(true);
        try {
            const result = await changePassword({ currentPassword, newPassword });
            if (result.error) {
                setPasswordMessage({ type: "error", text: result.error });
            } else {
                setPasswordMessage({ type: "success", text: t("settings.passwordChanged") });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setShowPassword(false);
            }
        } catch {
            setPasswordMessage({ type: "error", text: t("settings.saveError") });
        } finally {
            setChangingPassword(false);
        }
    };

    // ─── Theme Color Apply ─────────────────────────────────
    const applyColorLive = (hex: string) => {
        setThemeColor(hex);
        // Apply immediately to preview
        const root = document.documentElement;
        const hsl = hexToHSL(hex);
        const lightHex = hslToHex(hsl.h, Math.max(0, hsl.s - 10), Math.min(100, hsl.l + 18));
        const darkHex = hslToHex(hsl.h, Math.min(100, hsl.s + 5), Math.max(0, hsl.l - 12));
        root.style.setProperty("--primary", hex);
        root.style.setProperty("--primary-light", lightHex);
        root.style.setProperty("--primary-dark", darkHex);
    };

    const handleSaveTheme = async () => {
        setSavingTheme(true);
        setThemeMessage(null);
        try {
            const colorToSave = themeColor === DEFAULT_PRIMARY ? null : themeColor;
            await updateThemeColor(colorToSave);
            setThemeMessage({ type: "success", text: t("settings.themeSaved") });
            router.refresh();
        } catch {
            setThemeMessage({ type: "error", text: "Có lỗi xảy ra." });
        } finally {
            setSavingTheme(false);
        }
    };

    const handleResetTheme = async () => {
        applyColorLive(DEFAULT_PRIMARY);
        setSavingTheme(true);
        setThemeMessage(null);
        try {
            await updateThemeColor(null);
            setThemeMessage({ type: "success", text: "Đã reset về màu mặc định!" });
            router.refresh();
        } catch {
            setThemeMessage({ type: "error", text: "Có lỗi xảy ra." });
        } finally {
            setSavingTheme(false);
        }
    };

    // ─── Items Label Submit ──────────────────────────────────
    const handleSaveLabel = async () => {
        setSavingLabel(true);
        setLabelMessage(null);
        try {
            const result = await updateItemsLabel(itemsLabelVal.trim() || null);
            if (result.error) {
                setLabelMessage({ type: "error", text: result.error });
            } else {
                setLabelMessage({ type: "success", text: "Đã lưu tên mục!" });
                router.refresh();
            }
        } catch {
            setLabelMessage({ type: "error", text: "Có lỗi xảy ra." });
        } finally {
            setSavingLabel(false);
        }
    };

    const handleResetLabel = async () => {
        setSavingLabel(true);
        setLabelMessage(null);
        try {
            await updateItemsLabel(null);
            setItemsLabelVal("");
            setLabelMessage({ type: "success", text: "Đã reset về mặc định!" });
            router.refresh();
        } catch {
            setLabelMessage({ type: "error", text: "Có lỗi xảy ra." });
        } finally {
            setSavingLabel(false);
        }
    };

    const itemsLabelWords = itemsLabelVal.trim().split(/\s+/).filter(Boolean);
    const itemsLabelWordCount = itemsLabelVal.trim() ? itemsLabelWords.length : 0;
    const itemsLabelValid = itemsLabelWordCount <= 4 && itemsLabelWords.every(w => w.length <= 20);

    // ─── Render ────────────────────────────────────────────
    return (
        <div className="space-y-10">
            {/* ══════════════════════════════════════════════════
                SECTION 1: Profile Info
            ══════════════════════════════════════════════════ */}
            <form onSubmit={handleProfileSubmit}>
                <div
                    className="glass-card p-6 space-y-5"
                    style={{ border: "1px solid rgba(226,232,240,0.6)" }}
                >
                    <h2
                        className="text-base font-bold flex items-center gap-2 pb-3"
                        style={{
                            color: "#1E293B",
                            borderBottom: "1px solid rgba(226,232,240,0.5)",
                        }}
                    >
                        <User className="w-4 h-4" style={{ color: "var(--primary)" }} />
                        {t("settings.profileSection")}
                    </h2>

                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            📧 Email
                        </label>
                        <input
                            type="text"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-3 text-sm"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1.5px solid rgba(226,232,240,0.8)",
                                background: "rgba(241,245,249,0.5)",
                                color: "var(--muted-light)",
                            }}
                        />
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            <User className="w-4 h-4" />
                            {t("settings.nameLabel")}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Lisa"
                            className="w-full px-4 py-3 text-sm transition-all"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1.5px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.8)",
                                color: "#1E293B",
                                outline: "none",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "var(--primary-light)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(219,39,119,0.08)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "rgba(226,232,240,0.8)";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                            <AtSign className="w-4 h-4" />
                            {t("settings.usernameLabel")}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--muted-light)" }}>@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                                placeholder="lisa"
                                className="w-full pl-8 pr-4 py-3 text-sm transition-all"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: `1.5px solid ${!usernameValid ? "#EF4444" : "rgba(226,232,240,0.8)"}`,
                                    background: "rgba(255,255,255,0.8)",
                                    color: "#1E293B",
                                    outline: "none",
                                }}
                                onFocus={(e) => {
                                    if (usernameValid) {
                                        e.target.style.borderColor = "var(--primary-light)";
                                        e.target.style.boxShadow = "0 0 0 3px rgba(219,39,119,0.08)";
                                    }
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = !usernameValid ? "#EF4444" : "rgba(226,232,240,0.8)";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                        {!usernameValid && username && (
                            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#EF4444" }}>
                                <AlertCircle className="w-3 h-3" />
                                Chỉ chữ thường, số, dấu chấm, gạch ngang (3-30 ký tự)
                            </p>
                        )}
                        {previewUrl && usernameValid && (
                            <p className="text-xs mt-1.5" style={{ color: "var(--primary)" }}>
                                🔗 URL chia sẻ: <span className="font-medium">{previewUrl}</span>
                            </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "var(--muted-light)" }}>
                            Username dùng để tạo link chia sẻ SEO-friendly. Để trống nếu không cần.
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <MessageBanner type={message.type} text={message.text} />
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving || !usernameValid}
                        className="w-full py-3 text-sm font-semibold text-white transition-all cursor-pointer"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: saving || !usernameValid
                                ? "rgba(219,39,119,0.5)"
                                : "linear-gradient(135deg, var(--primary-dark), var(--primary))",
                            boxShadow: saving || !usernameValid ? "none" : "0 4px 15px rgba(219,39,119,0.3)",
                            border: "none",
                        }}
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("common.loading")}
                            </span>
                        ) : (
                            `💾 ${t("settings.saveProfile")}`
                        )}
                    </button>
                </div>
            </form>

            {/* ══════════════════════════════════════════════════
                SECTION 2: Change Password
            ══════════════════════════════════════════════════ */}
            <div
                className="glass-card p-6"
                style={{ border: "1px solid rgba(226,232,240,0.6)" }}
            >
                <h2
                    className="text-base font-bold flex items-center gap-2 pb-3 mb-5"
                    style={{
                        color: "#1E293B",
                        borderBottom: "1px solid rgba(226,232,240,0.5)",
                    }}
                >
                    <Lock className="w-4 h-4" style={{ color: "var(--primary)" }} />
                    {t("settings.passwordSection")}
                </h2>

                {!showPassword ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all cursor-pointer"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.8)",
                            border: "1.5px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                        }}
                    >
                        <Lock className="w-4 h-4" />
                        Đổi mật khẩu
                    </button>
                ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--muted)" }}>
                                Mật khẩu hiện tại
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPw ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-12 text-sm"
                                    style={{
                                        borderRadius: "var(--radius-md)",
                                        border: "1.5px solid rgba(226,232,240,0.8)",
                                        background: "rgba(255,255,255,0.8)",
                                        color: "#1E293B",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{ color: "var(--muted-light)" }}
                                >
                                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--muted)" }}>
                                Mật khẩu mới
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPw ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 pr-12 text-sm"
                                    style={{
                                        borderRadius: "var(--radius-md)",
                                        border: "1.5px solid rgba(226,232,240,0.8)",
                                        background: "rgba(255,255,255,0.8)",
                                        color: "#1E293B",
                                        outline: "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{ color: "var(--muted-light)" }}
                                >
                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs mt-1" style={{ color: "var(--muted-light)" }}>
                                Tối thiểu 6 ký tự
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--muted)" }}>
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 text-sm"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: `1.5px solid ${confirmPassword && confirmPassword !== newPassword ? "#EF4444" : "rgba(226,232,240,0.8)"}`,
                                    background: "rgba(255,255,255,0.8)",
                                    color: "#1E293B",
                                    outline: "none",
                                }}
                            />
                            {confirmPassword && confirmPassword !== newPassword && (
                                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                                    <AlertCircle className="w-3 h-3" />
                                    Mật khẩu xác nhận không khớp
                                </p>
                            )}
                        </div>

                        {passwordMessage && (
                            <MessageBanner type={passwordMessage.type} text={passwordMessage.text} />
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: changingPassword
                                        ? "rgba(219,39,119,0.5)"
                                        : "linear-gradient(135deg, var(--primary-dark), var(--primary))",
                                    border: "none",
                                    boxShadow: changingPassword ? "none" : "0 2px 8px rgba(219,39,119,0.2)",
                                }}
                            >
                                {changingPassword ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Đổi mật khẩu
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPassword(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setPasswordMessage(null);
                                }}
                                className="px-4 py-2.5 text-sm font-medium cursor-pointer transition-all"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: "transparent",
                                    border: "1.5px solid rgba(226,232,240,0.8)",
                                    color: "var(--muted)",
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* ══════════════════════════════════════════════════
                SECTION 3: Theme Color
            ══════════════════════════════════════════════════ */}
            <div
                className="glass-card p-6"
                style={{ border: "1px solid rgba(226,232,240,0.6)" }}
            >
                <h2
                    className="text-base font-bold flex items-center gap-2 pb-3 mb-5"
                    style={{
                        color: "#1E293B",
                        borderBottom: "1px solid rgba(226,232,240,0.5)",
                    }}
                >
                    <Palette className="w-4 h-4" style={{ color: "var(--primary)" }} />
                    Màu giao diện
                </h2>

                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                    Chọn màu chủ đạo cho giao diện của bạn. Màu này sẽ áp dụng cho toàn bộ ứng dụng và cả trang public.
                </p>

                {/* Preset Swatches */}
                <div className="flex flex-wrap gap-3 mb-5">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c.hex}
                            type="button"
                            onClick={() => applyColorLive(c.hex)}
                            className="group relative cursor-pointer transition-transform hover:scale-110"
                            title={c.name}
                            style={{ width: 40, height: 40 }}
                        >
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    background: c.hex,
                                    border: themeColor === c.hex
                                        ? "3px solid #1E293B"
                                        : "2px solid rgba(255,255,255,0.8)",
                                    boxShadow: themeColor === c.hex
                                        ? `0 0 0 2px ${c.hex}40, 0 2px 8px ${c.hex}30`
                                        : "0 1px 3px rgba(0,0,0,0.15)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {themeColor === c.hex && (
                                    <Check className="w-4 h-4 text-white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
                                )}
                            </div>
                            {/* Tooltip */}
                            <span
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                style={{ color: "var(--muted-light)" }}
                            >
                                {c.name}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Custom Color Picker */}
                <div className="flex items-center gap-4 mb-5">
                    <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                        Hoặc chọn màu tùy ý:
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={themeColor}
                            onChange={(e) => applyColorLive(e.target.value)}
                            className="w-10 h-10 cursor-pointer"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "2px solid rgba(226,232,240,0.8)",
                                padding: 2,
                                background: "white",
                            }}
                        />
                        <span
                            className="text-sm font-mono px-3 py-1.5"
                            style={{
                                borderRadius: "var(--radius-sm)",
                                background: "rgba(241,245,249,0.6)",
                                color: "#475569",
                                border: "1px solid rgba(226,232,240,0.5)",
                            }}
                        >
                            {themeColor.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Preview Bar */}
                <div
                    className="p-4 mb-5 flex items-center gap-3"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}18)`,
                        border: `1.5px solid ${themeColor}25`,
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: themeColor }}
                    >
                        <Palette className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: themeColor }}>
                            Xem trước giao diện
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-light)" }}>
                            Đây là cách giao diện sẽ hiển thị với màu bạn chọn
                        </p>
                    </div>
                </div>

                {themeMessage && (
                    <div className="mb-4">
                        <MessageBanner type={themeMessage.type} text={themeMessage.text} />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveTheme}
                        disabled={savingTheme}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: savingTheme
                                ? "rgba(219,39,119,0.5)"
                                : `linear-gradient(135deg, ${themeColor}, ${themeColor}CC)`,
                            border: "none",
                            boxShadow: savingTheme ? "none" : `0 2px 8px ${themeColor}40`,
                        }}
                    >
                        {savingTheme ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                {t("settings.saveTheme")}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleResetTheme}
                        disabled={savingTheme}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "transparent",
                            border: "1.5px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                        }}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset mặc định
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
               TÊN MỤC "ITEMS"
               ══════════════════════════════════════════════════ */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(100, 116, 139, 0.08)" }}
                    >
                        <Bookmark className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>
                            Tên mục Items
                        </h2>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                            Tùy chỉnh tên hiển thị thay cho &ldquo;Items&rdquo;
                        </p>
                    </div>
                </div>

                {labelMessage && <MessageBanner type={labelMessage.type} text={labelMessage.text} />}

                <div className="space-y-4">
                    <div>
                        <label
                            className="block text-sm font-medium mb-1.5"
                            style={{ color: "#334155" }}
                        >
                            Tên tùy chỉnh
                        </label>
                        <input
                            type="text"
                            className="input-glass w-full"
                            placeholder="Ví dụ: Món ăn, Phim, Sách..."
                            value={itemsLabelVal}
                            onChange={(e) => setItemsLabelVal(e.target.value)}
                            maxLength={80}
                        />
                        <div className="flex justify-between mt-1">
                            <p className="text-xs" style={{ color: itemsLabelValid ? "var(--muted-light)" : "#DC2626" }}>
                                {itemsLabelWordCount}/4 từ {!itemsLabelValid && "— Vượt giới hạn!"}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted-light)" }}>
                                Để trống = mặc định &ldquo;Items&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Preview */}
                    {itemsLabelVal.trim() && (
                        <div
                            className="p-3 rounded-xl"
                            style={{ background: "rgba(100, 116, 139, 0.04)", border: "1px solid rgba(226,232,240,0.6)" }}
                        >
                            <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>Xem trước:</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                    <span className="text-sm font-medium" style={{ color: "#334155" }}>{itemsLabelVal.trim()}</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(100,116,139,0.1)", color: "#475569" }}>Sidebar</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleSaveLabel}
                        disabled={savingLabel || !itemsLabelValid}
                        className="gradient-btn text-sm"
                    >
                        {savingLabel ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Lưu tên mục
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleResetLabel}
                        disabled={savingLabel}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "transparent",
                            border: "1.5px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                        }}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset mặc định
                    </button>
                </div>
            </div>

            {/* ── Language Section ─────────────────────────────── */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-1">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(37, 99, 235, 0.08)" }}
                    >
                        <Globe className="w-[18px] h-[18px]" style={{ color: "#2563EB" }} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold" style={{ color: "#1E293B" }}>
                            Ngôn ngữ giao diện
                        </h2>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                            Chọn ngôn ngữ hiển thị cho ứng dụng
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    {SUPPORTED_LOCALES.map((loc) => {
                        const isSelected = language === loc;
                        return (
                            <button
                                key={loc}
                                type="button"
                                disabled={savingLanguage}
                                onClick={async () => {
                                    if (loc === language) return;
                                    setSavingLanguage(true);
                                    setLanguageMessage(null);
                                    try {
                                        const result = await updateLanguage(loc);
                                        if (result.error) {
                                            setLanguageMessage({ type: "error", text: result.error });
                                        } else {
                                            setLanguageVal(loc);
                                            setLanguageMessage({ type: "success", text: "Đã thay đổi ngôn ngữ!" });
                                            router.refresh();
                                        }
                                    } catch {
                                        setLanguageMessage({ type: "error", text: "Có lỗi xảy ra." });
                                    } finally {
                                        setSavingLanguage(false);
                                    }
                                }}
                                className="relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all"
                                style={{
                                    border: isSelected
                                        ? "2px solid var(--primary)"
                                        : "2px solid rgba(226,232,240,0.6)",
                                    background: isSelected
                                        ? "rgba(var(--primary-rgb, 219, 39, 119), 0.04)"
                                        : "rgba(255,255,255,0.5)",
                                    boxShadow: isSelected
                                        ? "0 2px 8px rgba(var(--primary-rgb, 219, 39, 119), 0.15)"
                                        : "none",
                                }}
                            >
                                <span className="text-2xl">{LOCALE_FLAGS[loc]}</span>
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: isSelected ? "var(--primary)" : "#475569",
                                    }}
                                >
                                    {LOCALE_NAMES[loc]}
                                </span>
                                {isSelected && (
                                    <div
                                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{
                                            background: "var(--primary)",
                                        }}
                                    >
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {languageMessage && (
                    <div className="mt-4">
                        <MessageBanner type={languageMessage.type} text={languageMessage.text} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Reusable Message Banner ────────────────────────────────
function MessageBanner({ type, text }: { type: "success" | "error"; text: string }) {
    return (
        <div
            className="flex items-center gap-2 px-4 py-3 text-sm"
            style={{
                borderRadius: "var(--radius-md)",
                background: type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                color: type === "success" ? "#059669" : "#DC2626",
                border: `1px solid ${type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
        >
            {type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {text}
        </div>
    );
}

// ─── Color Utility Functions ────────────────────────────────
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
