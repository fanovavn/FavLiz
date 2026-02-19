// ═══════════════════════════════════════════════════════════════
// Travel Extractor — Google Maps, TripAdvisor, Booking, Airbnb
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.travel = {
    name: "travel",
    platform: "Travel",
    icon: "📍",

    canHandle() {
        const host = window.location.hostname;
        return (
            host.includes("google.com/maps") ||
            host.includes("maps.google.") ||
            host.includes("tripadvisor.") ||
            host.includes("booking.com") ||
            host.includes("airbnb.")
        );
    },

    extract() {
        const host = window.location.hostname;
        const url = window.location.href;
        const meta = (name) => {
            const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
            return el ? el.getAttribute("content") : "";
        };

        let title = meta("og:title") || document.title;
        let description = meta("og:description") || "";
        let thumbnail = meta("og:image") || "";
        let platformName = "Travel";
        const autoTags = ["travel"];

        if (host.includes("google.") && url.includes("/maps")) {
            platformName = "Google Maps";
            autoTags.push("maps", "place");
            const placeTitle = document.querySelector("h1.fontHeadlineLarge, h1");
            if (placeTitle) title = placeTitle.textContent.trim();
        } else if (host.includes("tripadvisor.")) {
            platformName = "TripAdvisor";
            autoTags.push("tripadvisor");
        } else if (host.includes("booking.com")) {
            platformName = "Booking.com";
            autoTags.push("booking", "hotel");
        } else if (host.includes("airbnb.")) {
            platformName = "Airbnb";
            autoTags.push("airbnb", "accommodation");
        }

        return {
            title: title.slice(0, 200),
            description: description.slice(0, 1000),
            thumbnail,
            url,
            platform: platformName,
            platformIcon: "📍",
            autoTags: [...new Set(autoTags)].slice(0, 8),
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },
};
