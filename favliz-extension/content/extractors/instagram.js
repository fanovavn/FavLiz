// ═══════════════════════════════════════════════════════════════
// Instagram Extractor — Feed inline buttons + single posts
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.instagram = {
    name: "instagram",
    platform: "Instagram",
    icon: "📸",
    isFeed: true,

    canHandle() {
        return window.location.hostname.includes("instagram.com");
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

        const usernameMatch = url.match(/instagram\.com\/([^/?]+)/);
        const username = usernameMatch ? usernameMatch[1] : "";

        const isReel = url.includes("/reel/");
        const autoTags = ["instagram", isReel ? "reel" : "post"];
        if (username && username !== "p" && username !== "reel") {
            autoTags.push(`@${username}`);
        }

        return {
            title,
            description,
            thumbnail,
            url,
            platform: "Instagram",
            platformIcon: "📸",
            autoTags,
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },

    extractFromPost(postEl) {
        // Get username
        const usernameEl = postEl.querySelector('a[href*="/"] > span, header a');
        const username = usernameEl?.textContent?.trim() || "";

        // Get caption
        const captionEl = postEl.querySelector('div[dir] span, ul li span');
        const caption = captionEl?.textContent?.trim()?.slice(0, 200) || "";

        // Get image
        const imgEl = postEl.querySelector('img[srcset], img[src*="instagram"]');
        const thumbnail = imgEl?.src || "";

        // Get post link
        const linkEl = postEl.querySelector('a[href*="/p/"], a[href*="/reel/"]');
        const postLink = linkEl?.href || window.location.href;

        const title = username ? `@${username}: ${caption.slice(0, 80)}` : (caption.slice(0, 100) || "Instagram Post");

        return {
            title,
            description: caption,
            thumbnail,
            url: postLink,
            platform: "Instagram",
            platformIcon: "📸",
            autoTags: ["instagram", username ? `@${username}` : "post"],
            attachments: [
                { type: "LINK", url: postLink },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },

    getPostSelector() {
        return 'article[role="presentation"], article';
    },

    getButtonAnchor(postEl) {
        return postEl.querySelector('[aria-label="More options"], button[type="button"] svg')?.parentElement;
    },
};
