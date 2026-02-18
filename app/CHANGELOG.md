# 📋 Changelog — FavLiz Web User

Tất cả thay đổi đáng chú ý của **Web User** sẽ được ghi nhận tại đây.

---

## [v1.1.0] — 2026-02-19

### 🔄 Redesign toàn diện Item Detail & Listing

#### ✨ Tính năng mới
- **Trang Listing mới** — giao diện hoàn toàn mới với layout 2 cột
  - **Filter Sidebar (bên phải)** — tìm kiếm, lọc theo bộ sưu tập (checkbox), lọc theo tags (chips)
  - **Sub Header** — thanh hiển thị số lượng items + dropdown sắp xếp (Mới nhất, Cũ nhất, A-Z, Z-A)
  - **Dual View** — chuyển đổi giữa chế độ **List** (mặc định) và **Grid** bằng nút toggle
  - **List View** — hàng ngang: thumbnail + title + description + tags + ngày tạo + badge Public/Private
  - **Skeleton Loading** — hiệu ứng loading pulse khi đang apply filter hoặc tìm kiếm
  - **Mobile Filter Modal** — slide-up modal chứa tất cả bộ lọc trên mobile
  - **Active Filter Indicator** — badge xanh trên nút filter mobile khi có filter đang active

#### 🎨 Cải thiện giao diện
- **Item Detail** — redesign hero card:
  - Bỏ nút Back
  - Thumbnail bo vuông, căn trái
  - Nút "Chỉnh sửa" + "Xóa" nằm góc trên phải trong card
  - Badge Public/Private, title, description căn trái
- **Create Item Form** — redesign form tạo mới:
  - Header mới với nút back, title, subtitle, nút save
  - Card-wrapped form với thumbnail upload ở trên
  - Sections: title, description, attachments, tags, collections, visibility
  - Visibility dạng card toggle Private/Public
- **Attachment Viewer** — hiển thị links dạng danh sách dọc, images dạng grid

#### 🔧 Backend
- Thêm filter `listId` và `tagId` vào API `getItems()` — hỗ trợ lọc items theo bộ sưu tập và tags
- Server page fetch danh sách Lists + Tags để truyền vào filter sidebar

---

## [v1.0.2] — 2026-02-18

### 🏷️ Credits & Version

#### 🔧 Thay đổi
- Thêm **"From Fanova with ❤️"** credits vào:
  - Landing page footer
  - App sidebar (dưới version)
  - Trang 404
- Cập nhật version sidebar: `v1.0.0` → `v1.0.1`

---

## [v1.0.1] — 2026-02-18

### � Redesign Landing Page & Auth

#### ✨ Tính năng mới
- **Landing Page mới** — thiết kế lại hoàn toàn:
  - Hero section với gradient text, CTA buttons
  - Stats counter animation
  - Features grid với cards
  - How it works section
  - Footer với social links
- **Light Mode** — chuyển landing page và auth pages sang giao diện sáng
- **Quên mật khẩu** — flow reset password qua email OTP
- **Responsive Navbar** — thanh navigation trên mobile

#### 🎨 Cải thiện giao diện
- Auth pages (Login/Register) — background gradient, animations
- Mobile header — tối ưu responsive cho màn hình nhỏ

#### 🐛 Sửa lỗi
- Fix lỗi đăng nhập trên production (Supabase auth flow)
- Fix lỗi hiển thị mobile header trên các kích thước khác nhau

---

## [v1.0.0] — 2026-02-16

### �🎉 Phiên bản đầu tiên

#### ✨ Tính năng mới
- **Đăng ký / Đăng nhập** qua email + OTP (Supabase Auth)
- **Dashboard** — tổng quan items, lists, tags
- **Items** — tạo, sửa, xóa items với thumbnail, mô tả, tags, attachments
- **Bộ sưu tập (Lists)** — nhóm items theo chủ đề
- **Tags** — gắn nhãn và lọc items
- **Chia sẻ công khai** — share items/lists qua link hoặc username
- **Upload ảnh** — tự động compress sang WebP, hỗ trợ JPEG/PNG/GIF
- **Cài đặt cá nhân**:
  - Đổi tên, username
  - Đổi mật khẩu
  - Chọn màu theme
  - Đổi label "Items" thành tên tuỳ thích
  - Đổi ngôn ngữ giao diện
- **Đa ngôn ngữ** — hỗ trợ 6 ngôn ngữ: Tiếng Việt, English, 日本語, 한국어, 中文, Русский
- **Giao diện responsive** — desktop sidebar + mobile bottom nav
- **Dark mode** — thiết kế tối hiện đại với hiệu ứng glassmorphism

