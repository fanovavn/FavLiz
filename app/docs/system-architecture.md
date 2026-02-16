# FavLiz – System Architecture

## Overview

FavLiz follows a full-stack architecture with Next.js 16 App Router, backed by Supabase for database, authentication, and file storage.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│  Next.js 16 (App Router) + React + TypeScript│
│  TailwindCSS · Glassmorphism UI             │
├─────────────────────────────────────────────┤
│                  BACKEND                    │
│  Next.js API Routes                         │
│  Prisma v7 ORM                              │
├─────────────────────────────────────────────┤
│                 DATABASE                    │
│  Supabase (PostgreSQL + Auth + Storage)     │
├─────────────────────────────────────────────┤
│                 HOSTING                     │
│  Vercel (Frontend) · Supabase (Backend)     │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth group routes (login, register)
│   ├── (app)/            # Authenticated app routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── items/        # Items CRUD
│   │   ├── lists/        # Lists management
│   │   └── tags/         # Tags management
│   ├── share/            # Public share routes
│   ├── api/              # API Routes
│   └── layout.tsx        # Root layout
├── lib/                  # Shared utilities
│   ├── prisma.ts         # Prisma client singleton
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── components/           # Reusable React components
│   ├── ui/               # Base UI components (glass cards, buttons)
│   ├── forms/            # Form components
│   └── layout/           # Layout components (header, sidebar)
└── generated/            # Prisma generated client
```

## Database Schema

```
User ──1:M──> Item ──1:M──> Attachment
  │              │
  │              ├── M:M ──> Tag (via ItemTags)
  │              └── M:M ──> List (via ItemLists)
  │
  ├──1:M──> Tag
  └──1:M──> List
```

### Key Models
- **User**: Authentication, profile (email, name, avatar, role)
- **Item**: Core content (title, description, thumbnail, viewMode, shareSlug)
- **List**: Grouping mechanism (name, description, viewMode, shareSlug)
- **Tag**: Flexible labeling (name)
- **Attachment**: Media (type: link/image/video, url, metadata)

## Authentication Flow

1. **Register**: Email → OTP verification → Password creation
2. **Login**: Email + Password → JWT session via Supabase Auth
3. **Session**: Server-side validation via middleware

## Key Design Decisions

- **Private by default**: All items and lists are private unless explicitly shared
- **Glassmorphism UI**: Frosted glass cards with pink-red gradient accents
- **App Router**: Server components for SEO, client components for interactivity
- **Prisma ORM**: Type-safe database access with auto-generated client
