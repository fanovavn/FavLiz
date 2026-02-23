import { useEffect, useCallback } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

/**
 * Hook to handle share intents from other apps.
 * When a user shares a URL/text to FavLiz, this hook captures it
 * and navigates to the item-form with the shared URL pre-filled.
 */
export function useShareIntent() {
    const router = useRouter();

    const handleSharedContent = useCallback(
        (text: string) => {
            if (!text) return;

            // Extract URL from the shared text
            const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
            const sharedUrl = urlMatch ? urlMatch[1] : "";
            const sharedText = text.replace(/(https?:\/\/[^\s]+)/gi, "").trim();

            console.log("[ShareIntent] Received:", { sharedUrl, sharedText });

            // Navigate to item form with shared data
            setTimeout(() => {
                router.push({
                    pathname: "/item-form",
                    params: {
                        sharedUrl: sharedUrl || text,
                        sharedTitle: sharedText || "",
                    },
                });
            }, 500); // Small delay to ensure app is ready
        },
        [router]
    );

    useEffect(() => {
        // Handle the initial URL (app opened via share)
        const checkInitialUrl = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    console.log("[ShareIntent] Initial URL:", initialUrl);
                    handleSharedContent(initialUrl);
                }
            } catch (err) {
                console.log("[ShareIntent] Error getting initial URL:", err);
            }
        };

        // On Android, shared content comes through the intent extras
        // We listen for URL changes which include shared content
        if (Platform.OS === "android") {
            checkInitialUrl();
        }

        // Listen for incoming URLs while app is running
        const subscription = Linking.addEventListener("url", (event) => {
            console.log("[ShareIntent] URL event:", event.url);
            handleSharedContent(event.url);
        });

        return () => {
            subscription.remove();
        };
    }, [handleSharedContent]);
}

/**
 * Parse share intent data from Android Intent extras.
 * This is called from the native side via expo-linking.
 */
export function extractSharedData(url: string): { url: string; text: string } {
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
    return {
        url: urlMatch ? urlMatch[1] : "",
        text: url.replace(/(https?:\/\/[^\s]+)/gi, "").trim(),
    };
}
