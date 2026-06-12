# LifeOS Hydration Battle Plan

## Mission

Turn LifeOS from a scaffolded dashboard into a real multi-page personal data
operating system. Every navigable surface should let the user enter, edit, and
delete real data, then visualize that same data through polished dashboard-style
cards, tables, progress bars, rings, and trendlines.

The target is the level of density and polish shown in the finance and fitness
mockups: structured metrics, visual summaries, focused tables, and useful
quick-add flows. The product is not an AI coach yet. First, it must become a
strong human-entered data organizer with clean visual feedback.

The center of gravity is mathematical, relational user data: transactions,
budgets, accounts, goals, milestones, habits, health metrics, workouts, moods,
skills, and applications. Profile text fields are contextual/cosmetic and must
not drive analytical widgets.

## Non-Negotiables

- No fake user metrics in production UI.
- No hardcoded values that pretend to be user data.
- Placeholder labels and visual shells are allowed only when they are clearly
  empty states.
- All user-owned records must resolve through `UserProfile.id`, not raw Clerk
  user IDs.
- Auth and login routing must remain stable.
- Every mutation must revalidate its owning page and `/dashboard`.
- Pages should share the current dashboard navigation shell and visual language.
- New schema is allowed for the full vision, but migrations must be planned and
  reviewed before execution.
- Every chart, table, card metric, and graph must have an explicit database
  source table and query rule.
- Profile fields such as "current situation", "biggest challenge", and "future
  vision" must not be used as sources for mathematical dashboard metrics.

## Data-Binding Mandate

Every widget must be a direct reflection of a relational Prisma query. A future
implementation agent should be able to point at any visible number, row, chart
segment, progress bar, or sparkline and name the exact table(s), filters, and
aggregation that produced it.

Examples:

- Finance monthly spending = sum of negative `Transaction.amount` values for
  the active user's selected month.
- Finance spending breakdown donut = grouped `Transaction` expense totals by
  category for the active user's selected month.
- Recent transactions table = latest `Transaction` records for the active user.
- Budget bars = `Budget.limitAmount` compared with grouped monthly
  `Transaction` expense totals.
- Accounts snapshot = `FinancialAccount.balance` by account.
- Net worth = `NetWorthSnapshot.netWorth` or derived account assets minus
  liabilities.
- Goals progress = `Goal.progress` plus `Milestone.completed` ratios.
- Health cards = `HealthMetricEntry`, `WorkoutEntry`, `HabitLog`, and
  `MoodEntry`.

If a user adds a transaction for Starbucks, the UI must recalculate monthly
spending, recent transactions, spending breakdown, cashflow, budget usage, and
dashboard finance summaries from database state. Do not pass around invented
summary values when the UI can derive them from source records.

## Profile Boundary

The profile page exists and should be preserved. It is not the focus of the
hydration push.

Profile fields are allowed to power:

- Profile display.
- Greeting/name context.
- Onboarding completeness.
- Later qualitative AI context after the core app works.

Profile fields are not allowed to power:

- Finance charts.
- Health charts.
- Goal analytics.
- Life score math.
- Dashboard numerical widgets.

Do not burn implementation cycles mapping profile paragraphs into dashboards.
Build the data engine first.

## Current Navigation Reality

The dashboard sidebar currently exposes:

- `/dashboard`: exists and is the strongest scaffold.
- `/goals`: exists but only renders placeholder text.
- `/finance`: exists but only renders placeholder text.
- `/career`: exists and is partially functional.
- `/health`: exists and is partially functional but visually underbuilt.
- `/ai-coach`: linked in sidebar but no route was found in the local scan.
- `/insights`: linked in sidebar but no route was found in the local scan.
- `/profile`: exists and uses the shared sidebar shell. It should be preserved,
  not rebuilt. Later work should only polish or extend it if needed.

## Current Hardcoded Data To Remove

Dashboard widgets currently include real scaffolding but several fake values:

- `LifeScoreCard`: hardcoded score and trend copy.
- `StatsBar`: fake fallback goal, habit, finance, and health values.
- `GoalsWidget`: fake placeholder goals.
- `HabitsWidget`: fake placeholder habits.
- `FinanceWidget`: real savings goal support, but hardcoded income, expenses,
  and net savings.
- `HealthWidget`: hardcoded health score, steps, mood, and sleep.
- `AiCoachWidget`: static recommendation copy. Defer real intelligence.
- `UpcomingWidget`: static calendar-like events with no data model.

These can keep their visual structure, but every displayed user metric must come
from the database or be clearly labeled as an empty state.

## Target Product Shape

LifeOS should become a set of domain dashboards:

- Dashboard: cross-domain command center.
- Goals: goal planning, milestones, progress, and category balance.
- Finance: accounts, transactions, budgets, savings goals, net worth, cashflow.
- Health: daily metrics, habits, workouts, sleep, mood, and trend summaries.
- Career: skills, applications, pipeline, career goals, and progress.
- Profile: preserved contextual page, not a core analytics source.
- Insights: later aggregate analytics across domains.
- AI Coach: later LLM layer over real data.

## Visual Direction

Use the current dashboard style as the base:

- White cards on light gray background.
- Rounded card corners and soft shadows.
- Lucide icons in small colored icon containers.
- Dense but readable grids.
- Indigo, green, rose, orange, blue, and violet accent colors.
- Native SVG rings, sparklines, bars, and simple donut charts.
- Left sidebar navigation shared across app pages.

Do not suddenly convert the app into a totally different design system. The
mockups are a fidelity target for information density and polish, not an
instruction to copy every finance/fitness feature literally.

Act like a senior product designer while implementing: dense screens are good
when they are structured, scannable, and grounded in real actions. Prefer
page-specific dashboards with metric strips, analytic cards, visualizers,
tables, and inline create/edit flows over sparse CRUD pages.

## Data Ownership Foundation

Before building the big dashboards, fix the data ownership pattern.

Correct pattern:

1. Read Clerk user ID from `auth()`.
2. Find or create `UserProfile` by `clerkUserId`.
3. Use `UserProfile.id` for child records.
4. On update/delete, verify the target record belongs to the active profile.

Known risk:

- `actions/career.ts` follows this pattern.
- `actions/habits.ts`, `actions/mood.ts`, and `actions/life-score.ts` currently
  use raw Clerk IDs for child model ownership and queries.

This must be fixed before health/dashboard data can be trusted.

## Schema Expansion Strategy

The full visual vision requires schema growth. Do not patch the UI with fake
finance or health metrics. Add the minimal durable models that make the UI real.

### Existing Models To Keep And Use

`UserProfile`

- Powers profile and onboarding context only.
- Fields: name, life stage, current situation, challenges, domain goals, future
  vision.
- Do not use profile text fields to produce quantitative analytics.

`Goal`

- Powers goals page and dashboard goal cards.
- Fields: title, category, progress.
- Needs future status, due date, priority, description.

`Milestone`

- Powers goal checklists and completion percentages.
- Already supports completed/not completed.

`Habit`

- Powers habit list, streaks, dashboard habit cards.
- Needs future schedule/frequency if serious habit tracking is required.

`HabitLog`

- Powers completion history and weekly habit strips.

`MoodEntry`

- Powers daily mood and mood trendlines.
- Already supports note.

`SavingsGoal`

- Powers savings goals and finance progress.
- Not enough for full finance dashboard.

`JobApplication`

- Powers career pipeline.

`Skill`

- Powers skills inventory and skill-level bars.

`LifeBlueprint`

- Can power a profile/blueprint history page later.

### Proposed Phase 1 Schema Additions

These are the models needed to make the finance and health pages real.

`FinancialAccount`

- `id`
- `userId`
- `name`
- `type`: checking, savings, investment, credit, cash, loan
- `institution`
- `balance`
- `currency`
- `isArchived`
- timestamps

Purpose:

- Account snapshot card.
- Net worth.
- Positive/negative balance visibility.

`Transaction`

- `id`
- `userId`
- `accountId`
- `date`
- `merchant`
- `category`
- `amount`
- `type`: income, expense, transfer, adjustment
- `note`
- timestamps

Purpose:

- Recent transactions table.
- Monthly spending.
- Cashflow.
- Spending breakdown.
- Category trendlines.

`Budget`

- `id`
- `userId`
- `category`
- `limitAmount`
- `period`: monthly
- `month`
- timestamps

Purpose:

- Budget progress bars.
- Over/under budget summaries.

`NetWorthSnapshot`

- `id`
- `userId`
- `date`
- `assets`
- `liabilities`
- `netWorth`

Purpose:

- Net worth trendline.
- Dashboard finance stat.

`HealthMetricEntry`

- `id`
- `userId`
- `date`
- `steps`
- `activeMinutes`
- `calories`
- `sleepMinutes`
- `restingHeartRate`
- `recoveryScore`
- `weight`
- `bodyFatPercent`
- `note`
- timestamps

Purpose:

- Fitness/health metric cards.
- Daily edit form.
- Trendlines without pretending to start workouts.

`WorkoutEntry`

- `id`
- `userId`
- `date`
- `name`
- `type`: strength, cardio, mobility, sport, other
- `durationMinutes`
- `calories`
- `intensity`: low, medium, high
- `note`
- timestamps

Purpose:

- Workout history table.
- Weekly workout count.
- Calories/activity summaries.

### Proposed Phase 2 Schema Additions

These should wait until the core pages work.

`Goal.status`, `Goal.dueDate`, `Goal.priority`, `Goal.description`

- Makes goal planning more serious.

`Habit.frequency`, `Habit.targetCount`, `Habit.category`

- Makes habits more accurate than simple streaks.

`CalendarEvent`

- Replaces static upcoming widget.

`Insight`

- Stores generated non-LLM or later LLM insights.

`AiCoachMessage`

- Later conversation memory after core data is real.

## Page Plans

### Dashboard

Purpose:

- One-screen overview of all major life domains.

Required sections:

- Hero greeting.
- Life score card.
- Stats bar.
- Goals widget.
- Habits widget.
- Finance widget.
- Health widget.
- Career widget.
- Optional upcoming/insights area only when backed by data.

Data sources:

- `UserProfile`
- `Goal`
- `Milestone`
- `Habit`
- `HabitLog`
- `MoodEntry`
- `SavingsGoal`
- `FinancialAccount`
- `Transaction`
- `Budget`
- `HealthMetricEntry`
- `WorkoutEntry`
- `JobApplication`
- `Skill`

Metrics:

- Goals active count.
- Average goal progress.
- Milestone completion percentage.
- Habit count and best streak.
- Today's habit completion count.
- Latest mood and 7-day average mood.
- Net worth.
- Monthly spending.
- Savings rate.
- Cashflow.
- Health score based on real metrics and habits.
- Career active applications and interview count.

Hardcoded values allowed:

- Labels.
- Empty-state copy.
- Icon choices.
- Color mappings.

Hardcoded values forbidden:

- Scores.
- User counts.
- Money amounts.
- Steps.
- Sleep.
- Mood.
- Career progress.

### Finance

Purpose:

- Personal finance data entry and visualization.

Target layout:

- Header with page title, month filter, quick add.
- Top metric row: net worth, monthly spending, savings rate, cashflow.
- Spending breakdown donut.
- Budget progress bars.
- Accounts snapshot.
- Recent transactions table.
- Savings goals progress.
- Finance insight card that uses deterministic rules, not LLM.

User actions:

- Add/edit/delete account.
- Add/edit/delete transaction.
- Add/edit/delete budget.
- Add/edit/delete savings goal.
- Add net worth snapshot or derive from account balances.

Visualizers:

- Native SVG sparkline for each top metric.
- Native SVG donut for category spending.
- CSS progress bars for budgets and savings goals.
- Table for recent transactions.

Empty states:

- Empty account snapshot: show "Add your first account" inline.
- Empty transactions: show a clean empty table with add transaction CTA.
- Empty budgets: show category budget quick-add.
- Empty spending breakdown: show neutral donut ring with zero center label.

Schema required:

- `FinancialAccount`
- `Transaction`
- `Budget`
- optional `NetWorthSnapshot`
- existing `SavingsGoal`

### Goals

Purpose:

- Convert high-level ambitions into trackable goals and milestones.

Target layout:

- Header with title, quick add goal.
- Top metric row: active goals, average progress, milestones completed, focus
  category.
- Goal category balance chart.
- Main goal board by category.
- Goal detail cards with milestones.
- Recently completed milestones.

User actions:

- Add/edit/delete goal.
- Update goal progress.
- Add/edit/delete milestone.
- Mark milestone complete/incomplete.

Visualizers:

- Category balance bars.
- Average progress ring.
- Per-goal progress bars.
- Milestone completion chips.

Empty states:

- Structural goal board remains visible.
- Inline "Create first goal" form.
- Category tiles show zero state, not fake goals.

Schema required:

- Current `Goal` and `Milestone` are enough for a strong first version.

Future schema:

- `Goal.status`
- `Goal.dueDate`
- `Goal.priority`
- `Goal.description`

### Health

Purpose:

- Track daily health metrics, habits, workouts, mood, and simple recovery.

Target layout:

- Header with page title and daily quick add.
- Top metric row: steps, workouts, recovery score, active minutes.
- Weekly activity overview.
- Health metric cards.
- Habit tracker.
- Mood tracker.
- Workout history.
- Body/wellness trends.

User actions:

- Add/edit/delete daily health metrics for a date.
- Add/edit/delete workout.
- Add/delete habit.
- Complete habit.
- Log/edit mood.

Visualizers:

- Native SVG line chart for weekly steps/active minutes/calories.
- Native SVG sparklines for sleep, heart rate, recovery.
- CSS progress bars for daily goals.
- Simple table/list for workout history.

Empty states:

- If no health metrics exist, keep all panels visible with "Add today's metrics".
- If one metric day exists, show point values and "Need more days for trend."
- If no workouts exist, show empty workout history with add workout CTA.

Schema required:

- Existing `Habit`, `HabitLog`, `MoodEntry`.
- New `HealthMetricEntry`.
- New `WorkoutEntry`.

Avoid:

- "Start workout" button unless it launches a real flow.
- Wearable-like live tracking claims.
- Hardcoded step/sleep/calorie values.

### Career

Purpose:

- Track skills and job application pipeline.

Target layout:

- Header with quick add.
- Top metric row: active applications, interviews, offers, skills.
- Pipeline status board.
- Applications table.
- Skills grid with levels.
- Career goals pulled from `Goal` category `career`.

User actions:

- Add/edit/delete skill.
- Add/edit/delete application.
- Change application status.

Visualizers:

- Pipeline count bars.
- Skill level bars.
- Recent application status timeline.

Schema required:

- Current `JobApplication` and `Skill`.
- Optional use of `Goal` category `career`.

Future schema:

- application notes, contacts, due dates, interview dates.

### Profile

Purpose:

- Display the user's life context from onboarding/profile data. The route now
  exists, so this is a preservation/polish target rather than a rebuild target.
- Stay out of the critical path for finance, goals, health, and dashboard data
  hydration.

Target layout:

- Profile summary card.
- Life stage and current situation.
- Biggest challenge.
- Domain goal cards: career, finance, health, growth.
- Future vision.
- Blueprint summary/history if available.

User actions:

- Preserve existing profile behavior.
- Add edit/save only if the current implementation does not already provide it
  and the user explicitly approves that scope.

Dashboard connection:

- Sidebar profile card and greeting/context only.
- No quantitative dashboard metrics should depend on profile text fields.

Schema required:

- Current `UserProfile`.
- Optional `LifeBlueprint`.

### Insights

Purpose:

- Later cross-domain analytics page.

Phase 1 recommendation:

- Either remove/hide the nav item or add a real "coming soon after data setup"
  page that does not fake insights.

Future data:

- Aggregated deterministic summaries across finance, health, goals, and career.

### AI Coach

Purpose:

- Later LLM interface over real LifeOS data.

Phase 1 recommendation:

- Deprioritize.
- Remove fake coaching claims from dashboard or mark them as deterministic
  "Insight" cards based on real data.

## Visualizer Library Decision

Recommendation for first implementation:

- Use native SVG and CSS visualizers.
- Do not install a charting library during the first full hydration push unless
  native SVG becomes a bottleneck.

Reasons:

- Existing code already uses SVG rings and mood trendlines.
- The required charts are simple: sparklines, rings, donuts, bars.
- Native SVG avoids dependency churn while schema and UX are still changing.
- Visual consistency is easier to control.

Native visualizer primitives to build:

- `MetricSparkline`
- `ProgressRing`
- `DonutBreakdown`
- `CategoryBars`
- `TrendLine`
- `WeeklyActivityChart`
- `EmptyChartShell`

Possible later dependency:

- Recharts if we need tooltips, axes, multi-series charts, and responsive chart
  behavior across complex datasets.

## Empty State Doctrine

Every widget must have three states:

1. Loaded with data.
2. Loaded with no data.
3. Error or unavailable data.

No-data state requirements:

- Same card size and layout skeleton as data state.
- Clear empty copy.
- Inline quick-add when useful.
- No fake numbers.
- Neutral chart shell when a visualizer is expected.
- Helpful "what this will show" copy is allowed.

Examples:

- Finance donut: gray ring, center text "No spending yet".
- Transaction table: headers visible, one empty row with add button.
- Mood trend: flat empty panel saying "Log two moods to see a trend".
- Health weekly chart: axis shell plus add today's metrics CTA.
- Goal board: category columns visible with add goal CTA.

## Revalidation Strategy

Every server action should revalidate:

- The local page route.
- `/dashboard`.

Mapping:

- Goal or milestone changed: `/goals`, `/dashboard`.
- Habit or habit log changed: `/health`, `/dashboard`.
- Mood changed: `/health`, `/dashboard`.
- Health metrics changed: `/health`, `/dashboard`.
- Workout changed: `/health`, `/dashboard`.
- Savings goal changed: `/finance`, `/dashboard`.
- Account, transaction, budget, net worth changed: `/finance`, `/dashboard`.
- Skill or application changed: `/career`, `/dashboard`.
- Profile changed: `/profile`, `/dashboard`.

Client components may still call `router.refresh()` after mutations for
immediate UI refresh.

## Agentic Execution Plan

### Stage 0: Checkpoint

- Ensure git checkpoint exists before autonomous work.
- Record dirty files and avoid reverting user changes.

### Stage 1: Read-Only Final Discovery

- Re-scan schema, actions, routes, tests, and components.
- Confirm whether `/ai-coach` and `/insights` exist in the current branch.
- Confirm current `/profile` behavior and preserve it unless specifically asked
  to polish it.
- List all hardcoded user data.

### Stage 2: Data Foundation

- Add ownership helpers for `clerkUserId -> UserProfile.id`.
- Fix health/habit/mood/life-score ownership.
- Draft or apply the approved domain schema additions for the next execution
  slice.
- Run Prisma format/generate/migrate only after explicit approval.

### Stage 3: Finance

- Build the complete finance domain as the first full page execution slice:
  models, actions, components, and page UI.
- Hydrate dashboard finance widget and stats.
- Verify empty state, created-data state, and dashboard sync.
- Stop for user review before moving to the next domain.

### Stage 4: Goals

- Build goals actions/components/page.
- Hydrate dashboard goals widget and goal stats.
- Add milestone interactions.
- Stop for user review before moving to the next domain.

### Stage 5: Health

- Build health metrics and workout entries.
- Restyle health page to match dashboard density.
- Hydrate dashboard health widget and life score.
- Stop for user review before moving to the next domain.

### Stage 6: Profile

- Preserve the existing profile page and shared sidebar layout.
- Only polish or extend profile after finance, goals, health, and career are
  stable.
- Revalidate dashboard/profile after any approved profile edits.

### Stage 7: Career Polish

- Bring career page visual density up to the same standard.
- Add metrics and visualizers using current models.

### Stage 8: Dashboard Truth Pass

- Remove all fake dashboard metrics.
- Replace unsupported widgets with empty states or hide until backed by data.
- Make every widget route to a real page.
- Do this after the domain pages are built, because dashboard should aggregate
  proven domain data rather than drive the data model prematurely.

### Stage 9: Verification Loop

- Run `npx tsc --noEmit`.
- Run relevant Vitest suites.
- Run lint.
- Start dev server.
- Inspect routes in browser at desktop and mobile widths.
- Fix layout, overflow, and blank-state issues.

## Subagent Strategy

Use parallel agents only after the schema/data ownership plan is locked.

Recommended split:

- Agent A: schema and shared data helpers.
- Agent B: finance page/actions/components.
- Agent C: goals page/actions/components.
- Agent D: health page/actions/components.
- Agent E: career polish/profile preservation review.
- Agent F: dashboard hydration and hardcoded-data removal after domain pages.
- Agent G: visual QA and tests.

Write scopes must be disjoint when agents run in parallel.

## Immediate Decisions Needed

1. Confirm schema changes are allowed for the big push.
2. Confirm that the existing `/profile` route should be preserved and only
   polished later.
3. Decide whether `/ai-coach` and `/insights` should be hidden, stubbed honestly,
   or built later.
4. Approve native SVG/CSS visualizers for the first pass.
5. Approve dashboard-wide removal of fake user metrics.
6. Approve finance as full data model: accounts, transactions, budgets, savings,
   net worth.
7. Approve health as full data model: daily metrics, workouts, habits, mood.
