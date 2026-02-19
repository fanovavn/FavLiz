// ═══════════════════════════════════════════════════════════════
// Jobs Extractor — LinkedIn, Indeed, TopCV
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.jobs = {
    name: "jobs",
    platform: "Jobs",
    icon: "💼",
    isFeed: false,

    canHandle() {
        const host = window.location.hostname;
        return (
            host.includes("linkedin.com") ||
            host.includes("indeed.") ||
            host.includes("topcv.vn")
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
        let platformName = "Jobs";
        const autoTags = [];

        if (host.includes("linkedin.com")) {
            platformName = "LinkedIn";
            autoTags.push("linkedin");
            const path = window.location.pathname;
            if (path.includes("/jobs/")) autoTags.push("job");
            else if (path.includes("/posts/") || path.includes("/feed/")) autoTags.push("post");
            else if (path.includes("/in/")) autoTags.push("profile");
            else autoTags.push("article");
        } else if (host.includes("indeed.")) {
            platformName = "Indeed";
            autoTags.push("indeed", "job");
        } else if (host.includes("topcv.vn")) {
            platformName = "TopCV";
            autoTags.push("topcv", "job");
        }

        return {
            title: title.slice(0, 200),
            description: description.slice(0, 1000),
            thumbnail,
            url,
            platform: platformName,
            platformIcon: "💼",
            autoTags: [...new Set(autoTags)].slice(0, 8),
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },
};
