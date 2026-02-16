# FavLiz – Project Overview & PDR

## Vision

> **"Mọi thứ yêu thích, một nơi duy nhất."**

FavLiz là công cụ web giúp người dùng lưu trữ, phân loại và chia sẻ danh sách các items yêu thích (công thức nấu ăn, nhà hàng, phim, sách, địa điểm, links…) với giao diện glassmorphism hiện đại, dễ sử dụng trên mọi thiết bị.

## Goals

| # | Goal | Metric |
|---|------|--------|
| G1 | Người dùng lưu mọi thứ yêu thích nhanh chóng | < 30s để tạo 1 item |
| G2 | Tổ chức items bằng Lists + Tags linh hoạt | 1 item thuộc nhiều lists/tags |
| G3 | Chia sẻ public dễ dàng qua link | 1-click chuyển Public + copy link |
| G4 | Giao diện đẹp, premium, responsive | Glassmorphism, pink-red gradient |
| G5 | Bảo mật – Private by default | Chỉ owner xem items private |

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React + TypeScript + TailwindCSS
- **Backend:** Next.js API Routes + Prisma v7
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel + Supabase

## Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Project Setup + Landing + Auth | ✅ Done |
| **2** | Dashboard + Items CRUD | 🔲 Next |
| **3** | Lists + Tags Modules | 🔲 |
| **4** | Public View + SEO | 🔲 |
| **5** | CMS Admin Panel | 🔲 |

## Full PRD

See `../PRD.md` for complete Product Requirements Document with wireframes, database schema, and detailed feature specs.
