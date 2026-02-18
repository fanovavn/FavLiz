# 🚀 Hướng dẫn Deploy FavLiz lên Vercel

## Tổng quan

| App | Thư mục | Mô tả | Domain Vercel |
|-----|---------|-------|---------------|
| **WebUser** | `app/` | Ứng dụng cho người dùng cuối | `favliz-user.vercel.app` |
| **WebStaff** | `staff-bo/` | Back-office quản trị | `favliz-staff.vercel.app` |

---

## Bước 1: Push code lên GitHub

```bash
cd /Users/tientd/TienData/Vibe-Coding/FavLiz
git add .
git commit -m "chore: prepare for Vercel deployment - separate Prisma schema"
git push origin main
```

---

## Bước 2: Deploy WebUser (app/)

### 2.1. Truy cập Vercel Dashboard
1. Mở trình duyệt → vào **[vercel.com/new](https://vercel.com/new)**
2. Đăng nhập tài khoản Vercel (hoặc đăng nhập bằng GitHub)

### 2.2. Import Repository
1. Nhấn **"Import Git Repository"**
2. Chọn repo **FavLiz** từ danh sách GitHub
3. Nếu chưa thấy repo → nhấn **"Adjust GitHub App Permissions"** để cấp quyền

### 2.3. Cấu hình Project
Điền các thông tin sau:

| Setting | Giá trị |
|---------|---------|
| **Project Name** | `favliz-user` |
| **Framework Preset** | `Next.js` (tự detect) |
| **Root Directory** | Nhấn **Edit** → nhập `app` |
| **Build Command** | _(để mặc định: `next build`)_ |
| **Output Directory** | _(để mặc định)_ |
| **Install Command** | _(để mặc định: `npm install`)_ |

### 2.4. Thêm Environment Variables
Nhấn vào **"Environment Variables"** và thêm từng biến:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.sthxoksegjupaqpomcot:29a-ecMR%26*8td_L@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.sthxoksegjupaqpomcot:29a-ecMR%26*8td_L@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sthxoksegjupaqpomcot.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_vGl4MW3G1amyhA6NPCXO1g_loMsxw3R` |

### 2.5. Deploy
- Nhấn **"Deploy"**
- Đợi build hoàn tất (khoảng 1-3 phút)
- Sau khi xong → bạn sẽ có URL: `favliz-user.vercel.app`

---

## Bước 3: Deploy WebStaff (staff-bo/)

### 3.1. Tạo Project mới
1. Quay lại **[vercel.com/new](https://vercel.com/new)** (tạo project MỚI)
2. Chọn **cùng repo FavLiz**

### 3.2. Cấu hình Project

| Setting | Giá trị |
|---------|---------|
| **Project Name** | `favliz-staff` |
| **Framework Preset** | `Next.js` |
| **Root Directory** | Nhấn **Edit** → nhập `staff-bo` |
| **Build Command** | _(để mặc định: `next build`)_ |
| **Output Directory** | _(để mặc định)_ |
| **Install Command** | _(để mặc định: `npm install`)_ |

### 3.3. Thêm Environment Variables

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.sthxoksegjupaqpomcot:29a-ecMR%26*8td_L@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `ADMIN_JWT_SECRET` | `favliz-staff-bo-secret-key-2026-super-secure` |

### 3.4. Deploy
- Nhấn **"Deploy"**
- Đợi build hoàn tất
- Sau khi xong → bạn sẽ có URL: `favliz-staff.vercel.app`

---

## Bước 4 (Tuỳ chọn): Gán Custom Domain

Nếu bạn có domain riêng:
1. Vào **Vercel Dashboard** → Chọn project → **Settings** → **Domains**
2. Thêm domain:
   - WebUser: `favliz.com` hoặc `user.favliz.com`
   - WebStaff: `staff.favliz.com`
3. Cấu hình DNS theo hướng dẫn của Vercel (thêm CNAME trỏ tới `cname.vercel-dns.com`)

---

## Bước 5 (Tuỳ chọn): Tối ưu — chỉ build khi có thay đổi liên quan

Vào **Settings** → **Git** → **Ignored Build Step** cho mỗi project:

- **favliz-user**: `git diff HEAD^ HEAD --quiet -- app/`
- **favliz-staff**: `git diff HEAD^ HEAD --quiet -- staff-bo/`

→ Vercel sẽ skip build nếu không có thay đổi trong thư mục tương ứng.

---

## Ghi nhớ khi dev sau này

### Khi thay đổi schema Prisma (thêm model, field...)
Chạy lệnh sau ở gốc repo:
```bash
bash sync-schema.sh
```
Script sẽ tự động copy schema từ `app/` → `staff-bo/` và generate lại Prisma client cho cả 2.

### Khi push code
Vercel sẽ tự động re-deploy cả 2 project khi bạn push lên `main`.

---

## Xử lý sự cố thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `PrismaClientInitializationError` | Thiếu env `DATABASE_URL` | Kiểm tra Environment Variables trên Vercel |
| `Cannot find module '@/generated/prisma'` | Prisma chưa generate | Kiểm tra `postinstall` script trong `package.json` |
| Build timeout | Project quá lớn | Thêm `.vercelignore` để loại bỏ file không cần |
| Schema mismatch | Quên sync schema | Chạy `bash sync-schema.sh` rồi push lại |
