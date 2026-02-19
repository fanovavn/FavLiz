// ═══════════════════════════════════════════════════════════════
// GitHub Extractor
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.github = {
    name: "github",
    platform: "GitHub",
    icon: "💻",

    canHandle() {
        return window.location.hostname.includes("github.com");
    },

    extract() {
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        const url = window.location.href;
        const path = window.location.pathname;

        const title = meta("og:title") || document.title;
        const description = meta("og:description") || "";
        const thumbnail = meta("og:image") || "";

        // Determine content type
        let type = "repo";
        if (path.includes("/issues/")) type = "issue";
        else if (path.includes("/pull/")) type = "pr";
        else if (path.includes("/gist/") || window.location.hostname === "gist.github.com") type = "gist";
        else if (path.includes("/discussions/")) type = "discussion";

        const autoTags = ["github", type];

        // Extract repo topics
        const topicEls = document.querySelectorAll('.topic-tag, a[data-octo-click="topic_click"]');
        topicEls.forEach((el) => {
            const topic = el.textContent.trim();
            if (topic && autoTags.length < 8) autoTags.push(topic);
        });

        // Extract language
        const langEl = document.querySelector('[data-ga-click*="language"], .repository-lang-stats-graph span');
        if (langEl) {
            const lang = langEl.textContent.trim().toLowerCase();
            if (lang && !autoTags.includes(lang)) autoTags.push(lang);
        }

        // Stars/forks for description
        const starsEl = document.querySelector('#repo-stars-counter-star, .social-count');
        const stars = starsEl?.getAttribute("title") || starsEl?.textContent?.trim() || "";

        let enrichedDesc = description;
        if (type === "repo" && stars) {
            enrichedDesc = `💻 ⭐ ${stars} stars — ${description}`;
        }

        return {
            title: title.replace(" · GitHub", "").trim(),
            description: enrichedDesc.slice(0, 1000),
            thumbnail,
            url,
            platform: "GitHub",
            platformIcon: "💻",
            autoTags: [...new Set(autoTags)].slice(0, 8),
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },
};
