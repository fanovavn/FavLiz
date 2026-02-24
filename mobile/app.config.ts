import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "FavLiz",
    slug: "favliz",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "favliz",
    splash: {
        image: "./assets/splash.png",
        backgroundColor: "#FFFFFF",
        resizeMode: "contain",
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.favliz.app",
        icon: "./assets/icon.png",
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#FFFFFF",
        },
        package: "com.favliz.app",
        intentFilters: [
            {
                action: "SEND",
                category: ["DEFAULT"],
                data: [{ mimeType: "text/plain" }],
            },
            {
                action: "SEND",
                category: ["DEFAULT"],
                data: [{ mimeType: "text/*" }],
            },
        ],
    },
    extra: {
        apiUrl: process.env.API_URL || "http://localhost:3000",
        supabaseUrl: process.env.SUPABASE_URL || "",
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
        eas: {
            projectId: "ee346b08-49b8-45e3-a9af-69671839e82a",
        },
    },
    plugins: [
        "expo-router",
        "expo-secure-store",
        [
            "expo-share-intent",
            {
                iosActivationRules: {
                    NSExtensionActivationSupportsWebURLWithMaxCount: 1,
                    NSExtensionActivationSupportsText: true,
                },
            },
        ],
    ],
});
