"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { completeOnboarding } from "@/lib/user-actions";

import vi from "@/lib/i18n/vi.json";
import en from "@/lib/i18n/en.json";
import zh from "@/lib/i18n/zh.json";
import ru from "@/lib/i18n/ru.json";

/* ─── Color presets (match design) ─────────────────────────── */
const PRESET_COLORS = [
    { name: "Rose", hex: "#DB2777" },
    { name: "Sky Blue", hex: "#3b82f6" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Indigo", hex: "#6366f1" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Orange", hex: "#f97316" },
    { name: "Cyan", hex: "#06b6d4" },
];

/* ─── Step images ──────────────────────────────────────────── */
const STEP_IMAGES = [
    "/onboarding/step-1.png",
    "/onboarding/step-2.png",
    "/onboarding/step-3.png",
    "/onboarding/step-4.png",
    "/onboarding/step-5.png",
];

/* ─── Step icons (emoji for badge) ─────────────────────────── */
const STEP_ICONS = ["💚", "👤", "📦", "🎨", "🎉"];

const TOTAL_STEPS = 5;

/* ─── Locale chips map ─────────────────────────────────────── */
const LOCALE_CHIPS: Record<string, string[]> = {
    vi: vi.onboarding.step3Chips,
    en: en.onboarding.step3Chips,
    zh: zh.onboarding.step3Chips,
    ru: ru.onboarding.step3Chips,
};

export function OnboardingPopup() {
    const { t, locale } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [itemsLabel, setItemsLabel] = useState("");
    const [selectedChip, setSelectedChip] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState<string | null>(null);
    const [customColor, setCustomColor] = useState("#DB2777");
    const [showCustom, setShowCustom] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Get chips from i18n locale map
    const chips = LOCALE_CHIPS[locale] || LOCALE_CHIPS.vi;

    // Can user proceed to next step?
    const canContinue =
        step === 1 ||
        step === TOTAL_STEPS ||
        (step === 2 && name.trim().length > 0) ||
        (step === 3 && itemsLabel.trim().length > 0) ||
        (step === 4 && themeColor !== null);

    const handleNext = () => {
        if (step < TOTAL_STEPS && canContinue) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChipSelect = (chip: string) => {
        if (selectedChip === chip) {
            setSelectedChip(null);
            setItemsLabel("");
        } else {
            setSelectedChip(chip);
            setItemsLabel(chip);
        }
    };

    const handleFinish = () => {
        startTransition(async () => {
            await completeOnboarding({
                name: name || undefined,
                itemsLabel: itemsLabel || undefined,
                themeColor: themeColor || undefined,
            });
            router.refresh();
        });
    };

    return (
        <>
            {/* Overlay */}
            <div className="onboarding-overlay">
                {/* Card */}
                <div className="onboarding-card">
                    {/* Image section */}
                    <div className="onboarding-image-section">
                        <Image
                            src={STEP_IMAGES[step - 1]}
                            alt={`Step ${step}`}
                            fill
                            style={{ objectFit: "cover" }}
                            priority
                        />
                        {/* Step badge */}
                        <div className="onboarding-step-badge">
                            <span>{STEP_ICONS[step - 1]}</span>
                            {t("onboarding.step", { current: step, total: TOTAL_STEPS })}
                        </div>
                    </div>

                    {/* Content section */}
                    <div className="onboarding-content">
                        {renderStepContent()}
                    </div>

                    {/* Progress + Navigation */}
                    <div className="onboarding-footer">
                        {/* Progress dots */}
                        <div className="onboarding-progress">
                            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`onboarding-dot ${i + 1 <= step ? "active" : ""} ${i + 1 === step ? "current" : ""}`}
                                />
                            ))}
                            <span className="onboarding-step-counter">
                                {step}/{TOTAL_STEPS}
                            </span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="onboarding-nav">
                            <div>
                                {step > 1 && (
                                    <button onClick={handleBack} className="onboarding-back-btn">
                                        ‹ {t("onboarding.back")}
                                    </button>
                                )}
                            </div>
                            <div className="onboarding-nav-right">
                                {step === 1 ? (
                                    <button onClick={handleNext} className="gradient-btn">
                                        {t("onboarding.step1Button")} ›
                                    </button>
                                ) : step === TOTAL_STEPS ? (
                                    <button
                                        onClick={handleFinish}
                                        disabled={isPending}
                                        className="gradient-btn"
                                    >
                                        {isPending ? "..." : t("onboarding.step5Button")}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        disabled={!canContinue}
                                        className={`gradient-btn ${!canContinue ? "disabled" : ""}`}
                                    >
                                        {t("onboarding.next")} ›
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scoped styles */}
            <style jsx global>{`
                .onboarding-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    padding: 20px;
                    animation: onb-fadeIn 0.3s ease;
                }

                .onboarding-card {
                    width: 100%;
                    max-width: 480px;
                    background: #fff;
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
                    animation: onb-popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .onboarding-image-section {
                    position: relative;
                    height: 220px;
                    overflow: hidden;
                }

                .onboarding-step-badge {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #fff;
                    border-radius: var(--radius-pill);
                    padding: 6px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #444;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                    z-index: 2;
                }

                .onboarding-content {
                    padding: 24px 28px 16px;
                }

                .onboarding-footer {
                    padding: 0 28px 24px;
                }

                .onboarding-progress {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .onboarding-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 4px;
                    background: #e5e7eb;
                    transition: all 0.3s;
                }

                .onboarding-dot.active {
                    background: var(--primary);
                }

                .onboarding-dot.current {
                    width: 28px;
                }

                .onboarding-step-counter {
                    margin-left: 8px;
                    font-size: 13px;
                    color: var(--muted-light);
                }

                .onboarding-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .onboarding-nav-right {
                    display: flex;
                    gap: 10px;
                }

                .onboarding-back-btn {
                    background: none;
                    border: none;
                    color: var(--muted);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 0;
                }

                .onboarding-back-btn:hover {
                    color: var(--foreground);
                }

                .gradient-btn.disabled {
                    background: #d1d5db !important;
                    cursor: not-allowed !important;
                    opacity: 0.7 !important;
                    box-shadow: none !important;
                    filter: none !important;
                }

                .gradient-btn.disabled:hover {
                    box-shadow: none !important;
                    filter: none !important;
                }

                /* ── Step content styles ──────────────────── */
                .onb-label {
                    font-size: 13px;
                    color: var(--primary);
                    font-weight: 600;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .onb-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--foreground);
                    margin-bottom: 6px;
                    line-height: 1.3;
                }

                .onb-desc {
                    font-size: 14px;
                    color: var(--muted);
                    line-height: 1.6;
                    margin-bottom: 16px;
                }

                .onb-input-wrap {
                    position: relative;
                }

                .onb-input {
                    width: 100%;
                    padding: 12px 40px 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: var(--radius-md);
                    font-size: 15px;
                    color: var(--foreground);
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                    font-family: inherit;
                }

                .onb-input:focus {
                    border-color: var(--primary);
                }

                .onb-input.has-value {
                    border-color: var(--primary);
                }

                .onb-input-check {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--primary);
                    font-size: 18px;
                }

                .onb-preview-text {
                    font-size: 13px;
                    color: var(--primary);
                    margin-top: 10px;
                    font-weight: 500;
                }

                .onb-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }

                .onb-chip {
                    padding: 6px 16px;
                    border-radius: var(--radius-pill);
                    border: 1.5px solid #e5e7eb;
                    background: #fff;
                    color: #374151;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .onb-chip.selected {
                    border-color: var(--primary);
                    background: var(--primary);
                    color: #fff;
                }

                .onb-chip:hover:not(.selected) {
                    border-color: var(--primary-light);
                    background: color-mix(in srgb, var(--primary) 6%, transparent);
                }

                .onb-preview-box {
                    margin-top: 16px;
                    padding: 12px 16px;
                    background: #f9fafb;
                    border-radius: var(--radius-md);
                    border: 1px solid #f3f4f6;
                }

                .onb-preview-label {
                    font-size: 11px;
                    color: var(--muted-light);
                    margin-bottom: 6px;
                }

                .onb-preview-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .onb-preview-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 16px;
                }

                .onb-preview-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--foreground);
                }

                .onb-preview-count {
                    font-size: 12px;
                    color: var(--muted-light);
                }

                /* ── Color grid ───────────────────────────── */
                .onb-color-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .onb-color-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .onb-color-swatch {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                    transform: scale(0.9);
                }

                .onb-color-swatch.selected {
                    transform: scale(1);
                }

                .onb-color-name {
                    font-size: 11px;
                    color: var(--muted-light);
                    font-weight: 400;
                }

                .onb-color-name.selected {
                    font-weight: 600;
                }

                .onb-custom-toggle {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 13px;
                    color: var(--muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0;
                }

                .onb-custom-toggle:hover {
                    color: var(--primary);
                }

                .onb-custom-panel {
                    margin-top: 12px;
                    padding: 14px 16px;
                    background: #f9fafb;
                    border-radius: var(--radius-md);
                    border: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .onb-custom-picker {
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    padding: 0;
                }

                .onb-custom-hex-input {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 13px;
                    color: var(--foreground);
                    width: 90px;
                    margin-top: 4px;
                }

                .onb-custom-preview {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    margin-left: auto;
                }

                /* ── Summary (Step 5) ─────────────────────── */
                .onb-summary {
                    text-align: center;
                }

                .onb-summary-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: color-mix(in srgb, var(--primary) 10%, transparent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    font-size: 28px;
                }

                .onb-summary-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--foreground);
                    margin-bottom: 8px;
                }

                .onb-summary-desc {
                    font-size: 14px;
                    color: var(--muted);
                    line-height: 1.6;
                    margin-bottom: 20px;
                }

                .onb-summary-card {
                    background: #f9fafb;
                    border-radius: 14px;
                    padding: 16px 20px;
                    text-align: left;
                }

                .onb-summary-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 0;
                }

                .onb-summary-row + .onb-summary-row {
                    border-top: 1px solid #f3f4f6;
                }

                .onb-summary-row-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: color-mix(in srgb, var(--primary) 10%, transparent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: var(--primary);
                }

                .onb-summary-row-label {
                    font-size: 11px;
                    color: var(--muted-light);
                }

                .onb-summary-row-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--foreground);
                }

                /* ── Animations ───────────────────────────── */
                @keyframes onb-popIn {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }

                @keyframes onb-fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>
        </>
    );

    function renderStepContent() {
        switch (step) {
            case 1:
                return (
                    <>
                        <p className="onb-label">💚 {t("onboarding.step1Label")}</p>
                        <h2 className="onb-title" style={{ marginBottom: 10 }}>
                            {t("onboarding.step1Title")}
                        </h2>
                        <p className="onb-desc" style={{ marginBottom: 0 }}>
                            {t("onboarding.step1Desc")}
                        </p>
                    </>
                );

            case 2:
                return (
                    <>
                        <p className="onb-label">👤 {t("onboarding.step2Label")}</p>
                        <h2 className="onb-title">{t("onboarding.step2Title")}</h2>
                        <p className="onb-desc">{t("onboarding.step2Desc")}</p>
                        <div className="onb-input-wrap">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("onboarding.step2Placeholder")}
                                className={`onb-input ${name ? "has-value" : ""}`}
                            />
                            {name && <span className="onb-input-check">✓</span>}
                        </div>
                        {name && (
                            <p className="onb-preview-text">
                                {t("onboarding.step2Preview", { name })}
                            </p>
                        )}
                    </>
                );

            case 3:
                return (
                    <>
                        <p className="onb-label">📦 {t("onboarding.step3Label")}</p>
                        <h2 className="onb-title">{t("onboarding.step3Title")}</h2>
                        <p className="onb-desc">{t("onboarding.step3Desc")}</p>
                        <div className="onb-input-wrap">
                            <input
                                type="text"
                                value={itemsLabel}
                                onChange={(e) => {
                                    setItemsLabel(e.target.value);
                                    setSelectedChip(null);
                                }}
                                placeholder={t("onboarding.step3Placeholder")}
                                className={`onb-input ${itemsLabel ? "has-value" : ""}`}
                            />
                            {itemsLabel && <span className="onb-input-check">✓</span>}
                        </div>
                        {/* Chips */}
                        <div className="onb-chips">
                            {chips.map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => handleChipSelect(chip)}
                                    className={`onb-chip ${selectedChip === chip ? "selected" : ""}`}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                        {/* Preview */}
                        {itemsLabel && (
                            <div className="onb-preview-box">
                                <p className="onb-preview-label">{t("onboarding.step3PreviewLabel")}</p>
                                <div className="onb-preview-row">
                                    <div className="onb-preview-icon">📦</div>
                                    <div>
                                        <p className="onb-preview-name">{itemsLabel}</p>
                                        <p className="onb-preview-count">0 items</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );

            case 4:
                return (
                    <>
                        <p className="onb-label">🎨 {t("onboarding.step4Label")}</p>
                        <h2 className="onb-title">{t("onboarding.step4Title")}</h2>
                        <p className="onb-desc">{t("onboarding.step4Desc")}</p>
                        {/* Color grid */}
                        <div className="onb-color-grid">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color.hex}
                                    onClick={() => {
                                        setThemeColor(color.hex);
                                        setShowCustom(false);
                                    }}
                                    className="onb-color-btn"
                                >
                                    <div
                                        className={`onb-color-swatch ${themeColor === color.hex ? "selected" : ""}`}
                                        style={{
                                            background: color.hex,
                                            boxShadow: themeColor === color.hex
                                                ? `0 0 0 3px #fff, 0 0 0 5px ${color.hex}`
                                                : "none",
                                        }}
                                    >
                                        {themeColor === color.hex && (
                                            <span style={{ color: "#fff", fontSize: 18 }}>✓</span>
                                        )}
                                    </div>
                                    <span
                                        className={`onb-color-name ${themeColor === color.hex ? "selected" : ""}`}
                                        style={{ color: themeColor === color.hex ? color.hex : undefined }}
                                    >
                                        {color.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {/* Custom color toggle */}
                        <button
                            onClick={() => setShowCustom(!showCustom)}
                            className="onb-custom-toggle"
                        >
                            ✨ {showCustom ? t("onboarding.step4CustomHide") : t("onboarding.step4Custom")}
                        </button>
                        {showCustom && (
                            <div className="onb-custom-panel">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => {
                                        setCustomColor(e.target.value);
                                        setThemeColor(e.target.value);
                                    }}
                                    className="onb-custom-picker"
                                />
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                                        {t("onboarding.step4CustomLabel")}
                                    </p>
                                    <input
                                        type="text"
                                        value={customColor}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomColor(val);
                                            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                                                setThemeColor(val);
                                            }
                                        }}
                                        className="onb-custom-hex-input"
                                    />
                                </div>
                                <div
                                    className="onb-custom-preview"
                                    style={{ background: customColor }}
                                />
                            </div>
                        )}
                    </>
                );

            case 5:
                return (
                    <div className="onb-summary">
                        <div className="onb-summary-icon">🎉</div>
                        <h2 className="onb-summary-title">{t("onboarding.step5Title")}</h2>
                        <p className="onb-summary-desc">{t("onboarding.step5Desc")}</p>
                        <div className="onb-summary-card">
                            {/* Name */}
                            <div className="onb-summary-row">
                                <div className="onb-summary-row-icon">👤</div>
                                <div>
                                    <p className="onb-summary-row-label">{t("onboarding.step5Name")}</p>
                                    <p className="onb-summary-row-value">{name || "—"}</p>
                                </div>
                            </div>
                            {/* Items label */}
                            <div className="onb-summary-row">
                                <div className="onb-summary-row-icon">📦</div>
                                <div>
                                    <p className="onb-summary-row-label">{t("onboarding.step5Collection")}</p>
                                    <p className="onb-summary-row-value">{itemsLabel || "Items"}</p>
                                </div>
                            </div>
                            {/* Theme color */}
                            <div className="onb-summary-row">
                                <div className="onb-summary-row-icon">🎨</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div>
                                        <p className="onb-summary-row-label">{t("onboarding.step5Color")}</p>
                                        <p className="onb-summary-row-value">{themeColor || "#DB2777"}</p>
                                    </div>
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 6,
                                            background: themeColor || "var(--primary)",
                                            marginLeft: 4,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    }
}
