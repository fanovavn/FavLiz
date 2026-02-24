import { useEffect, useCallback } from "react";
import { useShareIntent as useExpoShareIntent } from "expo-share-intent";
import { useRouter } from "expo-router";

/**
 * Hook to handle share intents from other apps (iOS + Android).
 * Uses expo-share-intent native module to capture shared content
 * and navigates to item-form with the shared URL pre-filled.
 */
export function useShareIntent() {
    const router = useRouter();
    const { hasShareIntent, shareIntent, resetShareIntent, error } =
        useExpoShareIntent();

    useEffect(() => {
        if (hasShareIntent && shareIntent) {
            // Extract the shared URL and text
            const sharedUrl = shareIntent.webUrl || shareIntent.text || "";
            const sharedTitle = shareIntent.meta?.title || "";

            console.log("[ShareIntent] Received:", {
                sharedUrl,
                sharedTitle,
                text: shareIntent.text,
                webUrl: shareIntent.webUrl,
                meta: shareIntent.meta,
            });

            if (sharedUrl) {
                // Small delay to ensure app is ready
                setTimeout(() => {
                    router.push({
                        pathname: "/item-form",
                        params: {
                            sharedUrl: encodeURIComponent(sharedUrl),
                            sharedTitle: encodeURIComponent(sharedTitle),
                        },
                    });
                    resetShareIntent();
                }, 500);
            }
        }

        if (error) {
            console.log("[ShareIntent] Error:", error);
        }
    }, [hasShareIntent, shareIntent, error, router, resetShareIntent]);
}
