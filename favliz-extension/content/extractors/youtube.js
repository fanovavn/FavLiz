// ═══════════════════════════════════════════════════════════════
// YouTube Extractor
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.youtube = {
    name: "youtube",
    platform: "YouTube",
    icon: "🎬",

    canHandle() {
        const host = window.location.hostname;
        return host.includes("youtube.com") || host.includes("youtu.be");
    },

    extract() {
        const url = window.location.href;
        const videoId = this._getVideoId(url);
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        // Title
        const titleEl = document.querySelector("#title h1 yt-formatted-string, #title h1");
        const title = titleEl?.textContent?.trim() || meta("og:title") || meta("title") || document.title;

        // Channel
        const channelEl = document.querySelector("#channel-name a, ytd-video-owner-renderer #text a, #owner #text a");
        const channel = channelEl?.textContent?.trim() || "";

        // Description
        const descMeta = meta("og:description") || meta("description") || "";
        const desc = channel ? `🎬 ${channel}${descMeta ? " — " + descMeta : ""}` : descMeta;

        // Thumbnail
        const thumbnail = videoId
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            : meta("og:image") || "";

        // Tags
        const autoTags = ["youtube", "video"];
        if (channel) autoTags.push(channel.toLowerCase().replace(/\s+/g, "-"));

        return {
            title: title.replace(" - YouTube", "").trim(),
            description: desc.slice(0, 1000),
            thumbnail,
            url,
            platform: "YouTube",
            platformIcon: "🎬",
            autoTags,
            attachments: [
                { type: "LINK", url },
            ],
        };
    },

    _getVideoId(url) {
        const match = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    },
};
