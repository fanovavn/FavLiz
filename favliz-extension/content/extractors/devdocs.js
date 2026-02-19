// ═══════════════════════════════════════════════════════════════
// DevDocs Extractor — MDN, Dev.to, GitLab, StackOverflow, Substack, etc.
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.devdocs = {
    name: "devdocs",
    platform: "Dev",
    icon: "📚",

    canHandle() {
        const host = window.location.hostname;
        return (
            host.includes("developer.mozilla.org") ||
            host.includes("dev.to") ||
            host.includes("gitlab.com") ||
            host.includes("stackoverflow.com") ||
            host.includes("stackexchange.com") ||
            host.includes("substack.com") ||
            host.includes("theverge.com") ||
            host.includes("techcrunch.com") ||
            host.includes("quora.com")
        );
    },

    extract() {
        const host = window.location.hostname;
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const url = window.location.href;
        let title = meta("og:title") || document.title;
        let description = meta("og:description") || "";
        let thumbnail = meta("og:image") || "";
        let platformName = "Dev";
        const autoTags = [];

        // ─── MDN ─────────────────────────────────────
        if (host.includes("developer.mozilla.org")) {
            platformName = "MDN";
            autoTags.push("mdn", "docs");
            const path = window.location.pathname;
            if (path.includes("/CSS/")) autoTags.push("css");
            else if (path.includes("/JavaScript/")) autoTags.push("javascript");
            else if (path.includes("/HTML/")) autoTags.push("html");
            else if (path.includes("/API/")) autoTags.push("web-api");
        }

        // ─── Dev.to ──────────────────────────────────
        else if (host.includes("dev.to")) {
            platformName = "Dev.to";
            autoTags.push("devto", "article");
            const tagEls = document.querySelectorAll('.crayons-tag, a[href^="/t/"]');
            tagEls.forEach((el) => {
                const tag = el.textContent.trim().replace("#", "");
                if (tag && autoTags.length < 8) autoTags.push(tag);
            });
        }

        // ─── GitLab ──────────────────────────────────
        else if (host.includes("gitlab.com")) {
            platformName = "GitLab";
            autoTags.push("gitlab");
            const path = window.location.pathname;
            if (path.includes("/-/issues/")) autoTags.push("issue");
            else if (path.includes("/-/merge_requests/")) autoTags.push("merge-request");
            else autoTags.push("repo");
        }

        // ─── Stack Overflow ──────────────────────────
        else if (host.includes("stackoverflow.com") || host.includes("stackexchange.com")) {
            platformName = "StackOverflow";
            autoTags.push("stackoverflow", "code");
            const tagEls = document.querySelectorAll(".js-post-tag-list-wrapper .post-tag, .s-tag");
            tagEls.forEach((el) => {
                const tag = el.textContent.trim();
                if (tag && autoTags.length < 8) autoTags.push(tag);
            });
        }

        // ─── Substack ───────────────────────────────
        else if (host.includes("substack.com")) {
            platformName = "Substack";
            autoTags.push("substack", "newsletter");
        }

        // ─── The Verge ──────────────────────────────
        else if (host.includes("theverge.com")) {
            platformName = "The Verge";
            autoTags.push("theverge", "tech", "news");
        }

        // ─── TechCrunch ─────────────────────────────
        else if (host.includes("techcrunch.com")) {
            platformName = "TechCrunch";
            autoTags.push("techcrunch", "tech", "news");
        }

        // ─── Quora ──────────────────────────────────
        else if (host.includes("quora.com")) {
            platformName = "Quora";
            autoTags.push("quora", "qa");
        }

        return {
            title: title.replace(/ - [^-]+$/, "").trim().slice(0, 200),
            description: description.slice(0, 1000),
            thumbnail,
            url,
            platform: platformName,
            platformIcon: this._getIcon(platformName),
            autoTags: [...new Set(autoTags)].slice(0, 8),
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },

    _getIcon(platform) {
        const icons = {
            MDN: "📚", "Dev.to": "👩‍💻", GitLab: "🦊", StackOverflow: "📋",
            Substack: "📬", "The Verge": "📰", TechCrunch: "📰", Quora: "❓"
        };
        return icons[platform] || "📚";
    },
};
