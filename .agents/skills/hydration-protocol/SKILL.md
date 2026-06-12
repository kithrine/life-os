---
name: hydration-protocol
description: Use when implementing or reviewing LifeOS page hydration, dashboard data wiring, schema-backed trackers, empty states, and visual dashboard pages. Triggers for finance, goals, health, profile, career, dashboard widgets, hardcoded data removal, Prisma model expansion, and page-by-page execution.
---

# LifeOS Hydration Protocol

## Purpose

Use this skill to turn LifeOS scaffold pages into real schema-backed dashboard
surfaces. The goal is polished data entry plus data visualization. Do not ship
fake user metrics.

The primary focus is mathematical, relational data: transactions, budgets,
accounts, goals, milestones, habits, health metrics, workouts, moods, skills,
and applications. Profile text fields are contextual/cosmetic and must not drive
analytics widgets.

## Operating Mode

Before editing code:

1. Read `battle_plan.md`.
2. Inspect the current route/component/action files relevant to the page.
3. Identify all real data sources and all hardcoded user metrics.
4. State the page-specific plan.
5. Work one page or one data domain at a time.
6. After completing a full domain slice, stop for user review before starting
   the next domain.
7. For every proposed widget, name the source Prisma table(s) and aggregation
   before implementing it.

## Forbidden Files Unless Explicitly Approved

- `middleware.ts`
- `app/sign-in/**`
- `app/sign-up/**`
- Clerk routing/configuration files
- unrelated auth/login code

## Allowed Work Areas

- `app/dashboard/**`
- `app/finance/**`
- `app/goals/**`
- `app/health/**`
- `app/career/**`
- `app/profile/**`
- `app/insights/**` only if requested
- `app/ai-coach/**` only if requested
- `components/dashboard/**`
- `components/finance/**`
- `components/goals/**`
- `components/health/**`
- `components/career/**`
- `components/profile/**`
- `actions/**`
- `prisma/schema.prisma` only during an approved schema stage
- tests related to changed behavior

## Data Rules

- Resolve `auth().userId` to `UserProfile.id` before reading or writing child
  records.
- Never store raw Clerk IDs in relation fields like `Goal.userId`,
  `Habit.userId`, `MoodEntry.userId`, or finance/health child models.
- Validate record ownership before update/delete.
- Prefer server actions for mutations.
- Each mutation must revalidate the local page and `/dashboard`.
- Client components may call `router.refresh()` after server actions.
- Every visible number, table row, chart segment, progress bar, and sparkline
  must map to a specific Prisma query or derived aggregation.
- Do not use profile text fields such as `currentSituation`,
  `biggestChallenge`, `careerGoals`, `financialGoals`, `healthGoals`,
  `personalGrowthGoals`, or `futureVision` as sources for quantitative widgets.
- Do not pass invented summary values through props when the UI can derive them
  from source records.

## Widget Binding Rules

Each widget implementation must be explainable as:

```text
Widget -> Prisma source table(s) -> filter -> aggregation -> display
```

Examples:

- Monthly spending -> `Transaction` -> active user + selected month + expense
  type -> sum amount -> metric card.
- Spending breakdown -> `Transaction` -> active user + selected month + expense
  type -> group by category -> donut chart.
- Recent transactions -> `Transaction` -> active user -> latest records -> table.
- Budget usage -> `Budget` + `Transaction` -> active user + selected month ->
  limit compared with category expense sum -> progress bars.
- Account snapshot -> `FinancialAccount` -> active user + not archived ->
  balance cards/list.
- Goal progress -> `Goal` + `Milestone` -> active user -> progress and
  completed milestone ratio -> cards/bars.
- Health activity -> `HealthMetricEntry` + `WorkoutEntry` -> active user + date
  range -> sums/averages -> cards/charts.
- Mood trend -> `MoodEntry` -> active user + date range -> chronological mood
  values -> sparkline.

If adding one source record should affect multiple widgets, update/revalidate so
all affected widgets recalculate from the database. Example: adding a Starbucks
transaction must update monthly spending, recent transactions, spending
breakdown, cashflow, budget usage, and dashboard finance summaries.

## UI Rules

- Match the existing dashboard visual language:
  - white cards
  - soft shadows
  - rounded corners
  - light gray page background
  - lucide icons in colored icon containers
  - compact metric cards
  - native SVG/CSS visualizers
- Do not invent a separate visual design system.
- Use dense dashboard layouts like the provided finance/fitness mockups, but
  only for data the app can actually track.
- Every navigable app page should use or preserve the shared dashboard/sidebar
  navigation shell.
- The existing `/profile` route should be preserved. Do not rebuild it unless
  explicitly asked; only polish or extend it within an approved profile scope.
- Do not let profile preservation distract from the core data dashboards.
- Act as a senior UI/UX designer inside the approved domain slice: build dense,
  scannable, high-information pages with meaningful entry flows and visual
  feedback, not sparse CRUD screens.

## Hardcoded Data Rules

Allowed:

- Labels
- Category names
- Empty-state helper copy
- Icon mappings
- Color mappings
- Default form values

Forbidden:

- Fake user money amounts
- Fake health scores
- Fake steps, sleep, calories, workouts, moods
- Fake goals or habits that appear as user data
- Fake AI advice that claims knowledge of user progress
- Static upcoming events presented as real

When data is missing, render an honest empty state.

Hardcoded style scaffolding is allowed. Hardcoded user reality is not.

## Empty-State Rules

Every card/widget/page section needs:

1. Data state.
2. Empty state.
3. Error/unavailable state where appropriate.

Empty states must:

- Keep the card/grid structure alive.
- Avoid layout collapse.
- Include inline quick-add forms when useful.
- Show zero or unavailable metrics clearly.
- Avoid generic spinner-only UI.
- Avoid fake sample data unless it is visually and textually marked as a sample.

## Visualizer Rules

Use native SVG/CSS first:

- progress rings
- sparklines
- trendlines
- donut breakdowns
- category bars
- weekly activity charts
- progress bars

Do not add a chart library unless the user approves it.

Small dataset behavior:

- 0 points: empty chart shell with CTA.
- 1 point: single value display and "Need more entries for trend."
- 2 to 14 points: sparkline/trendline.
- Large datasets: aggregate by week/month as needed.

## Schema Rules

Schema edits require an explicit schema stage.

When schema edits are allowed:

1. Propose model/field changes before editing.
2. Keep additions minimal and tied to page needs.
3. Run Prisma format/generate after edits.
4. Do not run migrations without approval if the environment is connected to a
   shared or production-like database.

For the finance execution slice, draft or apply only finance-owned schema:

- `FinancialAccount`
- `Transaction`
- `Budget`
- `NetWorthSnapshot`

Do not mix health, goals, or dashboard schema changes into the finance slice
unless the user explicitly expands the scope.

Recommended full-vision additions from `battle_plan.md`:

- `FinancialAccount`
- `Transaction`
- `Budget`
- `NetWorthSnapshot`
- `HealthMetricEntry`
- `WorkoutEntry`

## Revalidation Map

- Goals/milestones: `/goals`, `/dashboard`
- Habits/habit logs: `/health`, `/dashboard`
- Mood: `/health`, `/dashboard`
- Health metrics: `/health`, `/dashboard`
- Workouts: `/health`, `/dashboard`
- Savings goals: `/finance`, `/dashboard`
- Accounts/transactions/budgets/net worth: `/finance`, `/dashboard`
- Skills/applications: `/career`, `/dashboard`
- Profile: `/profile`, `/dashboard`

## Execution Loop

For each page/domain:

1. Inventory current files and hardcoded values.
2. Confirm schema/data sources.
3. Implement server actions/data helpers.
4. Implement page UI and components.
5. Replace dashboard widget fake data for that domain.
6. Add or update focused tests.
7. Run typecheck.
8. Run relevant tests.
9. Inspect the route visually if a dev server/browser is available.
10. Patch layout/data issues before moving to the next page.
11. Stop and report the completed slice for user approval.

## Verification Commands

Prefer:

```bash
npx tsc --noEmit
npm run lint
npm run test
```

For focused work, run the nearest relevant Vitest suites first, then broaden.

## Review Checklist

- No auth/login route changes.
- No fake user metrics remain in touched widgets.
- All mutations check active user ownership.
- All mutations revalidate local page and `/dashboard`.
- Empty states are structural and useful.
- Dashboard widgets navigate to real pages.
- Mobile layout does not overflow.
- Typecheck and relevant tests pass or failures are clearly reported.
