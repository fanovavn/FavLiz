# FavLiz – Codebase Summary

## Project Description
FavLiz ("Mọi thứ yêu thích, một nơi duy nhất") is a web application for saving, organizing, and sharing favorite items (recipes, restaurants, movies, books, locations, links) with a modern glassmorphism UI.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** TailwindCSS v4 + Glassmorphism
- **ORM:** Prisma v7
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT + bcryptjs
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles + Glassmorphism tokens
│   ├── login/              # Login page
│   │   └── page.tsx
│   └── register/           # 3-step registration
│       └── page.tsx
├── lib/                    # Shared utilities
│   └── prisma.ts           # Prisma client (likely)
├── generated/              # Auto-generated Prisma client
└── middleware.ts            # Auth middleware
```

## Key Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page - hero, features, CTA |
| `src/app/login/page.tsx` | Login form (email + password) |
| `src/app/register/page.tsx` | 3-step registration (Email → OTP → Password) |
| `src/middleware.ts` | Route protection, auth validation |
| `prisma/schema.prisma` | Database schema |
| `src/app/globals.css` | Design tokens, glassmorphism classes |

## Current Status
- **Phase 1 (Complete):** Landing page, Authentication (Login + Register)
- **Phase 2 (Next):** Dashboard + Items CRUD
- Database schema includes: User, Item, List, Tag, Attachment, ItemTags, ItemLists

## Design System
- **Color palette:** Pink (#f48fb1) → Red (#e91e63) gradient
- **Typography:** Inter font
- **UI Pattern:** Glassmorphism (frosted glass cards, soft shadows)
- **Theme:** Light only (MVP)
