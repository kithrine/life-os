# LifeOS — Your Life. Optimized.

![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-138_passing-brightgreen)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

A full-stack personal operating system for tracking goals, finance, health, and career — all in one dashboard.

**Live demo:** https://lifeos-360.vercel.app/

---

## What is LifeOS?

LifeOS is a personal life-management OS built for people who want a single place to see how their life is actually going. After a guided multi-select onboarding assessment, users land on a dashboard that aggregates all four life domains — goals, finance, health, and career — into real-time widgets backed by a live database. Every metric shown traces to a real row; no placeholder data.

---

## Features

### Dashboard
- Time-aware greeting (Good morning / afternoon / evening)
- **Life Score Card** — composite wellness metric with progress ring
- **Stats Bar** — active goals count, habits on track, monthly cashflow, health score
- Widget grid: Goals, Habits, AI Coach, Career Overview, Finance, Health, Upcoming Events

### Goals & Milestones
- Create goals across five categories: Finance, Health, Career, Personal, Growth
- Break each goal into milestones; overall progress auto-calculates from milestone completions
- Visual progress bars per goal on the dashboard

### Finance Tracker
- Manual account management — assets (checking, savings, investments) and liabilities (credit, loans)
- Transaction logging with merchant, category, and amount
- Monthly budget limits with real-time usage indicators
- Savings goals with contribution tracking and progress bars
- Automatically derived: net worth, monthly cashflow, savings rate, 6-month historical charts

### Health & Habits
- Daily habit logging with consecutive streak tracking
- 7-day completion grid per habit (Mon–Sun view)
- Daily mood logging on a 1–5 scale with emoji display
- **Health score** computed from habit completion rate + average mood (50/50 weighted)

### Career Tracker
- Skills library with four proficiency levels: Beginner, Intermediate, Advanced, Expert
- Job application pipeline with status tracking: Applied → Interviewing → Offer → Rejected / Accepted

### Guided Onboarding Assessment
Seven multi-select question groups collected at signup:

| # | Question | Type |
|---|----------|------|
| 1 | Life Stage | Single select |
| 2 | Current Situation | Multi-select |
| 3 | Biggest Challenge | Multi-select |
| 4 | Career Goals | Multi-select |
| 5 | Financial Goals | Multi-select |
| 6 | Health Goals | Multi-select |
| 7 | Personal Growth Goals | Multi-select |

Plus an optional free-text field for additional context. Answers personalize the AI Coach and future recommendations. A "Skip for now" option is available.

### AI Coach *(coming soon)*
OpenAI SDK is integrated and ready — the conversation interface is in active development.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript 5 |
| Auth | Clerk v7 — Email/password + Google, Apple, Microsoft SSO |
| Database | PostgreSQL (Neon) via Prisma 7 |
| Styling | Tailwind CSS 4, shadcn/ui, Lucide React icons |
| AI | OpenAI SDK |
| Testing | Vitest, React Testing Library |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (we use [Neon](https://neon.tech) — free tier works)
- A [Clerk](https://clerk.com) account
- An [OpenAI](https://platform.openai.com) API key (optional — only needed for AI Coach)

### Installation

```bash
git clone https://github.com/kithrine/life-os.git
cd life-os
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Generate the Prisma client and push the schema to your database:

```bash
npm run prisma:generate
npm run prisma:push
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@host/db`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `OPENAI_API_KEY` | OpenAI API key (for AI Coach features) |
| `NEXT_PUBLIC_BYPASS_AUTH` | Set to `true` to skip auth in local dev (optional) |

---

## Database

The Prisma schema lives at `prisma/schema.prisma`. The generated client is output to `lib/generated/prisma/` and is gitignored — you must regenerate it after every `git pull` that includes schema changes.

**14 models:** `UserProfile`, `LifeBlueprint`, `Goal`, `Milestone`, `Habit`, `HabitLog`, `MoodEntry`, `SavingsGoal`, `FinancialAccount`, `Transaction`, `Budget`, `NetWorthSnapshot`, `JobApplication`, `Skill`

### Useful scripts

```bash
npm run prisma:generate   # Regenerate client after schema changes
npm run prisma:push       # Push schema to DB (no migration file)
npm run prisma:migrate    # Create and apply a named migration
npm run prisma:studio     # Open Prisma Studio GUI
npm run prisma:format     # Format schema.prisma
```

> **After every `git pull`:** if `prisma/schema.prisma` changed, run `npm run prisma:generate` before starting the dev server.

---

## Testing

```bash
npm test                   # Watch mode
npm run test -- --run      # Single run (CI)
npm run test:coverage      # Coverage report
```

138 tests across 16 test files using Vitest + React Testing Library. Coverage includes all dashboard widgets, server action logic, login form, and career components.

---

## Project Structure

```
app/
  page.tsx                 # Login / landing page
  dashboard/               # Main dashboard (data fetching + widget composition)
  goals/                   # Goals management
  finance/                 # Finance tracker
  health/                  # Health & habits
  career/                  # Career tracker
  profile/                 # User profile
  onboarding/              # Guided multi-select assessment
  blueprint/               # Post-onboarding landing (AI blueprint — coming soon)
  sign-in/ sign-up/        # Clerk auth pages

components/
  dashboard/               # 11 widgets + sidebar + hero banner
  auth/                    # Login form, LifeOS logo
  career/ goals/ profile/  # Domain-specific components

actions/                   # Next.js Server Actions
  goals.ts habits.ts finance.ts career.ts
  mood.ts health.ts life-score.ts profile.ts

lib/
  prisma.ts                # Prisma client singleton
  generated/prisma/        # Generated client (gitignored — run prisma:generate)

prisma/
  schema.prisma            # Database schema (14 models)

tests/                     # Vitest test suites
```

---

## Team

| Domain | Owner |
|--------|-------|
| Goals & Blueprint | Project Lead |
| Finance | Jordan |
| Dashboard & Infrastructure | Kit |
| Health & AI Coach | Summer |
