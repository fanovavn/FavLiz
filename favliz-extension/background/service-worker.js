// ═══════════════════════════════════════════════════════════════
// FavLiz Extension — Service Worker (Background)
// ═══════════════════════════════════════════════════════════════

const API_BASE = "https://www.favliz.com/api/extension";

// ─── Context Menu (Right-click "Add link to FavLiz") ─────────
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "favliz-save-link",
        title: "Add link to FavLiz",
        contexts: ["link"],
    });

    // Set up periodic token refresh alarm (every 45 minutes)
    chrome.alarms.create("favliz-token-refresh", { periodInMinutes: 45 });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id || info.menuItemId !== "favliz-save-link") return;
    if (!info.linkUrl) return;

    try {
        await chrome.tabs.sendMessage(tab.id, {
            action: "CONTEXT_MENU_SAVE",
            url: info.linkUrl,
        });
    } catch {
        console.warn("[FavLiz SW] Content script not ready");
    }
});

// ─── Periodic Token Refresh ──────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "favliz-token-refresh") {
        console.log("[FavLiz SW] Periodic token refresh check...");
        await ensureValidToken();
    }
});

// ─── Token Management ────────────────────────────────────────
async function getToken() {
    const result = await chrome.storage.local.get(["access_token"]);
    return result.access_token || null;
}

async function setAuth(data) {
    const authData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
    };
    // Only set user if provided (login response has user, refresh doesn't)
    if (data.user !== undefined) {
        authData.user = data.user;
    }
    await chrome.storage.local.set(authData);
}

async function clearAuth() {
    await chrome.storage.local.remove([
        "access_token",
        "refresh_token",
        "expires_at",
        "user",
    ]);
}

async function getUser() {
    const result = await chrome.storage.local.get(["user"]);
    return result.user || null;
}

// ─── Token Refresh ───────────────────────────────────────────
let isRefreshing = false;

async function refreshAccessToken() {
    if (isRefreshing) return false;
    isRefreshing = true;

    try {
        const stored = await chrome.storage.local.get(["refresh_token"]);
        const refreshToken = stored.refresh_token;

        if (!refreshToken) {
            console.warn("[FavLiz SW] No refresh token available");
            await clearAuth();
            return false;
        }

        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            console.warn("[FavLiz SW] Token refresh failed:", response.status);
            await clearAuth();
            return false;
        }

        const data = await response.json();
        await setAuth(data);
        console.log("[FavLiz SW] Token refreshed successfully");
        return true;
    } catch (err) {
        console.error("[FavLiz SW] Token refresh error:", err);
        return false;
    } finally {
        isRefreshing = false;
    }
}

// Check if token is expired or about to expire (within 5 minutes)
async function ensureValidToken() {
    const stored = await chrome.storage.local.get(["access_token", "expires_at", "refresh_token"]);

    if (!stored.access_token || !stored.refresh_token) {
        return null; // Not logged in
    }

    if (stored.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const bufferSeconds = 5 * 60; // Refresh 5 minutes before expiry

        if (now >= stored.expires_at - bufferSeconds) {
            console.log("[FavLiz SW] Token expired or expiring soon, refreshing...");
            const refreshed = await refreshAccessToken();
            if (!refreshed) return null;
        }
    }

    const result = await chrome.storage.local.get(["access_token"]);
    return result.access_token || null;
}

// ─── API Calls ───────────────────────────────────────────────
async function apiCall(endpoint, options = {}) {
    // Ensure we have a valid token before making the call
    const token = await ensureValidToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        // If 401, try refreshing token and retry once
        if (response.status === 401) {
            console.log("[FavLiz SW] Got 401, attempting token refresh...");
            const refreshed = await refreshAccessToken();

            if (refreshed) {
                // Retry with new token
                const newToken = await getToken();
                const retryHeaders = {
                    "Content-Type": "application/json",
                    ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
                    ...options.headers,
                };

                const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
                    ...options,
                    headers: retryHeaders,
                });

                const retryData = await retryResponse.json();

                if (retryResponse.status === 401) {
                    await clearAuth();
                    return { error: "Session expired. Please login again.", unauthorized: true };
                }

                if (!retryResponse.ok) {
                    return { error: retryData.error || "Request failed" };
                }

                return { data: retryData };
            }

            await clearAuth();
            return { error: "Session expired. Please login again.", unauthorized: true };
        }

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || "Request failed" };
        }

        return { data };
    } catch (err) {
        return { error: "Network error. Is FavLiz running?" };
    }
}

// ─── Message Handler ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true; // Keep message channel open for async response
});

async function handleMessage(message) {
    const { action, payload } = message;

    switch (action) {
        case "LOGIN": {
            try {
                const response = await fetch(`${API_BASE}/auth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();

                if (!response.ok) {
                    return { success: false, error: data.error || "Login failed" };
                }

                await setAuth(data);
                return { success: true, user: data.user };
            } catch (err) {
                return { success: false, error: "Cannot connect to FavLiz server" };
            }
        }

        case "LOGOUT": {
            await clearAuth();
            return { success: true };
        }

        case "GET_AUTH_STATE": {
            const token = await getToken();
            const user = await getUser();
            return { isLoggedIn: !!token, user };
        }

        case "CREATE_ITEM": {
            const result = await apiCall("/items", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (result.data) {
                return { success: true, item: result.data };
            }
            return { success: false, error: result.error, unauthorized: result.unauthorized };
        }

        case "GET_LISTS": {
            const result = await apiCall("/lists");
            console.log("[FavLiz SW] GET_LISTS result:", JSON.stringify(result));
            if (result.data) {
                return { success: true, lists: result.data };
            }
            return { success: false, error: result.error, unauthorized: result.unauthorized };
        }

        case "CREATE_LIST": {
            const result = await apiCall("/lists", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (result.data) {
                return { success: true, list: result.data };
            }
            return { success: false, error: result.error };
        }

        case "GET_TAGS": {
            const result = await apiCall("/tags");
            if (result.data) {
                return { success: true, tags: result.data };
            }
            return { success: false, error: result.error, unauthorized: result.unauthorized };
        }

        case "GET_PROFILE": {
            const result = await apiCall("/profile");
            if (result.data) {
                return { success: true, profile: result.data };
            }
            return { success: false, error: result.error, unauthorized: result.unauthorized };
        }

        case "GET_DASHBOARD_URL": {
            // Build a URL that syncs the extension session into the web app's cookies
            const token = await getToken();
            const stored = await chrome.storage.local.get(["refresh_token"]);
            const refreshToken = stored.refresh_token;
            const redirect = payload.redirect || "/dashboard";

            if (token && refreshToken) {
                const syncUrl = `${API_BASE}/set-session?access_token=${encodeURIComponent(token)}&refresh_token=${encodeURIComponent(refreshToken)}&redirect=${encodeURIComponent(redirect)}`;
                return { success: true, url: syncUrl };
            }
            // Fallback: user not logged in, just open dashboard directly
            return { success: true, url: `https://www.favliz.com${redirect}` };
        }

        case "FETCH_URL_METADATA": {
            try {
                const { url } = payload;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; FavLiz/1.0)",
                        "Accept": "text/html",
                    },
                    redirect: "follow",
                });

                if (!response.ok) {
                    return { success: false, error: "Failed to fetch URL" };
                }

                const html = await response.text();

                // Parse meta tags from HTML
                const getMetaContent = (property) => {
                    // Try og: tags first, then standard meta
                    const patterns = [
                        new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
                        new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
                    ];
                    for (const pattern of patterns) {
                        const match = html.match(pattern);
                        if (match && match[1]) return match[1].trim();
                    }
                    return "";
                };

                // Extract title
                let title = getMetaContent("og:title") || getMetaContent("twitter:title");
                if (!title) {
                    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
                    if (titleMatch) title = titleMatch[1].trim();
                }

                // Extract description
                const description = getMetaContent("og:description")
                    || getMetaContent("twitter:description")
                    || getMetaContent("description");

                // Extract thumbnail
                const thumbnail = getMetaContent("og:image")
                    || getMetaContent("twitter:image")
                    || getMetaContent("twitter:image:src");

                // Detect platform
                const parsed = new URL(url);
                const host = parsed.hostname.replace("www.", "");
                let platform = host;
                let platformIcon = "🌐";
                const platformMap = {
                    "youtube.com": { name: "YouTube", icon: "🎬" },
                    "youtu.be": { name: "YouTube", icon: "🎬" },
                    "facebook.com": { name: "Facebook", icon: "📘" },
                    "fb.com": { name: "Facebook", icon: "📘" },
                    "instagram.com": { name: "Instagram", icon: "📸" },
                    "tiktok.com": { name: "TikTok", icon: "🎵" },
                    "reddit.com": { name: "Reddit", icon: "🔴" },
                    "twitter.com": { name: "Twitter/X", icon: "🐦" },
                    "x.com": { name: "Twitter/X", icon: "🐦" },
                    "github.com": { name: "GitHub", icon: "🐙" },
                    "medium.com": { name: "Medium", icon: "📝" },
                    "linkedin.com": { name: "LinkedIn", icon: "💼" },
                };
                for (const [domain, info] of Object.entries(platformMap)) {
                    if (host.includes(domain)) {
                        platform = info.name;
                        platformIcon = info.icon;
                        break;
                    }
                }

                // Auto-detect tags from platform
                const autoTags = [];
                if (platform !== host) autoTags.push(platform);

                return {
                    success: true,
                    metadata: {
                        title: title || host + parsed.pathname,
                        description: description || "",
                        thumbnail: thumbnail || "",
                        url: url,
                        platform,
                        platformIcon,
                        autoTags,
                    },
                };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        default:
            return { error: "Unknown action" };
    }
}
