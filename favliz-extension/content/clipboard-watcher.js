// ═══════════════════════════════════════════════════════════════
// FavLiz — Clipboard Watcher (runs at document_start)
// Detects when a URL is copied to clipboard and notifies content.js
// ═══════════════════════════════════════════════════════════════

(function () {
    "use strict";

    // Don't run on FavLiz's own pages
    const host = window.location.hostname;
    if (host === "localhost" || host.includes("favliz.com")) return;

    // Check if feature is enabled (default: enabled)
    chrome.storage.local.get(["clipboardWatcherEnabled"], (result) => {
        // Default to true if not set
        const enabled = result.clipboardWatcherEnabled !== false;
        if (!enabled) return;

        initClipboardWatcher();
    });

    function initClipboardWatcher() {
        // ─── Strategy 1: Monkey-patch navigator.clipboard.writeText ───
        // This catches programmatic clipboard writes (Facebook "Copy link", etc.)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);

            navigator.clipboard.writeText = function (text) {
                // Check if it looks like a URL
                if (isUrl(text)) {
                    notifyCopiedUrl(text, "clipboard_api");
                }
                // Always call the original — don't break the copy functionality
                return originalWriteText(text);
            };
        }

        // Also inject via script tag to patch the page's context
        // (content scripts run in isolated world, so we need to inject into the page)
        const script = document.createElement("script");
        script.textContent = `
            (function() {
                if (!navigator.clipboard || !navigator.clipboard.writeText) return;
                const _origWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
                navigator.clipboard.writeText = function(text) {
                    // Dispatch custom event for the content script to pick up
                    try {
                        if (/^https?:\\/\\//i.test(text) && text.length < 2048) {
                            window.dispatchEvent(new CustomEvent('__favliz_clipboard_url', {
                                detail: { url: text, source: 'clipboard_api' }
                            }));
                        }
                    } catch(e) {}
                    return _origWriteText(text);
                };
            })();
        `;
        // Inject as early as possible
        (document.head || document.documentElement).appendChild(script);
        script.remove();

        // Listen for the custom event from the page context
        window.addEventListener("__favliz_clipboard_url", (e) => {
            if (e.detail && e.detail.url) {
                notifyCopiedUrl(e.detail.url, e.detail.source);
            }
        });

        // ─── Strategy 2: Listen for native copy events ────────────────
        // This catches Ctrl+C / right-click > Copy
        document.addEventListener("copy", () => {
            // Small delay to let the clipboard populate
            setTimeout(async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (isUrl(text)) {
                        notifyCopiedUrl(text, "native_copy");
                    }
                } catch {
                    // clipboard.readText may be blocked — that's okay
                }
            }, 100);
        });
    }

    // ─── URL Detection ────────────────────────────────────────────
    function isUrl(text) {
        if (!text || typeof text !== "string") return false;
        text = text.trim();
        // Must start with http:// or https://
        if (!/^https?:\/\//i.test(text)) return false;
        // Must not be too long (avoid base64 data URIs etc.)
        if (text.length > 2048) return false;
        // Must not contain newlines (it's probably not a single URL)
        if (/[\n\r]/.test(text)) return false;
        // Basic URL validation
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    }

    // ─── Throttle / Debounce ──────────────────────────────────────
    let lastNotifiedUrl = "";
    let lastNotifiedTime = 0;
    const COOLDOWN_MS = 5000; // Don't show again for same URL within 5 seconds

    function notifyCopiedUrl(url, source) {
        const now = Date.now();
        // Deduplicate: same URL within cooldown period
        if (url === lastNotifiedUrl && now - lastNotifiedTime < COOLDOWN_MS) return;

        lastNotifiedUrl = url;
        lastNotifiedTime = now;

        // Dispatch event for content.js to handle
        window.dispatchEvent(new CustomEvent("favliz-url-copied", {
            detail: { url, source }
        }));
    }
})();
