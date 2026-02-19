# FavLiz Chrome Extension — Field Mapping Plan

> Tài liệu mapping field từ các website sang FavLiz Item API

---

## 📌 FavLiz Item Model (Target)

| FavLiz Field | Type | Required | Mô tả |
|---|---|---|---|
| `title` | string | ✅ | Tiêu đề item |
| `description` | string | ❌ | Mô tả chi tiết |
| `thumbnail` | string (URL) | ❌ | Ảnh đại diện |
| `viewMode` | `PRIVATE` / `PUBLIC` | ✅ | Default: PRIVATE |
| `tagNames` | string[] | ✅ | Tags (auto-suggest theo platform) |
| `listIds` | string[] | ✅ | Chọn lists để lưu |
| `attachments` | `{type, url}[]` | ✅ | `LINK` = URL trang, `IMAGE` = ảnh |

> **Quy ước chung**: Attachment đầu tiên luôn là `{ type: "LINK", url: <current_page_url> }` — đây là link gốc của nội dung.

---

## 🔍 Phương pháp trích xuất

Mỗi website sẽ được extract theo **3 tầng ưu tiên**:

1. **Platform-specific selectors** — CSS/XPath selectors riêng cho từng website
2. **Structured data** — JSON-LD, Schema.org, oEmbed
3. **Meta tags fallback** — Open Graph, Twitter Card, standard meta tags

---

## 🎬 Nhóm 1: Video & Streaming

### YouTube (`youtube.com`, `youtu.be`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Video title | `meta[name="title"]` hoặc `#title h1 > yt-formatted-string` |
| `description` | Video description (cắt 500 chars) | `meta[name="description"]` hoặc `#description-inline-expander` |
| `thumbnail` | Video thumbnail HD | `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg` |
| `attachments[0]` | LINK: URL video | `{ type: "LINK", url: window.location.href }` |
| `attachments[1]` | IMAGE: Thumbnail | `{ type: "IMAGE", url: thumbnail_url }` |
| **Auto-tag** | `youtube`, `video`, channel name | |

> **Bonus metadata cho description**: Channel name, duration, view count, published date

---

### TikTok (`tiktok.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Video caption | `meta[property="og:title"]` hoặc `[data-e2e="browse-video-desc"]` |
| `description` | Caption + hashtags | `meta[property="og:description"]` |
| `thumbnail` | Video cover | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL video | `{ type: "LINK", url: canonical_url }` |
| **Auto-tag** | `tiktok`, `video`, creator username | |

> **Note**: TikTok dùng SSR nên meta tags khá đầy đủ.

---

### Vimeo (`vimeo.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Video title | `meta[property="og:title"]` |
| `description` | Video description | `meta[property="og:description"]` |
| `thumbnail` | Video thumbnail | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `vimeo`, `video` | |

---

### Facebook Video (`facebook.com/watch`, `/videos/`, `/reel/`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Post text (first line) hoặc "Video by {Author}" | `meta[property="og:title"]` |
| `description` | Post text | `meta[property="og:description"]` |
| `thumbnail` | Video thumbnail | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `facebook`, `video` | |

> **Fallback**: Facebook thường chặn scraping → dùng `document.title` + URL

---

### Instagram Reels (`instagram.com/reel/`, `/p/`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | "@{username}: {caption first 80 chars}" | `meta[property="og:title"]` |
| `description` | Full caption | `meta[property="og:description"]` |
| `thumbnail` | Post image/video thumbnail | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `instagram`, `reel` hoặc `post`, username | |

---

## 📝 Nhóm 2: Blog & Articles

### Medium (`medium.com`, custom domains)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Article title | `meta[property="og:title"]` hoặc `h1` |
| `description` | Article subtitle/excerpt | `meta[property="og:description"]` hoặc `meta[name="description"]` |
| `thumbnail` | Article hero image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL article | current URL |
| **Auto-tag** | `medium`, `article`, author name | |

> **Detection**: Kiểm tra `meta[property="al:android:app_name"][content="Medium"]` hoặc `link[href*="medium.com"]`

---

### Substack (`*.substack.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Post title | `meta[property="og:title"]` hoặc `h1.post-title` |
| `description` | Post subtitle | `meta[property="og:description"]` |
| `thumbnail` | Cover image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `substack`, `newsletter`, publication name | |

---

### The Verge (`theverge.com`) / TechCrunch (`techcrunch.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Article headline | `meta[property="og:title"]` |
| `description` | Excerpt | `meta[property="og:description"]` |
| `thumbnail` | Hero image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `{site_name}`, `tech`, `news` | |

---

### Dev.to (`dev.to`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Article title | `meta[property="og:title"]` hoặc `h1` |
| `description` | Article excerpt | `meta[property="og:description"]` |
| `thumbnail` | Cover image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `devto`, `dev`, article tags | |

> **Bonus**: Dev.to có JSON-LD với tags → auto-extract thành FavLiz tags

---

## 💬 Nhóm 3: Forum & Q/A

### Reddit (`reddit.com`, `old.reddit.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Post title | `meta[property="og:title"]` hoặc `[data-testid="post-title"]`, `shreddit-post[post-title]` |
| `description` | "r/{subreddit} • u/{author} • {score} points" + post text (cắt 500 chars) | `meta[property="og:description"]` + post body |
| `thumbnail` | Post thumbnail | `meta[property="og:image"]` hoặc post media |
| `attachments[0]` | LINK: URL post | current URL |
| **Auto-tag** | `reddit`, subreddit name (e.g. `r/webdev`) | |

> **Special cases**: Image post → thêm attachment IMAGE. Video post → chỉ LINK.

---

### Quora (`quora.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Question title | `meta[property="og:title"]` |
| `description` | Top answer excerpt | `meta[property="og:description"]` |
| `thumbnail` | Profile/answer image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `quora`, `qa` | |

---

### Stack Overflow (`stackoverflow.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Question title | `meta[property="og:title"]` hoặc `#question-header h1` |
| `description` | Question excerpt + accepted answer preview | `meta[property="og:description"]` |
| `thumbnail` | StackOverflow logo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `stackoverflow`, `code`, question tags (e.g. `javascript`, `python`) | |

> **Bonus**: Extract question tags từ `.js-post-tag-list-wrapper .post-tag` → dùng làm FavLiz tags

---

## 🛒 Nhóm 4: E-Commerce & Shopping

### Amazon (`amazon.com`, `amazon.co.jp`, `amazon.de`, ...)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Product name | `#productTitle` hoặc `meta[property="og:title"]` |
| `description` | "💰 {price} — {brand} • {rating}⭐ ({reviews} reviews)" | `#priceblock_ourprice`, `#bylineInfo`, `.a-icon-star` |
| `thumbnail` | Product main image | `#landingImage` hoặc `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL product | current URL |
| `attachments[1]` | IMAGE: Product image | `{ type: "IMAGE", url: product_image }` |
| **Auto-tag** | `amazon`, `shopping`, brand name, category | |

---

### Shopee (`shopee.vn`, `shopee.co.id`, ...)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Product name | `meta[property="og:title"]` hoặc `div._44qnta span` |
| `description` | "💰 {price} — {sold} đã bán • {rating}⭐" | Price + sold elements |
| `thumbnail` | Product image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `shopee`, `shopping` | |

---

### Lazada (`lazada.vn`, `lazada.co.id`, ...)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Product name | `meta[property="og:title"]` hoặc `.pdp-mod-product-badge-title` |
| `description` | "💰 {price} — {brand} • {rating}⭐" | Price + brand elements |
| `thumbnail` | Product image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `lazada`, `shopping` | |

---

### eBay (`ebay.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Product title | `meta[property="og:title"]` hoặc `h1.x-item-title__mainTitle` |
| `description` | "💰 {price} — {condition} • {seller} ({feedback}%)" | Price details |
| `thumbnail` | Item image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `ebay`, `shopping` | |

---

### AliExpress (`aliexpress.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Product name | `meta[property="og:title"]` |
| `description` | "💰 {price} — {orders} orders • {rating}⭐" | Product info |
| `thumbnail` | Product image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `aliexpress`, `shopping` | |

---

### Tiki (`tiki.vn`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Product name | `meta[property="og:title"]` hoặc `h1.title` |
| `description` | "💰 {price} — {brand} • {rating}⭐ ({reviews})" | Price + rating |
| `thumbnail` | Product image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `tiki`, `shopping` | |

---

## 📍 Nhóm 5: Travel & Location

### Google Maps (`google.com/maps`, `maps.google.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Place name | `meta[property="og:title"]` hoặc `h1.fontHeadlineLarge` |
| `description` | "📍 {address} • {rating}⭐ ({reviews}) • {category}" | Place info elements |
| `thumbnail` | Place photo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `maps`, `place`, category (restaurant, hotel, ...) | |

---

### TripAdvisor (`tripadvisor.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Place/Hotel/Restaurant name | `meta[property="og:title"]` |
| `description` | "📍 {location} • {rating}⭐ ({reviews}) • #{ranking}" | Rating + location info |
| `thumbnail` | Top photo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `tripadvisor`, `travel`, location name | |

---

### Booking.com (`booking.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Hotel/Property name | `meta[property="og:title"]` hoặc `h2.pp-header__title` |
| `description` | "📍 {address} • {rating}/10 ({reviews}) • 💰 from {price}" | Hotel info |
| `thumbnail` | Hotel photo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `booking`, `travel`, `hotel`, location | |

---

### Airbnb (`airbnb.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Listing title | `meta[property="og:title"]` |
| `description` | "📍 {location} • {type} • 💰 {price}/đêm • {rating}⭐" | Listing info |
| `thumbnail` | Listing photo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `airbnb`, `travel`, `accommodation` | |

---

## 💼 Nhóm 6: Jobs & Professional

### LinkedIn (`linkedin.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Post/Article/Profile title | `meta[property="og:title"]` |
| `description` | Post content / Article excerpt | `meta[property="og:description"]` |
| `thumbnail` | Post image / Profile photo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `linkedin`, content type (`job`, `post`, `article`, `profile`) | |

> **URL-based detection**: `/jobs/` → tag `job`, `/posts/` → tag `post`, `/in/` → tag `profile`

---

### Indeed (`indeed.com`) / TopCV (`topcv.vn`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Job title + Company | `meta[property="og:title"]` hoặc `h1.jobTitle` |
| `description` | "🏢 {company} • 📍 {location} • 💰 {salary}" | Job details |
| `thumbnail` | Company logo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `{platform}`, `job`, company name | |

---

## 🌐 Nhóm 7: Social Media

### Twitter/X (`twitter.com`, `x.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | "@{username}: {tweet first 80 chars}" | `meta[property="og:title"]` hoặc `[data-testid="tweetText"]` |
| `description` | Full tweet text | `meta[property="og:description"]` |
| `thumbnail` | Tweet image/card image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL tweet | current URL |
| `attachments[1]` | IMAGE: Tweet media (nếu có) | `[data-testid="tweetPhoto"] img` |
| **Auto-tag** | `twitter`, username, hashtags từ tweet | |

---

### Threads (`threads.net`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | "@{username}: {post excerpt}" | `meta[property="og:title"]` |
| `description` | Full post text | `meta[property="og:description"]` |
| `thumbnail` | Post image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `threads`, username | |

---

### Pinterest (`pinterest.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Pin title/description | `meta[property="og:title"]` |
| `description` | Pin description | `meta[property="og:description"]` |
| `thumbnail` | Pin image (high-res) | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| `attachments[1]` | IMAGE: Pin image | `{ type: "IMAGE", url: pin_image }` |
| **Auto-tag** | `pinterest`, `inspiration`, board name | |

---

### Tumblr (`tumblr.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Post title hoặc blog name | `meta[property="og:title"]` |
| `description` | Post content excerpt | `meta[property="og:description"]` |
| `thumbnail` | Post image | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `tumblr`, blog name | |

---

## 💻 Nhóm 8: Developer & Documentation

### GitHub (`github.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Repo name hoặc Issue/PR title | `meta[property="og:title"]` |
| `description` | Repo description hoặc Issue body excerpt | `meta[property="og:description"]` |
| `thumbnail` | Open Graph image (social preview) | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `github`, type (`repo`, `issue`, `pr`, `gist`), language, topics | |

> **URL-based detection**: `/issues/` → `issue`, `/pull/` → `pr`, `/gist/` → `gist`
> **Bonus**: Extract repo topics từ `.topic-tag` elements → dùng làm tags

---

### GitLab (`gitlab.com`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Project/Issue/MR title | `meta[property="og:title"]` |
| `description` | Project description | `meta[property="og:description"]` |
| `thumbnail` | Social preview | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `gitlab`, type (`repo`, `issue`, `merge-request`) | |

---

### MDN Web Docs (`developer.mozilla.org`)

| FavLiz Field | Source | Selector / Method |
|---|---|---|
| `title` | Article title | `meta[property="og:title"]` hoặc `h1` |
| `description` | API/CSS/HTML description | `meta[property="og:description"]` |
| `thumbnail` | MDN logo | `meta[property="og:image"]` |
| `attachments[0]` | LINK: URL | current URL |
| **Auto-tag** | `mdn`, `docs`, technology (CSS, JS, HTML, ...) | |

> **URL-based detection**: `/docs/Web/CSS/` → `css`, `/docs/Web/JavaScript/` → `javascript`

---

## 🌍 Nhóm 9: Generic Fallback (Any Website)

Cho tất cả website không thuộc nhóm trên, sử dụng **Universal Extractor** theo thứ tự ưu tiên:

### Chiến lược trích xuất

```
1. JSON-LD (Schema.org) → title, description, image, author
2. Open Graph meta tags → og:title, og:description, og:image
3. Twitter Card meta tags → twitter:title, twitter:description, twitter:image
4. Standard meta tags → <title>, meta[name="description"]
5. DOM heuristic → h1, first significant <p>, first large <img>
```

| FavLiz Field | Priority 1 (JSON-LD) | Priority 2 (OG) | Priority 3 (Meta) | Priority 4 (DOM) |
|---|---|---|---|---|
| `title` | `name` / `headline` | `og:title` | `<title>` | `h1` |
| `description` | `description` / `abstract` | `og:description` | `meta[name="description"]` | First `<p>` (≤500 chars) |
| `thumbnail` | `image` / `thumbnailUrl` | `og:image` | `twitter:image` | First large `<img>` (≥200px) |
| **Auto-tag** | `keywords` / `genre` | `og:site_name` | `meta[name="keywords"]` | domain name |

---

## 🏷️ Auto-Tag Strategy

Mỗi item được lưu sẽ auto-suggest tags dựa trên:

| Source | Ví dụ |
|---|---|
| **Platform name** | `youtube`, `reddit`, `amazon` |
| **Content type** | `video`, `article`, `product`, `job`, `place` |
| **Platform-specific data** | Subreddit name, GitHub topics, SO tags, hashtags |
| **URL path keywords** | `/recipes/` → `recipe`, `/reviews/` → `review` |

> User có thể tắt/bật auto-tag và chỉnh sửa trước khi lưu.

---

## 📎 Attachment Strategy

| Scenario | Attachments |
|---|---|
| **Mọi website** | `[{ type: "LINK", url: current_url }]` (luôn có) |
| **Có thumbnail URL** | Thêm `{ type: "IMAGE", url: thumbnail_url }` |
| **YouTube** | LINK + IMAGE (maxresdefault thumbnail) |
| **Pinterest** | LINK + IMAGE (pin image gốc) |
| **Twitter có ảnh** | LINK + IMAGE (tweet media) |
| **E-commerce** | LINK + IMAGE (product photo) |

---

## 🧩 Description Enrichment Template

Để tăng giá trị cho mô tả, mỗi nhóm sẽ có template description bổ sung context:

| Nhóm | Template Description |
|---|---|
| **Video** | `"🎬 {channel} • {duration} • {views} views"` |
| **Article** | `"📝 by {author} • {publication} • {read_time}"` |
| **E-commerce** | `"💰 {price} — {brand} • {rating}⭐ ({reviews})"` |
| **Travel** | `"📍 {address} • {rating}⭐ ({reviews}) • {category}"` |
| **Social** | `"@{username} • {engagement_info}"` |
| **Developer** | `"💻 {language} • ⭐ {stars} • 🍴 {forks}"` |
| **Job** | `"🏢 {company} • 📍 {location} • 💰 {salary}"` |
| **Generic** | `"{og:description or meta description}"` |

---

## ⚡ Extension Architecture Overview

```
favliz-extension/
├── manifest.json          # Chrome Extension Manifest V3
├── popup/                 # Popup UI (click icon)
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content scripts (injected)
│   ├── content.js         # Main content script
│   ├── content.css        # Floating button + modal styles
│   └── extractors/        # Platform-specific extractors
│       ├── index.js        # Router: detect platform → pick extractor
│       ├── youtube.js
│       ├── reddit.js
│       ├── tiktok.js
│       ├── facebook.js
│       ├── instagram.js
│       ├── medium.js
│       ├── github.js
│       ├── ecommerce.js    # Amazon, Shopee, Lazada, eBay, AliExpress, Tiki
│       ├── travel.js       # Google Maps, TripAdvisor, Booking, Airbnb
│       ├── social.js       # Twitter, Threads, Pinterest, Tumblr
│       ├── jobs.js          # LinkedIn, Indeed, TopCV
│       ├── devdocs.js       # MDN, Dev.to, GitLab, StackOverflow
│       └── generic.js      # Universal fallback
├── background/            # Service worker
│   └── background.js
├── api/                   # API client
│   └── favliz-api.js
├── assets/                # Icons, images
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── styles/                # Shared styles
    └── variables.css
```

---

## ✅ Tổng kết số lượng website được hỗ trợ

| Nhóm | Websites | Số lượng |
|---|---|---|
| 🎬 Video | YouTube, TikTok, Vimeo, Facebook Video, Instagram Reels | 5 |
| 📝 Blog | Medium, Substack, The Verge, TechCrunch, Dev.to | 5 |
| 💬 Forum | Reddit, Quora, Stack Overflow | 3 |
| 🛒 Shopping | Amazon, Shopee, Lazada, eBay, AliExpress, Tiki | 6 |
| 📍 Travel | Google Maps, TripAdvisor, Booking.com, Airbnb | 4 |
| 💼 Jobs | LinkedIn, Indeed, TopCV | 3 |
| 🌐 Social | Twitter/X, Threads, Pinterest, Tumblr | 4 |
| 💻 Developer | GitHub, GitLab, MDN, Dev.to | 4 |
| 🌍 Generic | Tất cả website khác | ∞ |
| | **Tổng platform-specific** | **34+** |
