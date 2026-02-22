import { initializeApp, getApps } from "firebase/app";
import {
    getAnalytics,
    isSupported,
    logEvent,
    type Analytics,
} from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAdY_T-vfcbj_CWI4axrxSeSXq86KYyTpg",
    authDomain: "favliz.firebaseapp.com",
    projectId: "favliz",
    storageBucket: "favliz.firebasestorage.app",
    messagingSenderId: "801460663178",
    appId: "1:801460663178:web:6daf719417d16be75cce73",
    measurementId: "G-160T87W2JW",
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
