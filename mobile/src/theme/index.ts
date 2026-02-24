// FavLiz Theme — matching web app glassmorphism aesthetic
export const Colors = {
    primary: "#E91E63",
    primaryLight: "#F48FB1",
    primaryDark: "#C2185B",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceGlass: "rgba(255,255,255,0.85)",
    text: "#1E293B",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    border: "#E2E8F0",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
    purple: "#7C3AED",
    teal: "#0D9488",
    tagColors: ["#16A34A", "#2563EB", "#D97706", "#DC2626", "#7C3AED", "#0D9488"],
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
};

export const FontFamily = {
    regular: "PlusJakartaSans-Regular",
    medium: "PlusJakartaSans-Medium",
    semiBold: "PlusJakartaSans-SemiBold",
    bold: "PlusJakartaSans-Bold",
    extraBold: "PlusJakartaSans-ExtraBold",
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

// Thumbnail color generator (same as web)
export function getThumbnailColor(text: string): string {
    const pastelColors = [
        "#F48FB1", "#CE93D8", "#90CAF9", "#80DEEA",
        "#A5D6A7", "#FFF176", "#FFAB91", "#BCAAA4",
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return pastelColors[Math.abs(hash) % pastelColors.length];
}
