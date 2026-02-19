// ═══════════════════════════════════════════════════════════════
// Reddit Extractor — Supports feed (inline buttons) + single post
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.reddit = {
    name: "reddit",
    platform: "Reddit",
    icon: "💬",
    isFeed: true,

    canHandle() {
        return window.location.hostname.includes("reddit.com");
    },

    // Extract from current page (single post or fallback)
    extract() {
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const title = meta("og:title") || document.title;
        const description = meta("og:description") || "";
        const thumbnail = meta("og:image") || "";
        const url = window.location.href;

        const subreddit = url.match(/\/r\/([^/]+)/)?.[1] || "";
        const autoTags = ["reddit"];
        if (subreddit) autoTags.push(`r/${subreddit}`);

        return {
            title: title.replace(" : r/" + subreddit, "").trim(),
            description,
            thumbnail,
            url,
            platform: "Reddit",
            platformIcon: "💬",
            autoTags,
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },

    // Extract from a specific post element (for inline button on feed)
    extractFromPost(postEl) {
        // Try shreddit-post (new Reddit)
        const shredditPost = postEl.closest("shreddit-post") || postEl.querySelector("shreddit-post");
        if (shredditPost) {
            const title = shredditPost.getAttribute("post-title") || "";
            const permalink = shredditPost.getAttribute("permalink") || shredditPost.getAttribute("content-href") || "";
            const author = shredditPost.getAttribute("author") || "";
            const subreddit = shredditPost.getAttribute("subreddit-prefixed-name") || "";
            const thumbnail = shredditPost.querySelector("img[src*='redd']")?.src ||
                shredditPost.querySelector("img[src*='preview']")?.src || "";

            const url = permalink.startsWith("http") ? permalink : `https://www.reddit.com${permalink}`;
            const autoTags = ["reddit"];
            if (subreddit) autoTags.push(subreddit.toLowerCase());

            return {
                title,
                description: `${subreddit} • u/${author}`,
                thumbnail,
                url,
                platform: "Reddit",
                platformIcon: "💬",
                autoTags,
                attachments: [
                    { type: "LINK", url },
                    ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
                ],
            };
        }

        // Fallback: old Reddit structure
        const titleEl = postEl.querySelector('[data-testid="post-title"], h3, a[data-click-id="body"]');
        const title = titleEl?.textContent?.trim() || "";
        const linkEl = postEl.querySelector('a[data-click-id="body"], a[href*="/comments/"]');
        const href = linkEl?.href || window.location.href;

        return {
            title,
            description: "",
            thumbnail: "",
            url: href,
            platform: "Reddit",
            platformIcon: "💬",
            autoTags: ["reddit"],
            attachments: [{ type: "LINK", url: href }],
        };
    },

    // Get post selectors for inline button injection
    getPostSelector() {
        return "shreddit-post, [data-testid='post-container'], .Post";
    },

    getButtonAnchor(postEl) {
        // Place button near the action bar
        return postEl.querySelector("shreddit-post-overflow-menu, [data-testid='post-tools'], .Post__actions");
    },
};
