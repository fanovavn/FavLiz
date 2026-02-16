# 📘 FavLiz Web User — API Documentation

> **App:** `app/` | **Framework:** Next.js (Server Actions + API Routes)  
> **Auth:** Supabase Auth | **Database:** PostgreSQL via Prisma ORM  
> **Base URL (local):** `http://localhost:3000`

---

## 📋 Mục lục

1. [Authentication](#1-authentication)
2. [Items](#2-items)
3. [Lists (Bộ sưu tập)](#3-lists-bộ-sưu-tập)
4. [Tags](#4-tags)
5. [User Settings](#5-user-settings)
6. [Sharing (Public)](#6-sharing-public)
7. [File Upload](#7-file-upload)

---

## 1. Authentication

> **File:** `src/lib/auth-actions.ts`  
> **Provider:** Supabase Auth (email + password)

### `signUp(email, password)`
Đăng ký tài khoản mới. Gửi OTP qua email.

| Param | Type | Required |
|-------|------|----------|
| `email` | `string` | ✅ |
| `password` | `string` | ✅ |

**Response:** `{ data, error: null }` hoặc `{ error: string }`

---

### `verifyOtp(email, token)`
Xác thực OTP sau khi đăng ký. Tự động sync user vào Prisma DB.

| Param | Type | Required |
|-------|------|----------|
| `email` | `string` | ✅ |
| `token` | `string` | ✅ |

**Response:** `{ data, error: null }` hoặc `{ error: string }`

---

### `signIn(email, password)`
Đăng nhập. Sync user vào Prisma DB.

| Param | Type | Required |
|-------|------|----------|
| `email` | `string` | ✅ |
| `password` | `string` | ✅ |

**Response:** `{ data, error: null }` hoặc `{ error: string }`

---

### `signOut()`
Đăng xuất (clear Supabase session).

---

## 2. Items

> **File:** `src/lib/item-actions.ts`  
> **Auth:** Yêu cầu đăng nhập (Supabase Auth)

### `getDashboardStats()`
Lấy thống kê tổng quan cho dashboard.

**Response:**
```json
{
  "totalItems": 42,
  "totalLists": 5,
  "totalTags": 12,
  "recentItems": [...]
}
```

---

### `getItems(params?)`
Lấy danh sách items với phân trang, filter, sort.

| Param | Type | Default | Mô tả |
|-------|------|---------|--------|
| `search` | `string` | `""` | Tìm kiếm theo title |
| `sort` | `"newest" \| "oldest" \| "az" \| "za"` | `"newest"` | Sắp xếp |
| `page` | `number` | `1` | Trang |
| `pageSize` | `number` | `20` | Số item/trang |

**Response:**
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

### `getItem(id)`
Lấy chi tiết 1 item (bao gồm tags, lists, attachments).

| Param | Type | Required |
|-------|------|----------|
| `id` | `string (UUID)` | ✅ |

---

### `createItem(data)`
Tạo item mới.

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `title` | `string` | ✅ | Tên item |
| `description` | `string` | ❌ | Mô tả |
| `thumbnail` | `string` | ❌ | URL ảnh thumbnail |
| `viewMode` | `"PRIVATE" \| "PUBLIC"` | ✅ | Chế độ hiển thị |
| `tagNames` | `string[]` | ✅ | Danh sách tên tag |
| `listIds` | `string[]` | ✅ | Danh sách list ID |
| `attachments` | `AttachmentInput[]` | ✅ | File đính kèm |

**AttachmentInput:**
```json
{ "type": "LINK" | "IMAGE", "url": "https://..." }
```

---

### `updateItem(data)`
Cập nhật item. Cùng fields như `createItem` + thêm `id`.

---

### `deleteItem(id)`
Xóa item theo ID.

---

### `getUserLists()`
Lấy danh sách lists của user (dùng cho dropdown chọn list).

---

### `getUserTags()`
Lấy danh sách tags của user (dùng cho autocomplete).

---

### `getTagsWithCounts()`
Lấy tất cả tags kèm số lượng items.

---

### `getTagWithItems(id)`
Lấy chi tiết 1 tag kèm danh sách items.

---

### `deleteTag(id)`
Xóa tag theo ID.

---

## 3. Lists (Bộ sưu tập)

> **File:** `src/lib/list-actions.ts`  
> **Auth:** Yêu cầu đăng nhập

### `getLists()`
Lấy tất cả lists của user.

**Response:** Mảng list objects:
```json
[{
  "id": "uuid",
  "name": "My List",
  "description": "...",
  "thumbnail": null,
  "viewMode": "PRIVATE",
  "shareSlug": null,
  "isDefault": false,
  "itemCount": 10,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}]
```

---

### `getList(id)`
Lấy chi tiết 1 list kèm items bên trong.

---

### `createList(data)`

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `name` | `string` | ✅ | Tên list |
| `description` | `string` | ❌ | Mô tả |
| `viewMode` | `"PRIVATE" \| "PUBLIC"` | ✅ | Chế độ hiển thị |

**Response:** `{ id: "uuid" }`

---

### `updateList(data)`
Cập nhật list. Cùng fields + `id`.

---

### `deleteList(id)`
Xóa list theo ID.

---

## 4. Tags

> Xem phần [Items](#2-items) - các hàm: `getUserTags()`, `getTagsWithCounts()`, `getTagWithItems(id)`, `deleteTag(id)`

---

## 5. User Settings

> **File:** `src/lib/user-actions.ts`  
> **Auth:** Yêu cầu đăng nhập

### `getProfile()`
Lấy profile user hiện tại.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Tien TD",
  "username": "tientd",
  "themeColor": "#6366F1",
  "itemsLabel": "Favorites",
  "language": "vi"
}
```

---

### `updateProfile(data)`

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `username` | `string` | ❌ | Username (a-z, 0-9, `.`, `-`, `_`, 3-30 ký tự) |
| `name` | `string` | ❌ | Tên hiển thị |

---

### `changePassword(data)`

| Field | Type | Required |
|-------|------|----------|
| `currentPassword` | `string` | ✅ |
| `newPassword` | `string` | ✅ (≥ 6 ký tự) |

---

### `updateThemeColor(color)`
Đổi màu theme. Truyền `null` để reset.

---

### `updateItemsLabel(label)`
Đổi label "Items" thành custom label. Tối đa 4 từ, mỗi từ ≤ 20 ký tự.

---

### `getItemsLabel()`
Lấy label hiện tại. Default: `"Items"`.

---

### `updateLanguage(language)`
Đổi ngôn ngữ. Supported: `"vi"`, `"en"`, `"ja"`, `"ko"`, `"zh"`, `"ru"`.

---

### `getLanguage()`
Lấy ngôn ngữ hiện tại. Default: `"vi"`.

---

## 6. Sharing (Public)

> **File:** `src/lib/share-actions.ts`  
> **Auth:** KHÔNG yêu cầu đăng nhập (public endpoints)

### `getPublicItem(slug)`
Lấy item public theo share slug.

---

### `getPublicList(slug)`
Lấy list public theo share slug (chỉ chứa items có `viewMode: PUBLIC`).

---

### `getPublicContentByUsername(username, slug)`
Lấy nội dung public theo username + slug. Tự detect item hoặc list.

**Response:**
```json
{ "type": "item" | "list", "data": {...} }
```

---

### `getShareUrl(type, id)`
Tạo share URL cho item/list.

| Param | Type | Mô tả |
|-------|------|--------|
| `type` | `"item" \| "list"` | Loại content |
| `id` | `string (UUID)` | ID của item/list |

**Response:** `/username/slug` hoặc `/share/item/slug`

---

## 7. File Upload

> **File:** `src/app/api/upload/route.ts`  
> **Method:** `POST`  
> **Auth:** Yêu cầu đăng nhập (Supabase Auth)  
> **Content-Type:** `multipart/form-data`

### `POST /api/upload`
Upload ảnh thumbnail. Tự động compress sang WebP.

| Field | Type | Mô tả |
|-------|------|--------|
| `file` | `File` | File ảnh (JPEG, PNG, WebP, GIF) |

**Giới hạn:**
- Max size: **10MB** (trước compression)
- Max kích thước: **1920×1920** (auto resize)
- Output: **WebP** (quality 80%) — GIF giữ nguyên

**Response:**
```json
{ "url": "https://supabase.co/storage/v1/object/public/thumbnails/..." }
```

---

## 🔧 Environment Variables

| Variable | Mô tả |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
