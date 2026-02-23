import vi from "./vi.json";
import en from "./en.json";

export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
    vi: "Tiếng Việt",
    en: "English",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
    vi: "🇻🇳",
    en: "🇺🇸",
};

export const DEFAULT_LOCALE: Locale = "vi";

type TranslationData = typeof vi;
const translations: Record<Locale, TranslationData> = { vi, en };

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = translations[DEFAULT_LOCALE];
        for (const k of keys) {
            fallback = fallback?.[k];
        }
        value = typeof fallback === "string" ? fallback : key;
    }

    if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
            value = value.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        }
    }

    return value;
}
