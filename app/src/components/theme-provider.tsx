"use client";

import { useEffect } from "react";

/**
 * Given a hex color, generate light and dark variants
 * and apply them as CSS custom properties on :root
 */
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
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function applyThemeColor(hex: string) {
    const hsl = hexToHSL(hex);

    // Generate lighter variant (+15 lightness, -10 saturation)
    const lightHex = hslToHex(hsl.h, Math.max(0, hsl.s - 10), Math.min(100, hsl.l + 18));
    // Generate darker variant (-10 lightness, +5 saturation)
    const darkHex = hslToHex(hsl.h, Math.min(100, hsl.s + 5), Math.max(0, hsl.l - 12));

    const root = document.documentElement;
    root.style.setProperty("--primary", hex);
    root.style.setProperty("--primary-light", lightHex);
    root.style.setProperty("--primary-dark", darkHex);
}

function clearThemeColor() {
    const root = document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-light");
    root.style.removeProperty("--primary-dark");
}

interface ThemeProviderProps {
    themeColor: string | null;
    children: React.ReactNode;
}

export function ThemeProvider({ themeColor, children }: ThemeProviderProps) {
    useEffect(() => {
        if (themeColor) {
            applyThemeColor(themeColor);
        } else {
            clearThemeColor();
        }
    }, [themeColor]);

    return <>{children}</>;
}
