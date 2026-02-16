# 📋 Changelog — FavLiz Web Staff (Admin)

Tất cả thay đổi đáng chú ý của **Web Staff** sẽ được ghi nhận tại đây.

---

## [v1.0.0] — 2026-02-16

### 🎉 Phiên bản đầu tiên

#### ✨ Tính năng mới
- **Đăng nhập Admin** — JWT httpOnly cookie, TTL 7 ngày
- **Dashboard** — thống kê tổng quan hệ thống (users, items, lists, tags)
- **Quản lý Người dùng** — xem danh sách, tìm kiếm, bật/tắt trạng thái
- **Quản lý Items** — xem, filter theo visibility (Public/Private)
- **Quản lý Bộ sưu tập** — xem, tìm kiếm
- **Quản lý Tags** — xem, tìm kiếm
- **Quản lý Admin** — tạo, bật/tắt, xoá admin users
- **Phân quyền (RBAC)**:
  - 18 quyền hạn (6 resources × 3 actions)
  - 3 vai trò mặc định: Root Admin, Admin, Moderator
  - Tạo vai trò tuỳ chỉnh
  - Chỉnh sửa quyền cho từng vai trò
  - Sidebar tự ẩn/hiện theo quyền
- **Giao diện** — dark mode, responsive, sidebar collapse
