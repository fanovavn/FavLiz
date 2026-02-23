# 📋 Changelog — FavLiz Web User

Tất cả thay đổi đáng chú ý của **Web User** sẽ được ghi nhận tại đây.

---

## [v1.4.2] — 2026-02-23

### 📱 Cải thiện UX bộ sưu tập & Mobile

#### ✨ Tính năng mới
- **Loại item khỏi bộ sưu tập** — icon 🗑️ trên mỗi item trong trang chi tiết bộ sưu tập:
  - Grid view: icon đỏ góc trên phải, hiện khi hover
  - List view: icon đỏ bên phải mỗi row
  - Popup xác nhận trước khi loại, ghi chú rõ "item vẫn tồn tại, chỉ gỡ khỏi bộ sưu tập"
- **Popup thêm item cải tiến** — khi bấm "+" trong bộ sưu tập:
  - Chỉ hiện items **chưa có** trong bộ sưu tập (ẩn items đã thêm)
  - Nút **"Tạo công thức mới"** — chuyển sang trang tạo item với bộ sưu tập đã chọn sẵn
  - Sau khi tạo xong tự động quay về bộ sưu tập
  - Background popup đổi sang trắng
- **Pre-select bộ sưu tập khi tạo item** — URL `/items/new?listId=...&returnTo=...` tự chọn sẵn bộ sưu tập

#### 🎨 Cải thiện giao diện
- **Tiêu đề list view** — hiển thị tối đa 2 dòng thay vì cắt 1 dòng (line-clamp-2)
- **Badge Private/Public** — rút gọn thành icon tròn (🔒/🌐) thay vì chữ + icon
- **Grid thumbnail** — đổi từ `height: 180px` cố định sang `aspect-ratio: 16/10` responsive
- **Grid overflow fix** — thêm `min-width: 0` ngăn items tràn ra ngoài grid column

#### 🔧 Backend
- Thêm `removeItemFromList()` — gỡ 1 item ra khỏi bộ sưu tập (Prisma disconnect)
- Thêm `preSelectedListId` + `returnTo` props cho ItemForm
- Cập nhật `items/new/page.tsx` — nhận listId và returnTo từ URL params

---

## [v1.4.1] — 2026-02-22

### 🔧 Đồng bộ ngôn ngữ & Cải thiện UI

#### 🐛 Sửa lỗi
- **Fix đồng bộ ngôn ngữ Landing ↔ App** — đổi ngôn ngữ ở landing page, vào app dashboard vẫn giữ đúng ngôn ngữ đã chọn
- **Fix đồng bộ ngược App → Landing** — đổi ngôn ngữ trong sidebar cũng cập nhật cookie `landing_locale`, tránh bị ghi đè khi refresh

#### 🎨 Cải thiện giao diện
- **Language switcher auth pages** — dời xuống cuối trang, nằm cùng hàng với link đăng ký/đăng nhập
- **Dropdown mở lên trên (dropUp)** — tránh bị che khuất trên màn hình nhỏ
- **Mở rộng hero section** — `max-w-4xl` → `max-w-5xl` trên desktop cho thoáng hơn

#### 📝 Cập nhật nội dung
- Đổi badge landing page: "Công cụ quản lý yêu thích #1 Việt Nam" → "Công cụ quản lý yêu thích ưa chuộng toàn cầu" (cả 4 ngôn ngữ)
- Gộp heroLine1 + heroLine2 thành 1 dòng cho tự nhiên hơn (cả 4 ngôn ngữ)

---

## [v1.4.0] — 2026-02-22

### 🌍 Đa ngôn ngữ Landing Page, Auth & Onboarding

#### ✨ Tính năng mới
- **i18n Landing Page** — toàn bộ nội dung landing page hỗ trợ 4 ngôn ngữ (🇻🇳 🇺🇸 🇨🇳 🇷🇺):
  - Hero section, Stats, Problems, How it Works, Platforms, Use Cases
  - Products, Comparison, Privacy, CTA, Footer
  - Language switcher (🌐 + cờ) trên navbar cho cả desktop & mobile
- **i18n Auth Pages** — login, register, forgot-password đều đã dịch đầy đủ:
  - Tất cả text, placeholder, error messages, button labels
  - Language switcher ở cuối trang, dropdown mở lên trên (dropUp)
- **i18n Chrome Extension Button** — nút "Cài Chrome Extension" và modal "Sắp ra mắt" hiển thị đúng ngôn ngữ
- **Onboarding tự động** — popup onboarding hiện lại khi user chưa thiết lập tên hiển thị (dù đã hoàn thành onboarding trước đó)

#### 🎨 Cải thiện giao diện
- Language switcher hỗ trợ `dropUp` prop — dropdown mở lên trên trên các trang auth để không bị che khuất
- Layout auth footer: text + language switcher cùng một hàng, gọn gàng
- Navbar landing: tích hợp language switcher vào cả desktop & mobile menu

#### 🔧 Backend / Infrastructure
- Thêm `src/lib/i18n/landing.json` — bản dịch riêng cho landing page (4 ngôn ngữ)
- Thêm `src/lib/i18n/auth.json` — bản dịch riêng cho auth pages (4 ngôn ngữ)
- Thêm `src/hooks/use-auth-locale.ts` — hook đọc locale từ cookie client-side
- Thêm `src/lib/i18n/landing.ts` — helper function cho landing page translations
- Locale lưu trong cookie `landing_locale`, đồng bộ giữa landing ↔ login ↔ register ↔ forgot-password
- Cập nhật query user trong app layout: thêm field `name` để kiểm tra onboarding

---

## [v1.3.0] — 2026-02-19

### 🎯 Thêm items vào bộ sưu tập & Sửa lỗi

#### ✨ Tính năng mới
- **Thêm items vào bộ sưu tập** — popup chọn items từ trang chi tiết bộ sưu tập:
  - Hiển thị tất cả items với checkbox, tick sẵn items đã có trong bộ sưu tập
  - Tìm kiếm nhanh theo title
  - Nút **+** trên hero nav và nút ở empty state đều mở popup
  - Bấm "Áp dụng" để cập nhật danh sách items

#### 🐛 Sửa lỗi
- Fix header bộ sưu tập không đi theo tông màu theme (hardcoded green → CSS variables)
- Fix lỗi redirect sau khi xoá bộ sưu tập / item (dùng `router.replace` thay `router.push`)

#### 🔧 Backend
- Thêm `getItemsForListPicker()` — lấy tất cả items kèm flag đã có trong list chưa
- Thêm `updateListItems()` — cập nhật danh sách items của bộ sưu tập (many-to-many set)

---

## [v1.2.0] — 2026-02-19

### 🎉 Onboarding, Theme System & Collection Management

#### ✨ Tính năng mới
- **Onboarding Popup** — hướng dẫn người dùng mới qua 5 bước:
  - Chào mừng → Nhập tên → Đặt tên danh mục → Chọn màu theme → Tóm tắt & hoàn tất
  - Hình minh hoạ cho mỗi bước, validation đầy đủ
  - Giao diện glassmorphism, animation mượt mà
- **Tự động tạo username** — từ tên nhập ở onboarding, tự gen slug dạng `dong-tien-3121`
  - Hỗ trợ tiếng Việt: bỏ dấu, chuyển đ→d, thêm 4 số random
  - Tự kiểm tra trùng lặp, retry tối đa 5 lần
- **Quản lý Bộ sưu tập (Lists)** — overhaul toàn diện:
  - Trang listing mới: Grid view với cards có thumbnail, item count badge
  - Nút tạo bộ sưu tập mới (modal)
  - Trang chi tiết bộ sưu tập: hero card + grid items
  - Trang chỉnh sửa bộ sưu tập: edit form với thumbnail upload
  - Danh mục "Chưa phân loại" (uncategorized) — xem items chưa thuộc bộ sưu tập nào
- **Trang Tags cải thiện** — hiển thị tag detail popup khi click tag
- **Create List Modal** — tạo bộ sưu tập nhanh từ trang listing

#### 🎨 Cải thiện giao diện
- **Dashboard redesign** — hero banner, KPI cards, biểu đồ hoạt động tuần, phân bố tag, bộ sưu tập nổi bật, quick actions, tip banner
- **Theme Color đồng bộ** — hero banner và tip banner trên dashboard giờ đi theo tông màu user chọn (trước đây hardcode xanh lá)
- **Settings page** — cải thiện giao diện cài đặt cá nhân
- **Loading state** — skeleton loading toàn app khi chuyển trang
- **Đa ngôn ngữ** — cập nhật i18n cho tất cả ngôn ngữ (vi, en, zh, ru)

#### 🐛 Sửa lỗi
- Fix theme color không apply sau khi hoàn thành onboarding (thêm `revalidatePath`)
- Fix UI overlap giữa hình và step badge trong onboarding popup
- Fix hardcoded emerald colors trong dashboard hero banner và tip banner

#### 🔧 Backend
- Thêm `revalidatePath("/", "layout")` sau khi cập nhật user data → server component tự re-fetch
- Thêm hàm `generateUsernameSlug()` — tạo username slug từ tên tiếng Việt
- Cập nhật Prisma schema cho tính năng mới

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

