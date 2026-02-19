// ═══════════════════════════════════════════════════════════════
// Extractor Router — Detect platform and pick best extractor
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractorRouter = {
    // Priority order — specific platforms first, generic last
    _order: [
        "youtube", "reddit", "tiktok", "facebook", "instagram",
        "medium", "github", "ecommerce", "travel", "social",
        "jobs", "devdocs", "generic"
    ],

    // Get the best extractor for current page
    getExtractor() {
        for (const name of this._order) {
            const extractor = window.FavLizExtractors[name];
            if (extractor && extractor.canHandle()) {
                return extractor;
            }
        }
        return window.FavLizExtractors.generic;
    },

    // Extract data from current page
    extractPageData() {
        const extractor = this.getExtractor();
        return extractor.extract();
    },

    // Extract data from a specific post element (for inline buttons)
    extractPostData(postEl) {
        const extractor = this.getExtractor();
        if (extractor.extractFromPost) {
            return extractor.extractFromPost(postEl);
        }
        return extractor.extract();
    },

    // Check if current page is a feed page with inline posts
    isFeedPage() {
        const extractor = this.getExtractor();
        return !!extractor.isFeed && !!extractor.getPostSelector;
    },

    // Get the CSS selector for post elements
    getPostSelector() {
        const extractor = this.getExtractor();
        return extractor.getPostSelector ? extractor.getPostSelector() : null;
    },

    // Get the anchor element inside a post for button placement
    getButtonAnchor(postEl) {
        const extractor = this.getExtractor();
        return extractor.getButtonAnchor ? extractor.getButtonAnchor(postEl) : null;
    },
};
