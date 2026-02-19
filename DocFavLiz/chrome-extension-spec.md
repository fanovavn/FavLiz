# FavLiz Chrome Extension — Specification (ExtensionGoogle)

> **Version:** 1.0 | **Client Name:** ExtensionGoogle  
> **Created:** 2026-02-19 | **Manifest:** V3

---

## 1. Overview

Chrome Extension cho phép user lưu nội dung từ bất kỳ website nào vào FavLiz trong vài giây. Extension tự động nhận diện platform, trích xuất metadata (title, description, thumbnail), và cung cấp hai chế độ lưu:

- **Inline Post Buttons** — Nút "FavLiz" được inject trực tiếp vào mỗi post trên feed (Facebook, Instagram, Reddit, Twitter/X)
- **Floating Button** — Nút nhỏ gọn ở góc dưới phải cho trang single-content (YouTube, GitHub, Medium, v.v.)

### Yêu cầu chính
- Tốc độ: < 5 giây để save
- UI: Minimalist, ổn định, không gây phiền user
- Design: Pink-red gradient (`#FF4D6D` → `#FF1E56`), glassmorphism, Inter font

---

## 2. Architecture

```
┌──────────────────────────────────────────────────┐
│                  Chrome Extension                 │
├──────────────┬───────────────┬────────────────────┤
│  Popup UI    │ Service Worker│  Content Scripts    │
│  (popup/)    │ (background/) │  (content/)         │
│              │               │                     │
│ • Login form │ • Token mgmt  │ • 13 Extractors     │
│ • Quick save │ • API proxy   │ • Floating Button   │
│ • Save opts  │ • Message hub │ • Inline Post Btns  │
│              │               │ • Save Modal        │
│              │               │ • MutationObserver   │
└──────┬───────┴───────┬───────┴──────────┬─────────┘
       │               │                  │
       └───────────────┼──────────────────┘
                       │ chrome.runtime.sendMessage
                       ▼
              ┌────────────────┐
              │ Service Worker │
              │ Bearer Token   │
              └───────┬────────┘
                      │ fetch()
                      ▼
         ┌─────────────────────────┐
         │  FavLiz Backend API     │
         │  /api/extension/*       │
         ├─────────────────────────┤
         │  Supabase Auth          │
         │  Prisma DB              │
         └─────────────────────────┘
```

---

## 3. Folder Structure

```
favliz-extension/
├── manifest.json
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── background/
│   └── service-worker.js          # Token management, API calls, message routing
├── content/
│   ├── content.js                 # FAB, inline buttons, save modal, MutationObserver
│   ├── content.css                # All injected styles (glassmorphism, !important)
│   └── extractors/
│       ├── index.js               # Router — picks best extractor for current page
│       ├── generic.js             # Universal fallback (JSON-LD → OG → meta → DOM)
│       ├── youtube.js
│       ├── reddit.js              # Feed support (inline buttons)
│       ├── tiktok.js
│       ├── facebook.js            # Feed support (inline buttons)
│       ├── instagram.js           # Feed support (inline buttons)
│       ├── medium.js
│       ├── github.js
│       ├── ecommerce.js           # Amazon, Shopee, Lazada, eBay, AliExpress, Tiki
│       ├── travel.js              # Google Maps, TripAdvisor, Booking, Airbnb
│       ├── social.js              # Twitter/X (feed), Threads, Pinterest, Tumblr
│       ├── jobs.js                # LinkedIn, Indeed, TopCV
│       └── devdocs.js             # MDN, Dev.to, GitLab, SO, Substack, Verge, etc.
└── popup/
    ├── popup.html
    ├── popup.css
    └── popup.js
```

---

## 4. Backend API Endpoints

Base URL: `/api/extension`

Tất cả endpoints (trừ `auth`) yêu cầu header: `Authorization: Bearer <access_token>`

### 4.1 Auth

```
POST /api/extension/auth
```

**Request:**
```json
{ "email": "user@email.com", "password": "..." }
```

**Response (200):**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": 1234567890,
  "user": {
    "id": "uuid",
    "email": "...",
    "name": "...",
    "username": "...",
    "avatar": "...",
    "themeColor": "..."
  }
}
```

### 4.2 Create Item

```
POST /api/extension/items
```

**Request:**
```json
{
  "title": "Video hay",
  "description": "Mô tả...",
  "thumbnail": "https://...",
  "viewMode": "PRIVATE",
  "tagNames": ["youtube", "tutorial"],
  "listIds": ["list-uuid-1"],
  "attachments": [
    { "type": "LINK", "url": "https://youtube.com/watch?v=..." },
    { "type": "IMAGE", "url": "https://img.youtube.com/..." }
  ]
}
```

**Response (201):**
```json
{ "id": "item-uuid", "message": "Item saved successfully" }
```

### 4.3 Lists

```
GET  /api/extension/lists     → [{ id, name, isDefault, itemCount }]
POST /api/extension/lists     → { id, name }
     Body: { "name": "My List" }
```

### 4.4 Tags

```
GET /api/extension/tags       → [{ id, name, itemCount }]
```

### 4.5 Profile

```
GET /api/extension/profile    → { id, email, name, username, avatar, themeColor, itemsLabel }
```

### 4.6 CORS

Tất cả routes trả về headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 5. Authentication Flow

```
User (Popup) → Email/Password
    ↓
Popup JS → chrome.runtime.sendMessage("LOGIN", {email, password})
    ↓
Service Worker → fetch POST /api/extension/auth
    ↓
Backend → Supabase signInWithPassword → sync user to Prisma
    ↓
Response → { access_token, refresh_token, user }
    ↓
Service Worker → chrome.storage.local.set(tokens + user)
    ↓
Subsequent requests → Bearer token from storage
```

**Hybrid approach:**
- Đăng nhập: Trực tiếp trong extension popup (email/password)
- Đăng ký / Quên mật khẩu / OTP: Chuyển hướng sang website FavLiz

---

## 6. Extractor System

### 6.1 Priority Order

```
youtube → reddit → tiktok → facebook → instagram →
medium → github → ecommerce → travel → social →
jobs → devdocs → generic (fallback)
```

### 6.2 Extractor Interface

Mỗi extractor implement:

```javascript
{
  name: "youtube",           // Unique identifier
  platform: "YouTube",       // Display name
  icon: "🎬",               // Platform emoji
  isFeed: false,             // true = inject inline buttons on feed

  canHandle() → boolean,     // Check if this extractor matches current URL

  extract() → {              // Extract from current page
    title, description, thumbnail, url,
    platform, platformIcon,
    autoTags: [],
    attachments: [{ type, url }]
  },

  // Feed-only methods (optional):
  extractFromPost(postEl) → {...},   // Extract from specific post element
  getPostSelector() → string,        // CSS selector for post containers
  getButtonAnchor(postEl) → Element  // Where to place inline button
}
```

### 6.3 Generic Fallback Strategy

```
1. JSON-LD (script[type="application/ld+json"])
2. Open Graph meta (og:title, og:description, og:image)
3. Twitter Card meta (twitter:title, twitter:description)
4. Standard meta (title, description, keywords)
5. DOM heuristic (h1, article p, main img)
```

### 6.4 Platform Coverage

| Category | Platforms | Extractor File |
|----------|-----------|----------------|
| Video | YouTube, TikTok | youtube.js, tiktok.js |
| Social | Facebook, Instagram, Twitter/X, Threads, Pinterest, Tumblr | facebook.js, instagram.js, social.js |
| Forum | Reddit | reddit.js |
| Blog | Medium, Substack | medium.js, devdocs.js |
| Developer | GitHub, GitLab, StackOverflow, MDN, Dev.to | github.js, devdocs.js |
| Shopping | Amazon, Shopee, Lazada, eBay, AliExpress, Tiki | ecommerce.js |
| Travel | Google Maps, TripAdvisor, Booking, Airbnb | travel.js |
| Jobs | LinkedIn, Indeed, TopCV | jobs.js |
| News | The Verge, TechCrunch, Quora | devdocs.js |
| **Any** | **All other websites** | **generic.js** |

---

## 7. Content Injection Strategy

### 7.1 Feed Pages (Inline Post Buttons)

**Khi nào:** `extractor.isFeed === true` và `getPostSelector()` trả về selector hợp lệ

**Platforms hỗ trợ:**
- Reddit: `shreddit-post`, `[data-testid='post-container']`
- Facebook: `[role="article"]`, `div[data-pagelet*="FeedUnit"]`
- Instagram: `article[role="presentation"]`
- Twitter/X: `[data-testid="tweet"]`

**Cách hoạt động:**
1. Content script khởi tạo → gọi `injectPostButtons()`
2. Tìm tất cả post elements theo `getPostSelector()`
3. Với mỗi post chưa có nút → tạo button "FavLiz" gradient
4. Đặt button ở vị trí `getButtonAnchor(postEl)` hoặc fallback vào action bar
5. `MutationObserver` theo dõi DOM → inject buttons cho posts mới (infinite scroll)
6. Click button → `extractFromPost(postEl)` → mở Save Modal

### 7.2 Single-Content Pages (Floating Button)

**Khi nào:** Luôn hiển thị trên mọi trang

**Floating Action Button (FAB):**
- Vị trí: Fixed, bottom-right 24px
- Kích thước: 48×48px, border-radius 50%
- Style: Pink-red gradient, shadow
- Click → `extractPageData()` → mở Save Modal

### 7.3 Save Modal

**Components:**
- Header: Logo + platform badge + close button
- Preview card: Thumbnail + title + URL
- Form:
  - Title (input, required)
  - Description (textarea)
  - Lists (multi-select dropdown + create new)
  - Tags (multi-select + auto-suggestions từ extractor)
  - Visibility toggle (Private/Public)
- Footer: Cancel + Save button

**Behavior:**
- Check auth trước khi mở
- Fetch lists + tags song song
- Auto-populate tags từ extractor
- Enter trong tag input → add new tag
- Save → POST /api/extension/items → toast notification

---

## 8. Popup UI

### 8.1 Views

| View | Hiển thị khi |
|------|-------------|
| Loading | Đang kiểm tra auth state |
| Login | Chưa đăng nhập |
| Main | Đã đăng nhập |

### 8.2 Main View Features

- **Page Preview**: Hiển thị thumbnail + title + platform của tab hiện tại
- **Quick Save**: Lưu ngay với auto-tags, không cần chọn list/tag
- **Save with Options**: Mở Save Modal trên tab hiện tại (đóng popup)
- **Logout**: Xóa tokens, quay về Login view

### 8.3 Layout

- Width: 340px (fixed)
- Font: Inter (Google Fonts)
- Theme: Light background, pink-red gradient header

---

## 9. Message Protocol

Communication giữa Popup ↔ Service Worker ↔ Content Script qua `chrome.runtime.sendMessage`:

| Action | Direction | Payload | Response |
|--------|-----------|---------|----------|
| `LOGIN` | Popup → SW | `{email, password}` | `{success, user}` |
| `LOGOUT` | Popup → SW | — | `{success}` |
| `GET_AUTH_STATE` | Any → SW | — | `{isLoggedIn, user}` |
| `CREATE_ITEM` | Any → SW | `{title, desc, ...}` | `{success, item}` |
| `GET_LISTS` | Any → SW | — | `{success, lists}` |
| `CREATE_LIST` | Modal → SW | `{name}` | `{success, list}` |
| `GET_TAGS` | Any → SW | — | `{success, tags}` |
| `GET_PROFILE` | Popup → SW | — | `{success, profile}` |
| `EXTRACT_PAGE_DATA` | Popup → CS | — | `{title, desc, ...}` |
| `OPEN_SAVE_MODAL` | Popup → CS | — | `{success}` |

---

## 10. Storage

`chrome.storage.local`:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": 1234567890,
  "user": {
    "id": "uuid",
    "email": "...",
    "name": "...",
    "username": "...",
    "avatar": "...",
    "themeColor": "..."
  }
}
```

---

## 11. Attachment Strategy

Mỗi item luôn có ít nhất 1 attachment:

| Priority | Type | Nguồn |
|----------|------|-------|
| 1 | `LINK` | URL gốc của trang/post |
| 2 | `IMAGE` | Thumbnail (nếu có) |

Max: 10 attachments per item (enforced server-side).

---

## 12. Auto-Tag Strategy

Mỗi extractor tự tạo auto-tags dựa trên:
- Platform name (vd: `youtube`, `reddit`)
- Content type (vd: `video`, `article`, `repo`)
- Platform-specific data (vd: `r/programming`, `@username`, topics)
- Domain fallback cho generic extractor

Max: 8 tags per item. Tags được upsert (tạo mới nếu chưa tồn tại).

---

## 13. CSS Isolation

Tất cả content script CSS sử dụng:
- Prefix `favliz-ext-` cho class names và IDs
- `!important` trên mọi rule để tránh conflict với host page
- CSS custom properties scoped: `--favliz-*`
- Z-index: `2147483640` (near max) cho FAB và modal

---

## 14. Permissions

```json
{
  "permissions": ["activeTab", "storage", "tabs"],
  "host_permissions": [
    "http://localhost:3000/*",
    "https://*.favliz.com/*"
  ]
}
```

| Permission | Lý do |
|------------|-------|
| `activeTab` | Đọc URL và inject content scripts |
| `storage` | Lưu tokens và user info |
| `tabs` | Query active tab từ popup |
| `localhost:3000` | Dev API |
| `*.favliz.com` | Production API |

---

## 15. Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#FF1E56` |
| Primary Light | `#FF4D6D` |
| Gradient | `135deg, #FF4D6D → #FF1E56` |
| Text | `#1a1a2e` |
| Text Muted | `#6b7280` |
| Border | `#e5e7eb` |
| Radius (card) | `12px` |
| Radius (button) | `10px` |
| Radius (chip) | `12px` |
| Font | Inter, -apple-system |
| Shadow | `0 8px 32px rgba(0,0,0,0.12)` |

---

## 16. Future Enhancements

- [ ] Token refresh tự động khi gần hết hạn
- [ ] Offline queue — lưu items khi mất mạng, sync khi có lại
- [ ] Keyboard shortcuts (Ctrl+Shift+S quick save)
- [ ] Right-click context menu "Save to FavLiz"
- [ ] Chrome Web Store deployment
- [ ] Dark mode cho popup và modal
- [ ] Thumbnail upload qua `/api/upload` thay vì URL
- [ ] Badge count hiển thị số items saved hôm nay
- [ ] LinkedIn feed inline buttons
- [ ] Notification khi save thành công (optional)
