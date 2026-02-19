// ═══════════════════════════════════════════════════════════════
// E-Commerce Extractor — Amazon, Shopee, Lazada, eBay, AliExpress, Tiki
// ═══════════════════════════════════════════════════════════════

window.FavLizExtractors = window.FavLizExtractors || {};

window.FavLizExtractors.ecommerce = {
    name: "ecommerce",
    platform: "Shopping",
    icon: "🛒",

    canHandle() {
        const host = window.location.hostname;
        return (
            host.includes("amazon.") ||
            host.includes("shopee.") ||
            host.includes("lazada.") ||
            host.includes("ebay.") ||
            host.includes("aliexpress.") ||
            host.includes("tiki.vn")
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
        let platformName = "Shopping";
        const autoTags = ["shopping"];

        // ─── Amazon ──────────────────────────────────
        if (host.includes("amazon.")) {
            platformName = "Amazon";
            autoTags.push("amazon");
            const prodTitle = document.querySelector("#productTitle");
            if (prodTitle) title = prodTitle.textContent.trim();
            const price = document.querySelector(".a-price .a-offscreen, #priceblock_ourprice, #price_inside_buybox");
            const brand = document.querySelector("#bylineInfo");
            const img = document.querySelector("#landingImage, #imgBlkFront");
            if (img) thumbnail = img.src || thumbnail;
            const parts = [];
            if (price) parts.push(`💰 ${price.textContent.trim()}`);
            if (brand) parts.push(brand.textContent.trim());
            if (parts.length) description = parts.join(" — ");
        }

        // ─── Shopee ──────────────────────────────────
        else if (host.includes("shopee.")) {
            platformName = "Shopee";
            autoTags.push("shopee");
        }

        // ─── Lazada ──────────────────────────────────
        else if (host.includes("lazada.")) {
            platformName = "Lazada";
            autoTags.push("lazada");
        }

        // ─── eBay ────────────────────────────────────
        else if (host.includes("ebay.")) {
            platformName = "eBay";
            autoTags.push("ebay");
            const prodTitle = document.querySelector("h1.x-item-title__mainTitle");
            if (prodTitle) title = prodTitle.textContent.trim();
        }

        // ─── AliExpress ─────────────────────────────
        else if (host.includes("aliexpress.")) {
            platformName = "AliExpress";
            autoTags.push("aliexpress");
        }

        // ─── Tiki ────────────────────────────────────
        else if (host.includes("tiki.vn")) {
            platformName = "Tiki";
            autoTags.push("tiki");
        }

        return {
            title: title.slice(0, 200),
            description: description.slice(0, 1000),
            thumbnail,
            url,
            platform: platformName,
            platformIcon: "🛒",
            autoTags: [...new Set(autoTags)].slice(0, 8),
            attachments: [
                { type: "LINK", url },
                ...(thumbnail ? [{ type: "IMAGE", url: thumbnail }] : []),
            ],
        };
    },
};
