import { initializeApp, getApps } from "firebase/app";
import {
    getAnalytics,
    isSupported,
    logEvent,
    type Analytics,
} from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Initialize Firebase (singleton)
const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics (only in browser)
let analytics: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
    if (typeof window === "undefined") return null;
    if (analytics) return analytics;

    const supported = await isSupported();
    if (supported) {
        analytics = getAnalytics(app);
    }
    return analytics;
}

/**
 * Track a custom GA event.
 * Safe to call from anywhere — no-ops on server or if analytics is not ready.
 */
export async function trackEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>
) {
    const a = await getFirebaseAnalytics();
    if (a) {
        logEvent(a, eventName, params);
    }
}

/**
 * Track a screen/page view.
 */
export async function trackPageView(screenName: string, pagePath: string) {
    const a = await getFirebaseAnalytics();
    if (a) {
        logEvent(a, "screen_view", {
            firebase_screen: screenName,
            firebase_screen_class: pagePath,
        });
    }
}

export { app };
