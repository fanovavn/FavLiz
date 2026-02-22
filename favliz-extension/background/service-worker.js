// ═══════════════════════════════════════════════════════════════
// FavLiz Extension — Service Worker (Background)
// ═══════════════════════════════════════════════════════════════

const API_BASE = "https://www.favliz.com/api/extension";

// ─── Token Management ────────────────────────────────────────
async function getToken() {
    const result = await chrome.storage.local.get(["access_token"]);
    return result.access_token || null;
}

async function setAuth(data) {
    await chrome.storage.local.set({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        user: data.user,
    });
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

// ─── API Calls ───────────────────────────────────────────────
async function apiCall(endpoint, options = {}) {
    const token = await getToken();
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

        const data = await response.json();

        if (response.status === 401) {
            await clearAuth();
            return { error: "Session expired. Please login again.", unauthorized: true };
        }

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

        default:
            return { error: "Unknown action" };
    }
}
