import landingData from "./landing.json";
import type { Locale } from "./index";

type LandingTranslations = (typeof landingData)["vi"];

const landingTranslations: Record<string, LandingTranslations> =
    landingData as Record<string, LandingTranslations>;

/**
 * Get a landing page translation by key.
 * Falls back to Vietnamese if key is not found.
 */
export function lt(locale: Locale, key: keyof LandingTranslations): string | string[] {
    const strings = landingTranslations[locale] || landingTranslations["vi"];
    return strings[key] ?? landingTranslations["vi"][key] ?? key;
}
