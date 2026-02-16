"use client";

import { createContext, useContext, useCallback } from "react";
import { type Locale, DEFAULT_LOCALE, t as translate } from "@/lib/i18n";

interface LanguageContextValue {
    locale: Locale;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
    locale: DEFAULT_LOCALE,
    t: (key: string, params?: Record<string, string | number>) =>
        translate(DEFAULT_LOCALE, key, params),
});

interface LanguageProviderProps {
    locale: Locale;
    children: React.ReactNode;
}

export function LanguageProvider({ locale, children }: LanguageProviderProps) {
    const tFn = useCallback(
        (key: string, params?: Record<string, string | number>) =>
            translate(locale, key, params),
        [locale]
    );

    return (
        <LanguageContext.Provider value={{ locale, t: tFn }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
