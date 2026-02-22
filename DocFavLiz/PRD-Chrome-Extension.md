# PRD — FavLiz Chrome Extension

> **Product:** FavLiz — Save Your Favorites  
> **Client:** Chrome Extension (Manifest V3)  
> **Version:** 1.0.0  
> **Cập nhật:** 2026-02-21  
> **Trạng thái:** ✅ Đã triển khai (Production)

---

## 1. Tổng quan sản phẩm

FavLiz Chrome Extension là công cụ giúp user **lưu nội dung từ bất kỳ website nào** vào hệ thống FavLiz chỉ trong vài giây. Extension tự động phát hiện platform, trích xuất metadata (tiêu đề, mô tả, thumbnail, URL), và cung cấp hai luồng lưu: **Quick Save** (lưu nhanh 1 click) và **Save with Options** (chỉnh sửa trước khi lưu).

### 1.1 Vấn đề giải quyết

- User muốn bookmark/save nội dung yêu thích từ nhiều platform nhưng không muốn dùng hệ thống bookmark cơ bản của trình duyệt
- Cần phân loại nội dung bằng tags và lists
- Muốn lưu giữ metadata đầy đủ (thumbnail, mô tả) thay vì chỉ URL
- Cần hỗ trợ đa nền tảng: video, bài viết, sản phẩm, địa điểm, code repo,...

### 1.2 Mục tiêu

| Mục tiêu | Tiêu chí | Đạt được |
|-----------|----------|----------|
| Tốc độ | Lưu nội dung < 5 giây | ✅ Quick Save 1 click |
| Tự động hóa | Auto-fill title, description, tags | ✅ 13 extractors + 1 generic |
| Đa nền tảng | Hỗ trợ 30+ website phổ biến | ✅ 34+ platforms |
| UX tối giản | Ít thao tác, không gây phiền | ✅ FAB + inline buttons |

---

## 2. Kiến trúc hệ thống

### 2.1 Sơ đồ tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│                  FavLiz Chrome Extension                      │
├──────────────────┬──────────────────┬────────────────────────┤
│    Popup UI      │  Service Worker  │   Content Scripts       │
│    (popup/)      │  (background/)   │   (content/)            │
│                  │                  │                         │
│ • Login form     │ • Token quản lý  │ • 13 Platform           │
│ • Page Preview   │ • API proxy      │   Extractors            │
│ • Quick Save     │ • Message hub    │ • 1 Generic Fallback    │
│ • Save w/ Opts   │                  │ • Floating Button (FAB) │
│ • Logout         │                  │ • Inline Post Buttons   │
│                  │                  │ • Login Modal           │
│                  │                  │ • Save Modal            │
│                  │                  │ • MutationObserver      │
└────────┬─────────┴────────┬─────────┴────────────┬───────────┘
         │                  │                       │
         └──────────────────┼───────────────────────┘
                            │ chrome.runtime.sendMessage
                            ▼
                   ┌────────────────────┐
                   │   Service Worker   │
                   │   Bearer Token     │
                   └────────┬───────────┘
                            │ fetch()
                            ▼
              ┌──────────────────────────────┐
              │    FavLiz Backend API        │
              │    https://www.favliz.com    │
              │    /api/extension/*          │
              ├──────────────────────────────┤
              │    Supabase Auth             │
              │    Prisma Database           │
              └──────────────────────────────┘
```

### 2.2 Cấu trúc thư mục (đã triển khai)

```
favliz-extension/
├── manifest.json                    # Manifest V3
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── background/
│   └── service-worker.js           # 160 dòng — Token + API + Message routing
├── content/
│   ├── content.js                  # 709 dòng — FAB, Inline buttons, Modals
│   ├── content.css                 # Styles cho injected UI
│   └── extractors/
│       ├── index.js                # Router — chọn extractor phù hợp
│       ├── generic.js              # Universal fallback (JSON-LD → OG → meta → DOM)
│       ├── youtube.js              # YouTube video
│       ├── reddit.js               # Reddit feed + single post
│       ├── tiktok.js               # TikTok video
│       ├── facebook.js             # Facebook feed + single post
│       ├── instagram.js            # Instagram feed + single post
│       ├── medium.js               # Medium articles
│       ├── github.js               # GitHub repo/issue/PR/gist
│       ├── ecommerce.js            # Amazon, Shopee, Lazada, eBay, AliExpress, Tiki
│       ├── travel.js               # Google Maps, TripAdvisor, Booking, Airbnb
│       ├── social.js               # Twitter/X, Threads, Pinterest, Tumblr
│       ├── jobs.js                 # LinkedIn, Indeed, TopCV
│       └── devdocs.js              # MDN, Dev.to, GitLab, StackOverflow, Substack,...
└── popup/
    ├── popup.html                  # 116 dòng — 3 views, Inter font
    ├── popup.css                   # Styling cho popup
    └── popup.js                    # 204 dòng — Login, Preview, QuickSave
```

---

## 3. Tính năng đã triển khai

### 3.1 Popup UI

Popup mở ra khi user click vào icon extension trên toolbar. Width cố định, font Inter from Google Fonts.

**3 Views:**

| View | Điều kiện | Nội dung |
|------|-----------|----------|
| **Loading** | Đang check auth state | Spinner animation |
| **Login** | Chưa đăng nhập | Form email/password, link register + forgot password |
| **Main** | Đã đăng nhập | Page preview + Quick Save + Save with Options |

**Main View — chi tiết:**
- **Header:** Logo FavLiz + tên user + nút Logout
- **Page Preview:** Tự động extract thumbnail + title + platform từ tab đang active
- **Quick Save:** Lưu ngay với auto-tags, viewMode = PRIVATE, không cần chọn list
- **Save with Options:** Mở Save Modal trên tab hiện tại (đóng popup)
- **Dashboard Link:** Link mở FavLiz web dashboard

**Login View — chi tiết:**
- Gradient header với logo + tagline "Save your favorites"
- Form: Email + Password
- Nút Sign In với loading spinner
- Links: "Create account" → `/register`, "Forgot password?" → `/forgot-password` (mở trên web FavLiz)

---

### 3.2 Floating Action Button (FAB)

Nút tròn floating ở góc dưới phải màn hình, hiển thị trên **mọi website** (trừ trang FavLiz và localhost).

| Thuộc tính | Giá trị |
|------------|---------|
| Vị trí | Fixed, bottom-right 24px |
| Kích thước | 48×48px, border-radius 50% |
| Icon | Bookmark SVG (stroke) |
| Style | Pink-red gradient, box-shadow |
| ID | `favliz-ext-fab` |

**Hành vi:**
1. Click FAB → gọi `FavLizExtractorRouter.extractPageData()`
2. Check auth state → nếu chưa đăng nhập → hiện Login Modal
3. Nếu đã đăng nhập → fetch lists + tags → hiện Save Modal
4. Không hiển thị trên `localhost` hoặc `*.favliz.com`
5. Prevent double injection: `window.__favliz_injected` flag

---

### 3.3 Inline Post Buttons (Feed)

Trên các trang social media feed, extension inject nút "FavLiz" trực tiếp vào mỗi post.

**Platforms hỗ trợ feed inline buttons:**

| Platform | isFeed | Post Selector | Button Anchor |
|----------|--------|---------------|---------------|
| **Reddit** | ✅ | `shreddit-post`, `[data-testid='post-container']` | `shreddit-post-overflow-menu` |
| **Facebook** | ✅ | `div[role="article"]`, `div[data-pagelet^="FeedUnit_"]` | Action menu button (VI + EN labels) |
| **Instagram** | ✅ | `article[role="presentation"]` | Action bar area |
| **Twitter/X** | ✅ | `[data-testid="tweet"]` | Tweet action bar |

**Cơ chế hoạt động:**
1. Content script khởi tạo → check `isFeedPage()`
2. **Strategy 1:** Dùng `getPostSelector()` từ extractor tìm post elements
3. **Strategy 2 (Facebook):** Tìm nút `...` menu (aria-label VI + EN), walk up DOM tìm container ≥ 200px height
4. Inject nút gradient "FavLiz" (SVG bookmark icon + text)
5. `MutationObserver` theo dõi DOM changes → inject buttons cho posts mới (infinite scroll)
6. Retry injection ở các thời điểm: 1s, 2s, 4s, 7s, 12s (Facebook loads posts async)
7. Click nút → `extractFromPost(postEl)` → mở Save Modal
8. Nút có loading state: spinner + "Saving..." khi đang extract

---

### 3.4 Save Modal

Modal overlay hiển thị trực tiếp trên trang web (injected vào DOM), glassmorphism style.

**Cấu trúc modal:**
- **Header:** Logo "Save to FavLiz" + Platform badge (emoji + tên) + nút Close (✕)
- **Preview Card:** Thumbnail + title + URL (truncated 60 chars)
- **Form Fields:**
  - **Title** (input, required, pre-filled từ extractor)
  - **Description** (textarea, 3 rows, pre-filled)
  - **Link** (url input, pre-filled)
  - **Lists** (multi-select dropdown + searchable + "Create new" inline)
  - **Tags** (multi-select + chip style + auto-suggested + create new + Enter to add)
- **Footer:** Cancel + Save Item (gradient primary button)

**Hành vi chi tiết:**
- Check auth trước khi mở → redirect sang Login Modal nếu chưa đăng nhập
- Fetch lists + tags **song song** (Promise.all)
- Auto-populate tags từ extractor `autoTags`
- Multi-select component: search filter, dropdown, chip display, remove chip
- List có thể tạo mới inline → `CREATE_LIST` message → cập nhật selected
- Tag Enter key → add new tag trực tiếp
- viewMode mặc định: `PRIVATE` (hardcode)
- Save → `CREATE_ITEM` → toast success → auto close sau 1.2s
- Error → toast error, re-enable save button
- Close: click overlay / nút Close / nút Cancel / phím ESC

---

### 3.5 Login Modal (Content Script)

Khi user click FAB/inline button mà chưa đăng nhập, hiện Login Modal trực tiếp trên trang web.

- Header: Logo FavLiz + tagline + Close button
- Form: Email + Password
- Sign In button với loading state
- Links: "Create account" + "Forgot password?" → mở web FavLiz
- Validation: check empty fields → error message
- Login success → toast "Đăng nhập thành công!" → auto mở Save Modal sau 800ms
- Login failed → hiện error message

---

### 3.6 Toast Notification

Thông báo nhỏ hiển thị ở top-right, 2 loại: `success` (xanh) và `error` (đỏ).
- Auto show sau 10ms, auto hide sau 3s
- Animation: slide in / slide out

---

## 4. Hệ thống Extractor

### 4.1 Thứ tự ưu tiên

```
youtube → reddit → tiktok → facebook → instagram →
medium → github → ecommerce → travel → social →
jobs → devdocs → generic (fallback)
```

Router (`index.js`) duyệt theo thứ tự trên, extractor đầu tiên trả `canHandle() === true` sẽ được sử dụng.

### 4.2 Extractor Interface

Mỗi extractor implement các methods:

```javascript
{
  name: "youtube",            // ID duy nhất
  platform: "YouTube",        // Tên hiển thị
  icon: "🎬",                // Emoji
  isFeed: false,              // true = có inline buttons trên feed

  canHandle() → boolean,      // Kiểm tra URL có match không

  extract() → {               // Extract dữ liệu trang hiện tại
    title, description, thumbnail, url,
    platform, platformIcon,
    autoTags: [],
    attachments: [{ type, url }]
  },

  // Feed-only methods (optional):
  extractFromPost(postEl) → {...},  // Extract từ 1 post element cụ thể
  getPostSelector() → string,       // CSS selector cho post containers
  getButtonAnchor(postEl) → Element  // Vị trí đặt inline button
}
```

### 4.3 Platform Coverage

| Nhóm | Platforms | File | Feed? |
|------|-----------|------|-------|
| 🎬 Video | YouTube, TikTok | `youtube.js`, `tiktok.js` | ❌ |
| 📘 Social Feed | Facebook, Instagram | `facebook.js`, `instagram.js` | ✅ |
| 💬 Forum/Feed | Reddit | `reddit.js` | ✅ |
| 🐦 Social | Twitter/X, Threads, Pinterest, Tumblr | `social.js` | ✅ (Twitter/X) |
| 📝 Blog | Medium, Substack | `medium.js`, `devdocs.js` | ❌ |
| 💻 Developer | GitHub, GitLab, StackOverflow, MDN, Dev.to | `github.js`, `devdocs.js` | ❌ |
| 🛒 Shopping | Amazon, Shopee, Lazada, eBay, AliExpress, Tiki | `ecommerce.js` | ❌ |
| 📍 Travel | Google Maps, TripAdvisor, Booking, Airbnb | `travel.js` | ❌ |
| 💼 Jobs | LinkedIn, Indeed, TopCV | `jobs.js` | ❌ |
| 📰 News | The Verge, TechCrunch, Quora | `devdocs.js` | ❌ |
| 🌐 **Any** | **Tất cả website khác** | `generic.js` | ❌ |

**Tổng platform-specific: 34+. Tổng coverage: ∞ (generic fallback).**

### 4.4 Generic Fallback Strategy

Cho mọi website không match extractor cụ thể, `generic.js` extract theo 5 tầng ưu tiên:

```
1. JSON-LD (script[type="application/ld+json"]) → name/headline, description, image, keywords
2. Open Graph (og:title, og:description, og:image, og:site_name)
3. Twitter Card (twitter:title, twitter:description, twitter:image)
4. Standard meta (<title>, meta[name="description"], meta[name="keywords"])
5. DOM heuristic (h1, article p / main p, article img / main img ≥ 200px)
```

**Auto-tag:** Domain name + keywords/genre từ meta/JSON-LD. Max 8 tags, deduplicated.
**Limits:** Title cắt 200 chars, Description cắt 1000 chars.

---

## 5. Backend API

### 5.1 Base URL

```
Production: https://www.favliz.com/api/extension
```

### 5.2 Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `POST` | `/auth` | ❌ | Đăng nhập (email + password) |
| `POST` | `/items` | ✅ Bearer | Tạo item mới |
| `GET` | `/lists` | ✅ Bearer | Lấy danh sách lists |
| `POST` | `/lists` | ✅ Bearer | Tạo list mới |
| `GET` | `/tags` | ✅ Bearer | Lấy danh sách tags |
| `GET` | `/profile` | ✅ Bearer | Lấy profile user |

### 5.3 Auth Response

```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": 1234567890,
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "name": "Tên user",
    "username": "username",
    "avatar": "https://...",
    "themeColor": "#..."
  }
}
```

### 5.4 Create Item Payload

```json
{
  "title": "Video hay",
  "description": "Mô tả...",
  "thumbnail": "https://...",
  "viewMode": "PRIVATE",
  "tagNames": ["youtube", "video"],
  "listIds": ["list-uuid-1"],
  "attachments": [
    { "type": "LINK", "url": "https://..." }
  ]
}
```

---

## 6. Authentication Flow

```
User click FAB / Popup
    ↓
Check chrome.storage.local → access_token tồn tại?
    ├── Có → Tiến hành save
    └── Không → Hiện Login Modal / Login View
         ↓
    Email + Password → chrome.runtime.sendMessage("LOGIN")
         ↓
    Service Worker → fetch POST /api/extension/auth
         ↓
    Backend → Supabase signInWithPassword
         ↓
    Response → { access_token, refresh_token, user }
         ↓
    chrome.storage.local.set(tokens + user)
         ↓
    Auto-proceed sang Save Modal / Main View
```

**Hybrid approach:**
- **Đăng nhập:** Trực tiếp trong extension (popup hoặc content script modal)
- **Đăng ký / Quên mật khẩu:** Chuyển hướng sang web FavLiz (`favliz.com/register`, `favliz.com/forgot-password`)

**Session xử lý:**
- API trả 401 → tự động `clearAuth()`, hiện lại Login
- Timeout 10s (content script) / 15s (popup) cho mỗi message
- Không có token refresh tự động (nằm trong backlog)

---

## 7. Message Protocol

Giao tiếp giữa Popup ↔ Service Worker ↔ Content Script qua `chrome.runtime.sendMessage`:

| Action | Chiều | Payload | Response |
|--------|-------|---------|----------|
| `LOGIN` | Popup/CS → SW | `{email, password}` | `{success, user}` |
| `LOGOUT` | Popup → SW | — | `{success}` |
| `GET_AUTH_STATE` | Any → SW | — | `{isLoggedIn, user}` |
| `CREATE_ITEM` | Any → SW | `{title, desc, thumbnail, viewMode, tagNames, listIds, attachments}` | `{success, item}` |
| `GET_LISTS` | Any → SW | — | `{success, lists}` |
| `CREATE_LIST` | Modal → SW | `{name}` | `{success, list}` |
| `GET_TAGS` | Any → SW | — | `{success, tags}` |
| `GET_PROFILE` | Popup → SW | — | `{success, profile}` |
| `EXTRACT_PAGE_DATA` | Popup → CS | — | `{title, desc, ...}` |
| `OPEN_SAVE_MODAL` | Popup → CS | — | `{success}` |

---

## 8. Storage

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

## 9. Attachment & Auto-Tag Strategy

### 9.1 Attachments

Mỗi item luôn có ít nhất 1 attachment `LINK` (URL gốc). Thumbnail nếu có sẽ thêm `IMAGE`.

| Scenario | Attachments |
|----------|-------------|
| Mọi website | `[{ type: "LINK", url: current_url }]` |
| Có thumbnail | Thêm `{ type: "IMAGE", url: thumbnail }` |
| YouTube | LINK + xây thumbnail từ video ID (`maxresdefault.jpg`) |
| Reddit (có ảnh) | LINK + IMAGE |
| E-commerce | LINK + IMAGE (product photo) |

### 9.2 Auto-Tags

Mỗi extractor tự gợi ý tags:

| Nguồn | Ví dụ |
|-------|-------|
| Platform name | `youtube`, `reddit`, `amazon` |
| Content type | `video`, `article`, `repo`, `job` |
| Platform-specific | `r/programming`, `r/webdev`, channel name, GitHub topics, SO tags |
| Domain fallback | Domain name (generic extractor) |

Max: 8 tags/item. User có thể chỉnh sửa/xóa/thêm trước khi lưu.

---

## 10. CSS Isolation

Tất cả UI injected vào trang web sử dụng isolation strategy:

| Kỹ thuật | Chi tiết |
|----------|---------|
| Prefix | `favliz-ext-` cho mọi class & ID |
| `!important` | Trên tất cả CSS rules |
| CSS Custom Properties | Scoped: `--favliz-*` |
| Z-index | `2147483640` (near max) cho FAB + Modal |
| ID-based | FAB: `#favliz-ext-fab`, Modal: `#favliz-ext-modal`, Overlay: `#favliz-ext-overlay` |

---

## 11. Permissions

```json
{
  "permissions": ["activeTab", "storage", "tabs"],
  "host_permissions": [
    "http://localhost:3000/*",
    "https://*.favliz.com/*"
  ]
}
```

| Permission | Mục đích |
|------------|----------|
| `activeTab` | Đọc URL và inject content scripts |
| `storage` | Lưu tokens và user info |
| `tabs` | Query active tab từ popup |
| `localhost:3000` | Dev API (development) |
| `*.favliz.com` | Production API |

Content scripts được inject trên `<all_urls>` qua manifest, không cần host_permissions riêng.

---

## 12. Design System

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
| Theme | Light only |
| Glass Effect | Backdrop-blur + white transparency + soft border |

---

## 13. Hạn chế hiện tại (Known Limitations)

| Hạn chế | Mô tả |
|---------|--------|
| Không có token refresh | Token hết hạn → user phải login lại |
| viewMode cố định | Luôn PRIVATE, không có toggle trong modal |
| Không có offline queue | Mất mạng → save thất bại |
| Không có keyboard shortcut | Chưa có Ctrl+Shift+S quick save |
| Không có context menu | Chưa hỗ trợ right-click "Save to FavLiz" |
| Không có dark mode | Popup + Modal chỉ có light theme |
| Thumbnail = URL | Chỉ lưu URL thumbnail, không upload lên server |
| Không có badge count | Không hiển thị số items đã save |
| Facebook DOM fragile | Facebook thường thay đổi DOM, selectors có thể bị break |

---

## 14. Backlog (Tính năng tương lai)

| Tính năng | Ưu tiên | Ghi chú |
|-----------|---------|---------|
| Auto token refresh | Cao | Dùng `refresh_token` khi gần hết hạn |
| Offline queue | Cao | Lưu tạm vào storage, sync khi có mạng |
| Keyboard shortcut | Trung bình | `Ctrl+Shift+S` quick save |
| Right-click context menu | Trung bình | "Save to FavLiz" trong menu chuột phải |
| Dark mode | Thấp | Cho popup và modal |
| Thumbnail upload | Thấp | Upload ảnh qua `/api/upload` thay vì URL |
| Badge count | Thấp | Hiển thị số items saved hôm nay |
| viewMode toggle trong modal | Trung bình | Cho phép chọn Private/Public |
| Chrome Web Store deployment | Cao | Publish lên Chrome Web Store chính thức |
| LinkedIn feed inline buttons | Thấp | Inject nút trên LinkedIn feed |
| AI auto-tagging | Thấp | AI gợi ý tags dựa trên nội dung |

---

## 15. Metrics & KPI đề xuất

| Metric | Cách đo |
|--------|---------|
| Save success rate | Tỷ lệ `CREATE_ITEM` thành công / tổng số lần click Save |
| Time to save | Thời gian từ click FAB → toast "Saved" |
| Daily active users | Số user unique sử dụng extension mỗi ngày |
| Items saved / user / day | Trung bình số items mỗi user lưu trong ngày |
| Extractor coverage hit | % saves dùng platform-specific extractor vs generic |
| Login conversion | % user mở extension → đăng nhập thành công |

---

## 16. Tổng kết kỹ thuật

| Thành phần | Số lượng |
|------------|---------|
| Files tổng cộng | 19 files (1 manifest + 3 popup + 1 service worker + 14 content) |
| Extractor files | 14 (13 platform-specific + 1 generic) |
| Platform-specific hỗ trợ | 34+ websites |
| Message actions | 10 actions (LOGIN, LOGOUT, GET_AUTH_STATE, CREATE_ITEM, GET_LISTS, CREATE_LIST, GET_TAGS, GET_PROFILE, EXTRACT_PAGE_DATA, OPEN_SAVE_MODAL) |
| API endpoints | 6 endpoints |
| Chrome permissions | 3 permissions + 2 host_permissions |
| Manifest version | V3 |
