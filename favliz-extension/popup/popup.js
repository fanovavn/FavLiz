// ═══════════════════════════════════════════════════════════════
// FavLiz Extension — Popup Script
// ═══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", init);

// ─── State ───────────────────────────────────────────────────
let pageData = null;

// ─── Init ────────────────────────────────────────────────────
async function init() {
    showView("loading");

    const authState = await sendMessage("GET_AUTH_STATE");

    if (authState.isLoggedIn) {
        await showMainView(authState.user);
    } else {
        showView("login");
    }
}

// ─── View Switching ──────────────────────────────────────────
function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const el = document.getElementById(`${name}-view`);
    if (el) el.classList.add("active");
}

// ─── Login ───────────────────────────────────────────────────
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
    const loginBtn = document.getElementById("login-btn");

    if (!email || !password) return;

    errorEl.classList.add("hidden");
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="btn-spinner"></span> Signing in...';

    const result = await sendMessage("LOGIN", { email, password });

    if (result.success) {
        await showMainView(result.user);
    } else {
        errorEl.textContent = result.error || "Login failed";
        errorEl.classList.remove("hidden");
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
    }
});

// ─── Main View ───────────────────────────────────────────────
async function showMainView(user) {
    showView("main");

    // Display user name
    if (user) {
        document.getElementById("user-name").textContent =
            user.name || user.email?.split("@")[0] || "User";
    }

    // Initialize FAB toggle state
    try {
        const stored = await chrome.storage.local.get(["fabHidden"]);
        const fabToggle = document.getElementById("fab-toggle");
        if (fabToggle) {
            fabToggle.checked = !stored.fabHidden;
        }
    } catch (e) {
        console.warn("[FavLiz Popup] Could not read fabHidden:", e);
    }

    // Extract page data from active tab
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            pageData = await chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_DATA" });
            renderPagePreview(pageData);
        }
    } catch (err) {
        document.getElementById("page-preview").innerHTML =
            '<div class="preview-loading">Could not extract page data</div>';
    }
}

function renderPagePreview(data) {
    if (!data) return;

    const previewEl = document.getElementById("page-preview");
    const thumbHtml = data.thumbnail
        ? `<img src="${escapeAttr(data.thumbnail)}" alt="" class="preview-thumb">`
        : "";

    previewEl.innerHTML = `
        <div class="preview-content">
            ${thumbHtml}
            <div class="preview-meta">
                <div class="preview-title">${escapeHtml(data.title || "Untitled")}</div>
                <div class="preview-platform">
                    <span>${data.platformIcon || "🌐"}</span>
                    <span>${escapeHtml(data.platform || "Website")}</span>
                </div>
            </div>
        </div>
    `;
}

// ─── Quick Save ──────────────────────────────────────────────
document.getElementById("quick-save-btn").addEventListener("click", async () => {
    if (!pageData) {
        showStatus("No page data to save", "error");
        return;
    }

    const btn = document.getElementById("quick-save-btn");
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Saving...';

    const result = await sendMessage("CREATE_ITEM", {
        title: pageData.title || "Untitled",
        description: pageData.description || "",
        thumbnail: pageData.thumbnail || "",
        viewMode: "PRIVATE",
        tagNames: pageData.autoTags || [],
        listIds: [],
        attachments: pageData.attachments || [{ type: "LINK", url: pageData.url }],
    });

    if (result.success) {
        btn.classList.add("success");
        btn.innerHTML = "✅ Saved!";
        showStatus("Saved to FavLiz successfully!", "success");
    } else {
        btn.disabled = false;
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Quick Save
        `;
        showStatus(result.error || "Failed to save", "error");
    }
});

// ─── Save with Options ──────────────────────────────────────
document.getElementById("save-with-options-btn").addEventListener("click", async () => {
    // Open the content script modal on the active tab
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            await chrome.tabs.sendMessage(tab.id, { action: "OPEN_SAVE_MODAL" });
            window.close(); // Close popup
        }
    } catch {
        showStatus("Could not open save dialog", "error");
    }
});

// ─── FAB Toggle ─────────────────────────────────────────────
document.getElementById("fab-toggle").addEventListener("change", async (e) => {
    const show = e.target.checked;

    // Save preference
    try {
        await chrome.storage.local.set({ fabHidden: !show });
    } catch (err) {
        console.warn("[FavLiz Popup] Could not save fabHidden:", err);
    }

    // Notify active tab's content script
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            await chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_FAB", show });
        }
    } catch {
        // Content script may not be injected on this tab
    }
});

// ─── Logout ──────────────────────────────────────────────────
document.getElementById("logout-btn").addEventListener("click", async () => {
    await sendMessage("LOGOUT");
    showView("login");
    pageData = null;
});

// ─── Open Dashboard (with session sync) ─────────────────────
document.getElementById("open-dashboard-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const result = await sendMessage("GET_DASHBOARD_URL", { redirect: "/dashboard" });
    if (result.success && result.url) {
        chrome.tabs.create({ url: result.url });
    } else {
        chrome.tabs.create({ url: "https://www.favliz.com/dashboard" });
    }
    window.close();
});

// ─── Helpers ─────────────────────────────────────────────────
function sendMessage(action, payload = {}) {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.error("[FavLiz Popup] Message timeout:", action);
            resolve({ success: false, error: "Request timed out. Is the server running?" });
        }, 15000); // 15 second timeout

        try {
            chrome.runtime.sendMessage({ action, payload }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    console.error("[FavLiz Popup] Message error:", chrome.runtime.lastError.message);
                    resolve({ success: false, error: chrome.runtime.lastError.message });
                    return;
                }
                console.log("[FavLiz Popup] Response for", action, ":", response);
                resolve(response || { success: false, error: "No response from service worker" });
            });
        } catch (err) {
            clearTimeout(timeout);
            console.error("[FavLiz Popup] Send error:", err);
            resolve({ success: false, error: err.message });
        }
    });
}

function showStatus(message, type) {
    const el = document.getElementById("save-status");
    el.textContent = message;
    el.className = `status-msg ${type}`;
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 4000);
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
