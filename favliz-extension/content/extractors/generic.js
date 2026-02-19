// ═══════════════════════════════════════════════════════════════
// Generic Extractor — Universal Fallback
// JSON-LD → Open Graph → Twitter Card → Meta → DOM heuristic
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.generic = {
    name: "generic",
    platform: "Website",
    icon: "🌐",

    canHandle() {
        return true; // Always matches as fallback
    },

    extract() {
        const data = {
            title: "",
            description: "",
            thumbnail: "",
            url: window.location.href,
            platform: "Website",
            platformIcon: "🌐",
            autoTags: [],
            attachments: [{ type: "LINK", url: window.location.href }],
        };

        // Try JSON-LD first
        const jsonLd = this._extractJsonLd();
        if (jsonLd) {
            data.title = jsonLd.title || "";
            data.description = jsonLd.description || "";
            data.thumbnail = jsonLd.image || "";
            if (jsonLd.keywords) {
                data.autoTags.push(...jsonLd.keywords.split(",").map(k => k.trim()).filter(Boolean).slice(0, 5));
            }
        }

        // Open Graph tags (override if better)
        data.title = data.title || this._getMeta("og:title") || "";
        data.description = data.description || this._getMeta("og:description") || "";
        data.thumbnail = data.thumbnail || this._getMeta("og:image") || "";

        const siteName = this._getMeta("og:site_name");
        if (siteName) {
            data.platform = siteName;
            data.autoTags.push(siteName.toLowerCase().replace(/\s+/g, "-"));
        }

        // Twitter Card
        data.title = data.title || this._getMeta("twitter:title") || "";
        data.description = data.description || this._getMeta("twitter:description") || "";
        data.thumbnail = data.thumbnail || this._getMeta("twitter:image") || "";

        // Standard meta tags
        data.title = data.title || document.title || "";
        data.description = data.description || this._getMeta("description") || "";

        // Keywords meta
        const keywords = this._getMeta("keywords");
        if (keywords && data.autoTags.length === 0) {
            data.autoTags.push(...keywords.split(",").map(k => k.trim()).filter(Boolean).slice(0, 5));
        }

        // DOM heuristic fallback
        if (!data.title) {
            const h1 = document.querySelector("h1");
            if (h1) data.title = h1.textContent.trim();
        }

        if (!data.description) {
            const p = document.querySelector("article p, main p, .content p, p");
            if (p) data.description = p.textContent.trim().slice(0, 500);
        }

        if (!data.thumbnail) {
            const img = document.querySelector('article img[src], main img[src], img[src][width]');
            if (img && img.naturalWidth >= 200) {
                data.thumbnail = img.src;
            }
        }

        // Add thumbnail as IMAGE attachment
        if (data.thumbnail) {
            data.attachments.push({ type: "IMAGE", url: data.thumbnail });
        }

        // Auto-tag from domain
        const domain = window.location.hostname.replace("www.", "").split(".")[0];
        if (domain && !data.autoTags.includes(domain)) {
            data.autoTags.push(domain);
        }

        // Clean up
        data.title = data.title.slice(0, 200);
        data.description = data.description.slice(0, 1000);
        data.autoTags = [...new Set(data.autoTags)].slice(0, 8);

        return data;
    },

    // ─── Helpers ─────────────────────────────────────────────
    _getMeta(name) {
        const el =
            document.querySelector(`meta[property="${name}"]`) ||
            document.querySelector(`meta[name="${name}"]`);
        return el ? el.getAttribute("content") : "";
    },

    _extractJsonLd() {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const json = JSON.parse(script.textContent);
                const items = Array.isArray(json) ? json : [json];
                for (const item of items) {
                    if (item.name || item.headline) {
                        return {
                            title: item.name || item.headline || "",
                            description: item.description || item.abstract || "",
                            image: typeof item.image === "string" ? item.image : (item.image?.url || item.thumbnailUrl || ""),
                            keywords: item.keywords || "",
                        };
                    }
                }
            } catch { }
        }
        return null;
    },
};
