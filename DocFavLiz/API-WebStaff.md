# 📘 FavLiz Web Staff (Admin) — API Documentation

> **App:** `staff-bo/` | **Framework:** Next.js (Server Actions)  
> **Auth:** JWT (httpOnly cookie) + bcrypt | **Database:** PostgreSQL via Prisma ORM  
> **Base URL (local):** `http://localhost:3001`

---

## 📋 Mục lục

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Users Management](#3-users-management)
4. [Items Management](#4-items-management)
5. [Lists Management](#5-lists-management)
6. [Tags Management](#6-tags-management)
7. [Admin Management](#7-admin-management)
8. [Roles & Permissions (RBAC)](#8-roles--permissions-rbac)

---

## 1. Authentication

> **File:** `src/lib/auth-actions.ts`  
> **Method:** JWT trong httpOnly cookie (`admin_session`), TTL = 7 ngày

### `login(username, password)`
Đăng nhập admin. Tạo JWT chứa permissions + roles.

| Param | Type | Required |
|-------|------|----------|
| `username` | `string` | ✅ |
| `password` | `string` | ✅ |

**JWT Payload:**
```json
{
  "id": "uuid",
  "username": "tientd",
  "name": "Tien TD",
  "isRoot": true,
  "permissions": ["users.read", "items.write", ...],
  "roles": ["Root Admin"]
}
```

**Response:** `{ success: true }` hoặc `{ success: false, error: string }`

---

### `logout()`
Xóa cookie `admin_session`.

---

### `getSession()`
Lấy session admin hiện tại từ JWT cookie.

**Response:** `AdminPayload | null`

---

## 2. Dashboard

> **File:** `src/lib/admin-actions.ts`  
> **Permission:** Không yêu cầu permission đặc biệt (chỉ cần đăng nhập)

### `getDashboardStats()`
Thống kê tổng quan hệ thống.

**Response:**
```json
{
  "totalUsers": 150,
  "totalItems": 3200,
  "totalLists": 450,
  "totalTags": 890
}
```

---

### `getRecentUsers(limit?)`
Lấy danh sách users mới đăng ký gần đây. Default: 10.

---

### `getRecentItems(limit?)`
Lấy danh sách items mới tạo gần đây. Default: 10.

---

## 3. Users Management

> **Permission:** `users.read`, `users.write`

### `getUsers(page?, search?, limit?)`
Lấy danh sách users với phân trang và tìm kiếm.

| Param | Type | Default | Mô tả |
|-------|------|---------|--------|
| `page` | `number` | `1` | Trang |
| `search` | `string` | `""` | Tìm theo email/username |
| `limit` | `number` | `20` | Số kết quả/trang |

**Response:**
```json
{
  "users": [...],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

---

### `toggleUserStatus(userId)`
Bật/tắt trạng thái active của user.

| Param | Type | Required |
|-------|------|----------|
| `userId` | `string (UUID)` | ✅ |

**Permission:** `users.write`

---

## 4. Items Management

> **Permission:** `items.read`, `items.write`, `items.delete`

### `getItems(page?, search?, visibility?, limit?)`

| Param | Type | Default | Mô tả |
|-------|------|---------|--------|
| `page` | `number` | `1` | Trang |
| `search` | `string` | `""` | Tìm theo title |
| `visibility` | `string` | `""` | Filter: `"PUBLIC"`, `"PRIVATE"`, hoặc `""` (tất cả) |
| `limit` | `number` | `20` | Số kết quả/trang |

**Permission:** `items.read`

---

## 5. Lists Management

> **Permission:** `lists.read`

### `getLists(page?, search?, limit?)`

| Param | Type | Default |
|-------|------|---------|
| `page` | `number` | `1` |
| `search` | `string` | `""` |
| `limit` | `number` | `20` |

---

## 6. Tags Management

> **Permission:** `tags.read`

### `getTags(page?, search?, limit?)`

| Param | Type | Default |
|-------|------|---------|
| `page` | `number` | `1` |
| `search` | `string` | `""` |
| `limit` | `number` | `20` |

---

## 7. Admin Management

> **Permission:** `admins.read`, `admins.write`, `admins.delete`

### `getAdmins()`
Lấy danh sách tất cả admin users kèm roles.

**Permission:** `admins.read`

---

### `createAdmin(data)`
Tạo admin mới.

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `username` | `string` | ✅ | Tên đăng nhập |
| `password` | `string` | ✅ | Mật khẩu (≥ 6 ký tự) |
| `name` | `string` | ✅ | Tên hiển thị |
| `roleIds` | `string[]` | ✅ | Mảng role ID (chọn 1) |

**Permission:** `admins.write`

---

### `toggleAdminStatus(adminId)`
Bật/tắt trạng thái active. Không thể tắt root admin hoặc chính mình.

**Permission:** `admins.write`

---

### `deleteAdmin(adminId)`
Xóa admin. Không thể xóa root admin.

**Permission:** `admins.delete`

---

## 8. Roles & Permissions (RBAC)

> **Permission:** `roles.read`, `roles.write`, `roles.delete`  
> **File:** `src/lib/permissions.ts` (helper) + `src/lib/admin-actions.ts`

### Hệ thống Permission

**Resources:**
| Resource | Label |
|----------|-------|
| `users` | Người dùng |
| `items` | Items |
| `lists` | Bộ sưu tập |
| `tags` | Tags |
| `admins` | Quản trị viên |
| `roles` | Phân quyền |

**Actions:** `read` (Xem), `write` (Tạo/Sửa), `delete` (Xóa)

**Format:** `resource.action` → VD: `users.read`, `items.write`, `roles.delete`

**Tổng:** 18 permissions (6 resources × 3 actions)

---

### Default System Roles

| Role | Permissions | isSystem |
|------|------------|----------|
| **Root Admin** | Tất cả 18 permissions | ✅ |
| **Admin** | 15 permissions (trừ `admins.*`, `roles.*`) | ✅ |
| **Moderator** | 6 permissions (chỉ `read` cho users, items, lists, tags) | ✅ |

---

### `getRoles()`
Lấy tất cả roles kèm permissions và user count.

---

### `getAllPermissions()`
Lấy tất cả 18 permissions (cho form tạo/edit role).

---

### `getAllRolesSimple()`
Lấy roles đơn giản (id, name, slug) cho dropdown chọn role khi tạo admin.

---

### `createRole(data)`
Tạo role mới.

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `name` | `string` | ✅ | Tên role |
| `slug` | `string` | ✅ | Slug (auto-generate nếu trống) |
| `description` | `string` | ✅ | Mô tả |
| `permissionIds` | `string[]` | ✅ | Danh sách permission IDs |

**Permission:** `roles.write`

---

### `updateRolePermissions(roleId, permissionIds)`
Cập nhật permissions cho 1 role.

**Permission:** `roles.write`

---

### `deleteRole(roleId)`
Xóa role. Không thể xóa isSystem = true.

**Permission:** `roles.delete`

---

## 🔧 Environment Variables

| Variable | Mô tả |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string (chung với Web User) |
| `ADMIN_JWT_SECRET` | Secret key cho JWT signing |

---

## 🔒 Security Notes

- **JWT httpOnly cookie:** Không thể truy cập từ JavaScript phía client
- **bcrypt:** Password hash với salt rounds
- **`requirePermission()` guard:** Mỗi server action đều check permission trước khi thực thi
- **UI filtering:** Sidebar navigation ẩn theo permissions
- **Root Admin:** Flag `isRoot: true`, không thể bị xóa hoặc vô hiệu hóa
