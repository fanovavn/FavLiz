// ═══════════════════════════════════════════════════════════════
// Facebook Extractor — Supports feed inline buttons + single posts
// Updated for Facebook 2026 DOM (Vietnamese + English)
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.facebook = {
    name: "facebook",
    platform: "Facebook",
    icon: "📘",
    isFeed: true,

    canHandle() {
        return window.location.hostname.includes("facebook.com");
    },

    extract() {
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const title = meta("og:title") || document.title || "Facebook Post";
        const description = meta("og:description") || "";
        const thumbnail = meta("og:image") || "";
        const url = meta("og:url") || window.location.href;

        return {
            title,
            description,
            thumbnail,
            url,
            platform: "Facebook",
            platformIcon: "📘",
            autoTags: ["facebook"],
            attachments: [
                { type: "LINK", url },
            ],
        };
    },

    extractFromPost(postEl) {
        // Get author name — try multiple selectors
        const authorEl = postEl.querySelector(
            'h3 a, h4 a, strong a, ' +
            'a[role="link"] > strong, ' +
            '[data-ad-rendering-role="profile_name"] a strong'
        );
        const author = authorEl?.textContent?.trim() || "";

        // Get post text
        const textEl = postEl.querySelector(
            '[data-ad-preview="message"], ' +
            '[data-ad-comet-preview="message"], ' +
            'div[dir="auto"]'
        );
        const text = textEl?.textContent?.trim()?.slice(0, 300) || "";

        // ── Find post permalink (timestamp link) ────────────
        // Facebook timestamps link to the post's permalink
        // They contain patterns like /posts/, /watch, /permalink/, etc.
        let postLink = "";

        const permalinkPatterns = [
            '/posts/',
            '/permalink/',
            'story_fbid',
            '/watch/',
            '/watch?',
            '/videos/',
            '/reel/',
            '/photo/',
            '/photos/',
            'fbid=',
        ];

        // Strategy 1: Find links matching permalink patterns
        const allLinks = postEl.querySelectorAll('a[href*="facebook.com"]');
        for (const a of allLinks) {
            const href = a.href || "";
            // Skip profile links, group links (without permalink), and follow buttons
            if (href.match(/facebook\.com\/[^/]+\/?$/) && !href.includes("watch")) continue;
            if (href.includes('/groups/') && !permalinkPatterns.some(p => href.includes(p))) continue;

            if (permalinkPatterns.some(pattern => href.includes(pattern))) {
                postLink = href;
                break;
            }
        }

        // Strategy 2: If no match, look for any link with numeric ID patterns
        if (!postLink) {
            for (const a of allLinks) {
                const href = a.href || "";
                // Links with long numeric IDs are often post permalinks
                if (href.match(/facebook\.com\/.*\d{10,}/)) {
                    postLink = href;
                    break;
                }
            }
        }

        // Fallback: current page URL
        if (!postLink) {
            postLink = window.location.href;
        }

        // Clean up tracking params from the URL
        try {
            const urlObj = new URL(postLink);
            ['__cft__', '__tn__', '__cft__[0]', 'mibextid'].forEach(p => urlObj.searchParams.delete(p));
            postLink = urlObj.toString();
        } catch (e) { /* keep as-is */ }

        // Get thumbnail
        const imgEl = postEl.querySelector(
            'img[src*="scontent"], ' +
            'img[src*="fbcdn"], ' +
            'video[poster]'
        );
        const thumbnail = imgEl?.src || imgEl?.getAttribute("poster") || "";

        const title = author
            ? `${author}: ${text.slice(0, 80)}`
            : (text.slice(0, 100) || "Facebook Post");

        return {
            title,
            description: text,
            thumbnail,
            url: postLink,
            platform: "Facebook",
            platformIcon: "📘",
            autoTags: ["facebook"],
            attachments: [
                { type: "LINK", url: postLink },
            ],
        };
    },

    getPostSelector() {
        // Facebook 2026: posts are div[role="article"] or div[data-pagelet^="FeedUnit_"]
        return 'div[role="article"], div[data-pagelet^="FeedUnit_"]';
    },

    getButtonAnchor(postEl) {
        // "..." menu button — supports Vietnamese and English aria labels
        return postEl.querySelector(
            '[aria-label="Actions for this post"], ' +
            '[aria-label="Hành động với bài viết này"], ' +
            '[aria-label="Hành động với bài viết"], ' +
            '[aria-label="Actions with this post"], ' +
            '[aria-haspopup="menu"][role="button"]'
        );
    },
};
