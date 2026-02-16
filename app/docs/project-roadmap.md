# FavLiz – Project Roadmap

## Current Status: Phase 1 Complete ✅

## Phase 1: Project Setup + Landing + Auth ✅
- [x] Next.js 16 project initialization
- [x] TailwindCSS + Glassmorphism design system
- [x] Supabase integration (Auth + Database)
- [x] Prisma v7 ORM setup
- [x] Landing page with hero, features, CTA
- [x] Registration flow (3-step: Email → OTP → Password)
- [x] Login page
- [x] Auth middleware

## Phase 2: Dashboard + Items CRUD 🔲 (Next)
- [ ] Dashboard with stats overview (KPI cards)
- [ ] Items listing (grid view, search, filter, sort, pagination)
- [ ] Item create/edit form
- [ ] Item detail view
- [ ] Image upload to Supabase Storage
- [ ] Link/video attachment support
- [ ] ViewMode toggle (Private/Public)
- [ ] Auto-generated thumbnails (2 ký tự đầu + pastel bg)

## Phase 3: Lists + Tags Modules 🔲
- [ ] Lists CRUD
- [ ] List detail with items
- [ ] Default "Chưa phân loại" list
- [ ] Tags CRUD
- [ ] Tag cloud view
- [ ] Filter items by tag
- [ ] Many-to-many item-list and item-tag relationships

## Phase 4: Public View + SEO 🔲
- [ ] Public share page for items (/share/item/:slug)
- [ ] Public share page for lists (/share/list/:slug)
- [ ] Share link generation + copy
- [ ] OG meta tags for social sharing
- [ ] SEO optimization

## Phase 5: CMS Admin Panel 🔲
- [ ] Admin dashboard with analytics
- [ ] User management
- [ ] Content moderation
- [ ] Growth charts and statistics

## Non-Functional Requirements
- Performance: Page load < 2s, smooth 60fps animations
- Security: Private by default, Supabase Auth, row-level security
- SEO: Meta tags, OG images for public pages
- Accessibility: Semantic HTML, keyboard navigation
- Future-proof: Architecture tương thích React Native mobile app
