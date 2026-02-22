"use client";

import { useMemo } from "react";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import authData from "@/lib/i18n/auth.json";

type AuthTranslations = (typeof authData)["vi"];

function getLocaleFromCookie(): Locale {
    if (typeof document === "undefined") return "vi";
    const match = document.cookie.match(/(?:^|;\s*)landing_locale=([^;]*)/);
    const raw = match?.[1] || "vi";
    return (SUPPORTED_LOCALES as readonly string[]).includes(raw)
        ? (raw as Locale)
        : "vi";
}

export function useAuthLocale() {
    const locale = useMemo(() => getLocaleFromCookie(), []);
    const t: AuthTranslations = useMemo(
        () => (authData as Record<string, AuthTranslations>)[locale] || authData.vi,
        [locale]
    );
    return { locale, t };
}
