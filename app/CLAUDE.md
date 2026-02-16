# CLAUDE.md – FavLiz

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FavLiz** – "Mọi thứ yêu thích, một nơi duy nhất."

FavLiz là công cụ web giúp người dùng lưu trữ, phân loại và chia sẻ danh sách các items yêu thích (công thức nấu ăn, nhà hàng, phim, sách, địa điểm, links…) với giao diện glassmorphism hiện đại, dễ sử dụng trên mọi thiết bị.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React + TypeScript
- **Styling:** TailwindCSS + Glassmorphism UI
- **Backend:** Next.js API Routes
- **ORM:** Prisma v7
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel (Frontend) + Supabase (Backend)
- **Font:** Inter (Google Fonts)

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

## Workflows

- Primary workflow: `./.claude/workflows/primary-workflow.md`
- Development rules: `./.claude/workflows/development-rules.md`
- Orchestration protocols: `./.claude/workflows/orchestration-protocol.md`
- Documentation management: `./.claude/workflows/documentation-management.md`
- And other workflows: `./.claude/workflows/*`

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** You must follow strictly the development rules in `./.claude/workflows/development-rules.md` file.
**IMPORTANT:** Before you plan or proceed any implementation, always read the `./PRD.md` file first to understand the product requirements.
**IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end, if any.
**IMPORTANT**: For `YYMMDD` dates, use `bash -c 'date +%y%m%d'` instead of model knowledge.

## PRD & Requirements

The full Product Requirements Document is at `../PRD.md` (one level above this app directory).
Always refer to it when implementing features.

## Documentation Management

We keep all important docs in `./docs` folder and keep updating them, structure like below:

```
./docs
├── project-overview-pdr.md
├── code-standards.md
├── codebase-summary.md
├── design-guidelines.md
├── deployment-guide.md
├── system-architecture.md
└── project-roadmap.md
```

## UI/UX Guidelines

| Aspect | Specification |
|--------|--------------|
| **Style** | Glassmorphism – frosted glass cards, soft shadows |
| **Theme** | Light only (MVP) |
| **Colors** | Gradient pink (#f48fb1) → red (#e91e63), pastel auto-avatars |
| **Typography** | Inter font, large readable sizes |
| **Responsive** | Desktop → Tablet → Mobile |
| **Interactions** | Hover lift effects, smooth transitions, loading spinners |

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio
```

## Project Structure

```
FavLiz/
├── PRD.md                    # Product Requirements Document
├── app/                      # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── lib/              # Utilities, Prisma client
│   │   └── generated/        # Prisma generated files
│   ├── prisma/               # Database schema
│   ├── public/               # Static assets
│   ├── docs/                 # Project documentation
│   ├── .claude/              # Claude Code configuration
│   │   ├── agents/           # AI agent definitions
│   │   ├── commands/         # Slash commands
│   │   ├── hooks/            # Event hooks
│   │   ├── skills/           # AI skills
│   │   └── workflows/        # Development workflows
│   └── .opencode/            # Open Code agent configurations
└── Product Spec – FavLiz.docx
```

**IMPORTANT:** *MUST READ* and *MUST COMPLY* all *INSTRUCTIONS* in project `./CLAUDE.md`, especially *WORKFLOWS* section is *CRITICALLY IMPORTANT*, this rule is *MANDATORY. NON-NEGOTIABLE. NO EXCEPTIONS. MUST REMEMBER AT ALL TIMES!!!*
