import vi from "./vi.json";
import en from "./en.json";
import zh from "./zh.json";
import ru from "./ru.json";

// ─── Supported Locales ────────────────────────────────────────
export const SUPPORTED_LOCALES = ["vi", "en", "zh", "ru"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
    vi: "Tiếng Việt",
    en: "English",
    zh: "中文",
    ru: "Русский",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
    vi: "🇻🇳",
    en: "🇺🇸",
    zh: "🇨🇳",
    ru: "🇷🇺",
};

export const DEFAULT_LOCALE: Locale = "vi";

// ─── Translation Map ──────────────────────────────────────────
type TranslationData = typeof vi;

const translations: Record<Locale, TranslationData> = {
    vi,
    en,
    zh,
    ru,
};

// ─── Translation Helper ───────────────────────────────────────
// Access nested keys like "dashboard.greeting"
export function t(
    locale: Locale,
    key: string,
    params?: Record<string, string | number>
): string {
    const keys = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[locale] || translations[DEFAULT_LOCALE];

    for (const k of keys) {
        value = value?.[k];
    }

    if (typeof value !== "string") {
        // Fallback to default locale
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = translations[DEFAULT_LOCALE];
        for (const k of keys) {
            fallback = fallback?.[k];
        }
        value = typeof fallback === "string" ? fallback : key;
    }

    // Replace {param} placeholders
    if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
            value = value.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        }
    }

    return value;
}

// ─── Section Helper ───────────────────────────────────────────
// Returns a function bound to a specific section, e.g. useT("dashboard")
export function getSection(locale: Locale, section: string) {
    return (key: string, params?: Record<string, string | number>) =>
        t(locale, `${section}.${key}`, params);
}

// ─── Type Export ──────────────────────────────────────────────
export type { TranslationData };
