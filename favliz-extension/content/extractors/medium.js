// ═══════════════════════════════════════════════════════════════
// Medium Extractor
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.medium = {
    name: "medium",
    platform: "Medium",
    icon: "📝",

    canHandle() {
        const host = window.location.hostname;
        if (host.includes("medium.com")) return true;
        // Check for Medium custom domains
        const appName = document.querySelector('meta[property="al:android:app_name"]');
        return appName?.getAttribute("content") === "Medium";
    },

    extract() {
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const title = meta("og:title") || document.querySelector("h1")?.textContent?.trim() || document.title;
        const description = meta("og:description") || meta("description") || "";
        const thumbnail = meta("og:image") || "";
        const url = meta("og:url") || window.location.href;

        const authorEl = document.querySelector('meta[name="author"]');
        const author = authorEl?.getAttribute("content") || "";

        const autoTags = ["medium", "article"];
        if (author) autoTags.push(author.toLowerCase().replace(/\s+/g, "-"));

        return {
            title,
            description: author ? `📝 by ${author} — ${description}` : description,
            thumbnail,
            url,
            platform: "Medium",
            platformIcon: "📝",
            autoTags,
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },
};
