// ═══════════════════════════════════════════════════════════════
// Social Media Extractor — Twitter/X, Threads, Pinterest, Tumblr
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.social = {
    name: "social",
    platform: "Social",
    icon: "🌐",
    isFeed: true,

    canHandle() {
        const host = window.location.hostname;
        return (
            host.includes("twitter.com") ||
            host.includes("x.com") ||
            host.includes("threads.net") ||
            host.includes("pinterest.") ||
            host.includes("tumblr.com")
        );
    },

    extract() {
        const host = window.location.hostname;
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const url = meta("og:url") || window.location.href;
        let title = meta("og:title") || document.title;
        let description = meta("og:description") || "";
        let thumbnail = meta("og:image") || "";
        let platformName = "Social";
        const autoTags = [];

        if (host.includes("twitter.com") || host.includes("x.com")) {
            platformName = "Twitter";
            autoTags.push("twitter");
            // Try to get tweet text from DOM
            const tweetEl = document.querySelector('[data-testid="tweetText"]');
            if (tweetEl) {
                description = tweetEl.textContent.trim();
                if (!title || title.includes(" / X")) {
                    title = description.slice(0, 100);
                }
            }
            // Extract hashtags
            const hashtags = description.match(/#\w+/g);
            if (hashtags) autoTags.push(...hashtags.map(h => h.replace("#", "")).slice(0, 3));
        } else if (host.includes("threads.net")) {
            platformName = "Threads";
            autoTags.push("threads");
        } else if (host.includes("pinterest.")) {
            platformName = "Pinterest";
            autoTags.push("pinterest", "inspiration");
        } else if (host.includes("tumblr.com")) {
            platformName = "Tumblr";
            autoTags.push("tumblr");
        }

        return {
            title: title.slice(0, 200),
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

    extractFromPost(postEl) {
        const host = window.location.hostname;

        if (host.includes("twitter.com") || host.includes("x.com")) {
            const tweetText = postEl.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || "";
            const username = postEl.querySelector('[data-testid="User-Name"] a')?.textContent?.trim() || "";
            const img = postEl.querySelector('[data-testid="tweetPhoto"] img');
            const thumbnail = img?.src || "";
            const linkEl = postEl.querySelector('a[href*="/status/"]');
            const postUrl = linkEl ? `https://x.com${linkEl.getAttribute("href")}` : window.location.href;

            return {
                title: username ? `${username}: ${tweetText.slice(0, 80)}` : tweetText.slice(0, 100),
                description: tweetText,
                thumbnail,
                url: postUrl,
                platform: "Twitter",
                platformIcon: "🐦",
                autoTags: ["twitter", ...(username ? [username.replace("@", "")] : [])],
                attachments: [
                    { type: "LINK", url: postUrl },
                    ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
                ],
            };
        }

        // Fallback for other social platforms
        return this.extract();
    },

    getPostSelector() {
        const host = window.location.hostname;
        if (host.includes("twitter.com") || host.includes("x.com")) {
            return '[data-testid="tweet"]';
        }
        return null;
    },

    getButtonAnchor(postEl) {
        const host = window.location.hostname;
        if (host.includes("twitter.com") || host.includes("x.com")) {
            return postEl.querySelector('[data-testid="bookmark"], [role="group"]');
        }
        return null;
    },

    _getIcon(platform) {
        const icons = { Twitter: "🐦", Threads: "🧵", Pinterest: "📌", Tumblr: "📓" };
        return icons[platform] || "🌐";
    },
};
