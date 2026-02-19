// ═══════════════════════════════════════════════════════════════
// TikTok Extractor
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.tiktok = {
    name: "tiktok",
    platform: "TikTok",
    icon: "🎵",

    canHandle() {
        return window.location.hostname.includes("tiktok.com");
    },

    extract() {
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const title = meta("og:title") || document.title;
        const description = meta("og:description") || "";
        const thumbnail = meta("og:image") || "";
        const url = meta("og:url") || window.location.href;

        // Try to get creator username
        const creatorMatch = url.match(/@([^/]+)/);
        const creator = creatorMatch ? creatorMatch[1] : "";

        const autoTags = ["tiktok", "video"];
        if (creator) autoTags.push(`@${creator}`);

        return {
            title,
            description: creator ? `🎵 @${creator} — ${description}` : description,
            thumbnail,
            url,
            platform: "TikTok",
            platformIcon: "🎵",
            autoTags,
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },
};
