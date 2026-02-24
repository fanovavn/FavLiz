import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        // Validate URL format
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Invalid URL format" },
                { status: 400 }
            );
        }

        // Fetch the page HTML
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; FavLiz/1.0; +https://www.favliz.com)",
                Accept: "text/html,application/xhtml+xml",
            },
            redirect: "follow",
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch URL" },
                { status: 502 }
            );
        }

        const html = await response.text();

        // Parse meta tags
        const getMetaContent = (property: string): string => {
            const patterns = [
                new RegExp(
                    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
                    "i"
                ),
                new RegExp(
                    `<meta[^>]+content=["']([^"']*?)["'][^>]+(?:property|name)=["']${property}["']`,
                    "i"
                ),
            ];
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match?.[1]) return decodeHtmlEntities(match[1].trim());
            }
            return "";
        };

        // Extract title
        let title =
            getMetaContent("og:title") || getMetaContent("twitter:title");
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            if (titleMatch) title = decodeHtmlEntities(titleMatch[1].trim());
        }

        // Extract description
        const description =
            getMetaContent("og:description") ||
            getMetaContent("twitter:description") ||
            getMetaContent("description");

        // Extract thumbnail
        let thumbnail =
            getMetaContent("og:image") ||
            getMetaContent("twitter:image") ||
            getMetaContent("twitter:image:src");

        // Make thumbnail absolute URL if relative
        if (thumbnail && !thumbnail.startsWith("http")) {
            try {
                thumbnail = new URL(thumbnail, url).href;
            } catch {
                // ignore
            }
        }

        // Detect site name
        const siteName = getMetaContent("og:site_name") || "";

        // Detect platform and auto-tags
        const host = parsedUrl.hostname.replace("www.", "");
        const platformMap: Record<string, { name: string; icon: string }> = {
            "youtube.com": { name: "YouTube", icon: "🎬" },
            "youtu.be": { name: "YouTube", icon: "🎬" },
            "facebook.com": { name: "Facebook", icon: "📘" },
            "fb.com": { name: "Facebook", icon: "📘" },
            "instagram.com": { name: "Instagram", icon: "📸" },
            "tiktok.com": { name: "TikTok", icon: "🎵" },
            "reddit.com": { name: "Reddit", icon: "🔴" },
            "twitter.com": { name: "Twitter/X", icon: "🐦" },
            "x.com": { name: "Twitter/X", icon: "🐦" },
            "github.com": { name: "GitHub", icon: "🐙" },
            "medium.com": { name: "Medium", icon: "📝" },
            "linkedin.com": { name: "LinkedIn", icon: "💼" },
            "shopee.vn": { name: "Shopee", icon: "🛒" },
            "lazada.vn": { name: "Lazada", icon: "🛒" },
            "tiki.vn": { name: "Tiki", icon: "🛒" },
        };

        let platform = siteName || host;
        let platformIcon = "🌐";
        const autoTags: string[] = [];

        for (const [domain, info] of Object.entries(platformMap)) {
            if (host.includes(domain)) {
                platform = info.name;
                platformIcon = info.icon;
                autoTags.push(info.name);
                break;
            }
        }

        return NextResponse.json({
            title: title || host + parsedUrl.pathname,
            description: description || "",
            thumbnail: thumbnail || "",
            url,
            platform,
            platformIcon,
            siteName,
            autoTags,
        });
    } catch (err) {
        console.error("[fetch-url-metadata] Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch metadata" },
            { status: 500 }
        );
    }
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
}
