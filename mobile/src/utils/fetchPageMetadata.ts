/**
 * Fetch page metadata from a URL (similar to Chrome extension's generic extractor).
 * Extracts: title, description, thumbnail (og:image), and auto-tags from meta tags.
 */

export interface PageMetadata {
    title: string;
    description: string;
    thumbnail: string;
    siteName: string;
    autoTags: string[];
}

/**
 * Fetches and parses HTML from a URL to extract Open Graph, Twitter Card,
 * and standard meta tags for auto-filling item form fields.
 */
export async function fetchPageMetadata(url: string): Promise<PageMetadata> {
    const result: PageMetadata = {
        title: "",
        description: "",
        thumbnail: "",
        siteName: "",
        autoTags: [],
    };

    try {
        // Fetch the HTML page with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                Accept: "text/html,application/xhtml+xml",
            },
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) return result;

        const html = await response.text();

        // ─── Extract meta tags using regex (no DOM parser in RN) ───

        // Open Graph
        result.title = extractMeta(html, "og:title") || "";
        result.description = extractMeta(html, "og:description") || "";
        result.thumbnail = extractMeta(html, "og:image") || "";
        result.siteName = extractMeta(html, "og:site_name") || "";

        // Twitter Card fallback
        if (!result.title) result.title = extractMeta(html, "twitter:title") || "";
        if (!result.description) result.description = extractMeta(html, "twitter:description") || "";
        if (!result.thumbnail) result.thumbnail = extractMeta(html, "twitter:image") || "";

        // Standard meta fallback
        if (!result.title) result.title = extractTitle(html);
        if (!result.description) result.description = extractMeta(html, "description") || "";

        // Extract keywords for auto-tags
        const keywords = extractMeta(html, "keywords");
        if (keywords) {
            result.autoTags.push(
                ...keywords
                    .split(",")
                    .map((k) => k.trim().toLowerCase())
                    .filter(Boolean)
                    .slice(0, 5)
            );
        }

        // Add site name as tag
        if (result.siteName) {
            const siteTag = result.siteName.toLowerCase().replace(/\s+/g, "-");
            if (!result.autoTags.includes(siteTag)) {
                result.autoTags.push(siteTag);
            }
        }

        // Add domain as tag
        try {
            const domain = new URL(url).hostname.replace("www.", "").split(".")[0];
            if (domain && !result.autoTags.includes(domain)) {
                result.autoTags.push(domain);
            }
        } catch { }

        // Extract JSON-LD data
        const jsonLd = extractJsonLd(html);
        if (jsonLd) {
            if (!result.title && jsonLd.title) result.title = jsonLd.title;
            if (!result.description && jsonLd.description) result.description = jsonLd.description;
            if (!result.thumbnail && jsonLd.image) result.thumbnail = jsonLd.image;
            if (jsonLd.keywords) {
                const jTags = jsonLd.keywords
                    .split(",")
                    .map((k: string) => k.trim().toLowerCase())
                    .filter(Boolean);
                for (const t of jTags) {
                    if (!result.autoTags.includes(t)) result.autoTags.push(t);
                }
            }
        }

        // Clean up
        result.title = cleanText(result.title).slice(0, 200);
        result.description = cleanText(result.description).slice(0, 1000);
        result.autoTags = [...new Set(result.autoTags)].slice(0, 8);
    } catch (err) {
        console.log("[fetchPageMetadata] Error fetching:", url, err);
    }

    return result;
}

// ─── Helper functions ──────────────────────────────────────

function extractMeta(html: string, name: string): string {
    // Match <meta property="name" content="value" /> or <meta name="name" content="value" />
    const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(name)}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRegex(name)}["']`, "i"),
    ];

    for (const regex of patterns) {
        const match = html.match(regex);
        if (match && match[1]) {
            return decodeHtmlEntities(match[1]);
        }
    }
    return "";
}

function extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function extractJsonLd(html: string): { title?: string; description?: string; image?: string; keywords?: string } | null {
    const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        try {
            const json = JSON.parse(match[1]);
            const items = Array.isArray(json) ? json : [json];
            for (const item of items) {
                if (item.name || item.headline) {
                    return {
                        title: item.name || item.headline || "",
                        description: item.description || item.abstract || "",
                        image: typeof item.image === "string" ? item.image : item.image?.url || item.thumbnailUrl || "",
                        keywords: typeof item.keywords === "string" ? item.keywords : "",
                    };
                }
            }
        } catch { }
    }
    return null;
}

function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
}

function cleanText(str: string): string {
    return str.replace(/\s+/g, " ").trim();
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
