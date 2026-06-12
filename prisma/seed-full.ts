import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import type { prisma as PrismaInstance } from "@/lib/prisma";
type Db = typeof PrismaInstance;

type Role = "summer" | "jordan" | "kit" | "default";

// Add each teammate's Clerk user ID here to assign their role.
// Unknown IDs fall back to "default" (full balanced dataset).
const TEAMMATE_ROLES: Record<string, Role> = {
  "user_3F17tIhl9QmEoVtw6H7WuvKEcJ7": "summer",
  // "user_...": "jordan",
  // "user_...": "kit",
};

// CLI args take priority; fall back to SEED_CLERK_USER_ID env var.
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : process.env.SEED_CLERK_USER_ID
  ? [process.env.SEED_CLERK_USER_ID]
  : [];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function monthStart(monthsAgo: number): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

const PROFILES: Record<Role, {
  name: string;
  lifeStage: string;
  currentSituation: string;
  biggestChallenge: string;
  careerGoals: string;
  financialGoals: string;
  healthGoals: string;
  personalGrowthGoals: string;
  futureVision: string;
}> = {
  summer: {
    name: "Summer",
    lifeStage: "early-career",
    currentSituation: "Building healthy habits and growing as a software developer",
    biggestChallenge: "Staying consistent with health habits while balancing work",
    careerGoals: "Grow as a full-stack developer and contribute to products that help people",
    financialGoals: "Build savings and manage monthly expenses responsibly",
    healthGoals: "Exercise daily, track mood, and improve sleep quality",
    personalGrowthGoals: "Read consistently and practice mindfulness",
    futureVision: "Work remotely as a developer while maintaining a healthy, balanced lifestyle",
  },
  jordan: {
    name: "Jordan",
    lifeStage: "mid-career",
    currentSituation: "Stable income, actively managing finances and building long-term wealth",
    biggestChallenge: "Optimizing budget allocation and accelerating net worth growth",
    careerGoals: "Advance to a senior role and continue growing income",
    financialGoals: "Maximize savings rate, invest consistently, and reach a 6-month emergency fund",
    healthGoals: "Maintain regular exercise and reduce stress through routine",
    personalGrowthGoals: "Deepen knowledge of personal finance and long-term investing",
    futureVision: "Achieve financial independence within 10 years",
  },
  kit: {
    name: "Kit",
    lifeStage: "career-transition",
    currentSituation: "Actively job searching and building technical skills to break into software engineering",
    biggestChallenge: "Standing out in a competitive market and landing the right first tech role",
    careerGoals: "Land a software engineering role at a company that values growth and impact",
    financialGoals: "Manage expenses during job search and maintain financial runway",
    healthGoals: "Stay active and manage stress during an intense job search period",
    personalGrowthGoals: "Learn new technologies and ship portfolio projects that demonstrate real skill",
    futureVision: "Work at a company with a strong engineering culture and keep growing as a developer",
  },
  default: {
    name: "Demo User",
    lifeStage: "early-career",
    currentSituation: "Building skills and exploring career options",
    biggestChallenge: "Staying consistent with habits and managing finances",
    careerGoals: "Land a junior developer role within 6 months",
    financialGoals: "Build a 3-month emergency fund",
    healthGoals: "Exercise consistently and improve sleep",
    personalGrowthGoals: "Read more and reduce screen time",
    futureVision: "Work remotely as a full-stack developer",
  },
};

async function seedProfile(db: Db, clerkUserId: string, role: Role) {
  const data = PROFILES[role];
  return db.userProfile.upsert({
    where: { clerkUserId },
    update: data,
    create: { clerkUserId, ...data },
  });
}

// ─── Goals (shared across all roles) ─────────────────────────────────────────

const GOALS = [
  {
    title: "Get First Dev Job",
    category: "career",
    progress: 40,
    milestones: [
      { title: "Update portfolio", completed: true },
      { title: "Apply to 10 jobs", completed: false },
      { title: "Complete take-home project", completed: false },
    ],
  },
  {
    title: "Build Emergency Fund",
    category: "finance",
    progress: 65,
    milestones: [
      { title: "Save first $500", completed: true },
      { title: "Reach $1,000", completed: true },
      { title: "Reach $3,000", completed: false },
    ],
  },
  {
    title: "Improve Sleep Schedule",
    category: "health",
    progress: 55,
    milestones: [
      { title: "Sleep by midnight 5 days", completed: true },
      { title: "No phone 1hr before bed", completed: false },
    ],
  },
];

async function seedGoals(db: Db, userId: string) {
  for (const goal of GOALS) {
    const existing = await db.goal.findFirst({ where: { userId, title: goal.title } });
    const saved = existing
      ? await db.goal.update({
          where: { id: existing.id },
          data: { category: goal.category, progress: goal.progress },
        })
      : await db.goal.create({
          data: { userId, title: goal.title, category: goal.category, progress: goal.progress },
        });

    for (const m of goal.milestones) {
      const found = await db.milestone.findFirst({ where: { goalId: saved.id, title: m.title } });
      if (found) {
        await db.milestone.update({ where: { id: found.id }, data: { completed: m.completed } });
      } else {
        await db.milestone.create({ data: { goalId: saved.id, title: m.title, completed: m.completed } });
      }
    }
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

const HABIT_CONFIGS: Record<Role, {
  slug: string;
  title: string;
  streak: number;
  lastCompleted: number | null;
  logDays: number[];
}[]> = {
  summer: [
    { slug: "morning-run",      title: "Morning Run",     streak: 14, lastCompleted: 0,    logDays: Array.from({ length: 14 }, (_, i) => i) },
    { slug: "read-20-min",      title: "Read 20 Minutes", streak: 7,  lastCompleted: 0,    logDays: Array.from({ length: 7 },  (_, i) => i) },
    { slug: "drink-water",      title: "Drink Water",     streak: 5,  lastCompleted: 0,    logDays: Array.from({ length: 5 },  (_, i) => i) },
    { slug: "evening-stretch",  title: "Evening Stretch", streak: 10, lastCompleted: 0,    logDays: Array.from({ length: 10 }, (_, i) => i) },
    { slug: "meditate",         title: "Meditate",        streak: 3,  lastCompleted: 0,    logDays: [0, 1, 2] },
    { slug: "journal",          title: "Journal",         streak: 0,  lastCompleted: 5,    logDays: [5, 8, 12, 18, 25] },
  ],
  jordan: [
    { slug: "morning-workout",  title: "Morning Workout", streak: 5,  lastCompleted: 0,    logDays: [0, 1, 2, 3, 4] },
    { slug: "evening-walk",     title: "Evening Walk",    streak: 3,  lastCompleted: 0,    logDays: [0, 1, 2] },
  ],
  kit: [
    { slug: "daily-coding",     title: "Daily Coding Practice", streak: 12, lastCompleted: 0, logDays: Array.from({ length: 12 }, (_, i) => i) },
    { slug: "morning-planning", title: "Morning Planning",      streak: 7,  lastCompleted: 0, logDays: Array.from({ length: 7 },  (_, i) => i) },
  ],
  default: [
    { slug: "morning-run",      title: "Morning Run",     streak: 7,  lastCompleted: 0,    logDays: Array.from({ length: 7 }, (_, i) => i) },
    { slug: "read-20-min",      title: "Read 20 Minutes", streak: 3,  lastCompleted: 0,    logDays: [0, 1, 2] },
    { slug: "drink-water",      title: "Drink Water",     streak: 0,  lastCompleted: 3,    logDays: [3, 4, 5, 6] },
    { slug: "evening-stretch",  title: "Evening Stretch", streak: 0,  lastCompleted: null, logDays: [] },
  ],
};

const MOOD_DAY_COUNT: Record<Role, number> = { summer: 60, jordan: 30, kit: 30, default: 45 };

// Repeating mood cycle so reruns produce the same values.
const MOOD_CYCLE = [3, 4, 4, 5, 3, 2, 4, 5, 3, 4, 3, 5, 4, 3, 2];

async function seedHealth(db: Db, userId: string, role: Role) {
  for (const habit of HABIT_CONFIGS[role]) {
    const habitId = `seed-${habit.slug}-${userId}`;
    const lastCompleted = habit.lastCompleted !== null ? daysAgo(habit.lastCompleted) : null;
    await db.habit.upsert({
      where: { id: habitId },
      update: { title: habit.title, streak: habit.streak, lastCompleted },
      create: { id: habitId, userId, title: habit.title, streak: habit.streak, lastCompleted },
    });
    for (const day of habit.logDays) {
      const date = daysAgo(day);
      await db.habitLog.upsert({
        where: { habitId_date: { habitId, date } },
        update: { completed: true },
        create: { habitId, date, completed: true },
      });
    }
  }

  const moodDays = MOOD_DAY_COUNT[role];
  for (let i = 0; i < moodDays; i++) {
    const date = daysAgo(moodDays - 1 - i);
    const mood = MOOD_CYCLE[i % MOOD_CYCLE.length];
    await db.moodEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { mood },
      create: { userId, date, mood },
    });
  }
}

// ─── Finance ──────────────────────────────────────────────────────────────────

type AccountConfig   = { slug: string; name: string; type: string; institution: string; balance: number };
type TxnConfig       = { n: number; accountSlug: string; merchant: string; category: string; amount: number; type: string; day: number };
type BudgetConfig    = { category: string; limit: number };
type SnapshotConfig  = { monthsAgo: number; assets: number; liabilities: number };

const FINANCE_CONFIGS: Record<Role, {
  accounts: AccountConfig[];
  transactions: TxnConfig[];
  budgets: BudgetConfig[];
  snapshots: SnapshotConfig[];
}> = {
  summer: {
    accounts: [
      { slug: "checking", name: "Checking Account",  type: "checking", institution: "Chase", balance: 2400 },
      { slug: "savings",  name: "Savings Account",   type: "savings",  institution: "Chase", balance: 4800 },
    ],
    transactions: [
      { n:  0, accountSlug: "checking", merchant: "Whole Foods",      category: "groceries",    amount:   67.40, type: "expense", day:  2 },
      { n:  1, accountSlug: "checking", merchant: "Starbucks",         category: "dining",       amount:    6.50, type: "expense", day:  3 },
      { n:  2, accountSlug: "checking", merchant: "Monthly Salary",    category: "salary",       amount: 3200.00, type: "income",  day:  5 },
      { n:  3, accountSlug: "checking", merchant: "Trader Joe's",      category: "groceries",    amount:   54.20, type: "expense", day:  9 },
      { n:  4, accountSlug: "checking", merchant: "Netflix",           category: "entertainment",amount:   15.99, type: "expense", day: 10 },
      { n:  5, accountSlug: "checking", merchant: "SoulCycle",         category: "health",       amount:   35.00, type: "expense", day: 12 },
      { n:  6, accountSlug: "checking", merchant: "Chipotle",          category: "dining",       amount:   14.25, type: "expense", day: 15 },
      { n:  7, accountSlug: "checking", merchant: "Target",            category: "shopping",     amount:   48.60, type: "expense", day: 18 },
      { n:  8, accountSlug: "checking", merchant: "Whole Foods",       category: "groceries",    amount:   72.10, type: "expense", day: 22 },
      { n:  9, accountSlug: "checking", merchant: "Lululemon",         category: "shopping",     amount:   89.00, type: "expense", day: 25 },
      { n: 10, accountSlug: "checking", merchant: "Starbucks",         category: "dining",       amount:    7.25, type: "expense", day: 28 },
      { n: 11, accountSlug: "checking", merchant: "Monthly Salary",    category: "salary",       amount: 3200.00, type: "income",  day: 35 },
      { n: 12, accountSlug: "checking", merchant: "Trader Joe's",      category: "groceries",    amount:   61.80, type: "expense", day: 38 },
      { n: 13, accountSlug: "checking", merchant: "Yoga Studio",       category: "health",       amount:  120.00, type: "expense", day: 42 },
      { n: 14, accountSlug: "savings",  merchant: "Savings Transfer",  category: "transfer",     amount:  500.00, type: "income",  day: 45 },
    ],
    budgets: [
      { category: "groceries", limit: 300 },
      { category: "dining",    limit: 150 },
    ],
    snapshots: [
      { monthsAgo: 2, assets:  8200, liabilities:    0 },
      { monthsAgo: 1, assets:  9800, liabilities:    0 },
      { monthsAgo: 0, assets: 11400, liabilities:    0 },
    ],
  },

  jordan: {
    accounts: [
      { slug: "checking",   name: "Checking Account",    type: "checking",   institution: "Bank of America", balance:  5200 },
      { slug: "savings",    name: "High-Yield Savings",  type: "savings",    institution: "Marcus",          balance: 18500 },
      { slug: "investment", name: "Brokerage Account",   type: "investment", institution: "Fidelity",        balance: 34000 },
    ],
    transactions: [
      { n:  0, accountSlug: "checking",   merchant: "Apartment Rent",       category: "rent",          amount: 1850.00, type: "expense", day:  1 },
      { n:  1, accountSlug: "checking",   merchant: "Whole Foods",          category: "groceries",     amount:   93.40, type: "expense", day:  2 },
      { n:  2, accountSlug: "checking",   merchant: "Con Edison",           category: "utilities",     amount:   68.25, type: "expense", day:  3 },
      { n:  3, accountSlug: "checking",   merchant: "T-Mobile",             category: "utilities",     amount:   45.00, type: "expense", day:  3 },
      { n:  4, accountSlug: "checking",   merchant: "Monthly Salary",       category: "salary",        amount: 6800.00, type: "income",  day:  5 },
      { n:  5, accountSlug: "checking",   merchant: "Uber",                 category: "transport",     amount:   18.40, type: "expense", day:  6 },
      { n:  6, accountSlug: "checking",   merchant: "Sweetgreen",           category: "dining",        amount:   16.50, type: "expense", day:  7 },
      { n:  7, accountSlug: "checking",   merchant: "Trader Joe's",         category: "groceries",     amount:   74.20, type: "expense", day:  9 },
      { n:  8, accountSlug: "checking",   merchant: "Netflix",              category: "entertainment", amount:   15.99, type: "expense", day: 10 },
      { n:  9, accountSlug: "checking",   merchant: "Spotify",              category: "entertainment", amount:    9.99, type: "expense", day: 10 },
      { n: 10, accountSlug: "checking",   merchant: "Gold's Gym",           category: "health",        amount:   30.00, type: "expense", day: 11 },
      { n: 11, accountSlug: "checking",   merchant: "Subway Card",          category: "transport",     amount:   33.00, type: "expense", day: 12 },
      { n: 12, accountSlug: "checking",   merchant: "Amazon",               category: "shopping",      amount:   54.60, type: "expense", day: 13 },
      { n: 13, accountSlug: "checking",   merchant: "Chipotle",             category: "dining",        amount:   14.25, type: "expense", day: 15 },
      { n: 14, accountSlug: "checking",   merchant: "Whole Foods",          category: "groceries",     amount:   88.10, type: "expense", day: 16 },
      { n: 15, accountSlug: "savings",    merchant: "Monthly Transfer",     category: "transfer",      amount: 1200.00, type: "income",  day: 16 },
      { n: 16, accountSlug: "investment", merchant: "Index Fund Purchase",  category: "investment",    amount:  500.00, type: "expense", day: 17 },
      { n: 17, accountSlug: "checking",   merchant: "Uber Eats",            category: "dining",        amount:   32.80, type: "expense", day: 18 },
      { n: 18, accountSlug: "checking",   merchant: "CVS Pharmacy",         category: "health",        amount:   22.40, type: "expense", day: 20 },
      { n: 19, accountSlug: "checking",   merchant: "Trader Joe's",         category: "groceries",     amount:   61.80, type: "expense", day: 23 },
      { n: 20, accountSlug: "checking",   merchant: "Uber",                 category: "transport",     amount:   21.50, type: "expense", day: 24 },
      { n: 21, accountSlug: "checking",   merchant: "Sushi Restaurant",     category: "dining",        amount:   58.00, type: "expense", day: 26 },
      { n: 22, accountSlug: "checking",   merchant: "Freelance Income",     category: "freelance",     amount:  800.00, type: "income",  day: 28 },
      { n: 23, accountSlug: "checking",   merchant: "Target",               category: "shopping",      amount:   76.30, type: "expense", day: 29 },
      { n: 24, accountSlug: "checking",   merchant: "Apartment Rent",       category: "rent",          amount: 1850.00, type: "expense", day: 31 },
      { n: 25, accountSlug: "checking",   merchant: "Monthly Salary",       category: "salary",        amount: 6800.00, type: "income",  day: 35 },
      { n: 26, accountSlug: "checking",   merchant: "Whole Foods",          category: "groceries",     amount:   97.60, type: "expense", day: 36 },
      { n: 27, accountSlug: "checking",   merchant: "Con Edison",           category: "utilities",     amount:   72.50, type: "expense", day: 37 },
      { n: 28, accountSlug: "checking",   merchant: "Uber",                 category: "transport",     amount:   15.20, type: "expense", day: 38 },
      { n: 29, accountSlug: "checking",   merchant: "Shake Shack",          category: "dining",        amount:   18.40, type: "expense", day: 39 },
      { n: 30, accountSlug: "savings",    merchant: "Monthly Transfer",     category: "transfer",      amount: 1200.00, type: "income",  day: 46 },
      { n: 31, accountSlug: "investment", merchant: "Index Fund Purchase",  category: "investment",    amount:  500.00, type: "expense", day: 47 },
      { n: 32, accountSlug: "checking",   merchant: "Trader Joe's",         category: "groceries",     amount:   82.40, type: "expense", day: 44 },
      { n: 33, accountSlug: "checking",   merchant: "Citi Bike",            category: "transport",     amount:   19.00, type: "expense", day: 45 },
      { n: 34, accountSlug: "checking",   merchant: "Movie Tickets",        category: "entertainment", amount:   26.50, type: "expense", day: 48 },
      { n: 35, accountSlug: "checking",   merchant: "Amazon",               category: "shopping",      amount:   43.20, type: "expense", day: 50 },
      { n: 36, accountSlug: "checking",   merchant: "Freelance Income",     category: "freelance",     amount:  600.00, type: "income",  day: 55 },
      { n: 37, accountSlug: "checking",   merchant: "Apartment Rent",       category: "rent",          amount: 1850.00, type: "expense", day: 61 },
      { n: 38, accountSlug: "checking",   merchant: "Monthly Salary",       category: "salary",        amount: 6800.00, type: "income",  day: 65 },
      { n: 39, accountSlug: "checking",   merchant: "Whole Foods",          category: "groceries",     amount:   88.90, type: "expense", day: 67 },
      { n: 40, accountSlug: "savings",    merchant: "Monthly Transfer",     category: "transfer",      amount: 1200.00, type: "income",  day: 76 },
      { n: 41, accountSlug: "investment", merchant: "Index Fund Purchase",  category: "investment",    amount:  500.00, type: "expense", day: 77 },
      { n: 42, accountSlug: "checking",   merchant: "Trader Joe's",         category: "groceries",     amount:   69.10, type: "expense", day: 80 },
      { n: 43, accountSlug: "checking",   merchant: "Uber Eats",            category: "dining",        amount:   28.60, type: "expense", day: 83 },
      { n: 44, accountSlug: "checking",   merchant: "CVS Pharmacy",         category: "health",        amount:   18.75, type: "expense", day: 85 },
    ],
    budgets: [
      { category: "groceries",    limit: 400 },
      { category: "dining",       limit: 200 },
      { category: "transport",    limit: 150 },
      { category: "entertainment",limit: 100 },
      { category: "utilities",    limit: 200 },
      { category: "shopping",     limit: 250 },
    ],
    snapshots: [
      { monthsAgo: 5, assets: 45000, liabilities: 12000 },
      { monthsAgo: 4, assets: 47500, liabilities: 11500 },
      { monthsAgo: 3, assets: 50200, liabilities: 11000 },
      { monthsAgo: 2, assets: 53800, liabilities: 10500 },
      { monthsAgo: 1, assets: 56400, liabilities: 10000 },
      { monthsAgo: 0, assets: 59200, liabilities:  9500 },
    ],
  },

  kit: {
    accounts: [
      { slug: "checking", name: "Checking Account", type: "checking", institution: "Wells Fargo", balance: 3800 },
      { slug: "savings",  name: "Savings Account",  type: "savings",  institution: "Wells Fargo", balance: 6200 },
    ],
    transactions: [
      { n:  0, accountSlug: "checking", merchant: "Apartment Rent",    category: "rent",      amount: 1100.00, type: "expense", day:  1 },
      { n:  1, accountSlug: "checking", merchant: "Trader Joe's",      category: "groceries", amount:   48.20, type: "expense", day:  3 },
      { n:  2, accountSlug: "checking", merchant: "Freelance Project", category: "freelance", amount: 1200.00, type: "income",  day:  5 },
      { n:  3, accountSlug: "checking", merchant: "Starbucks",         category: "dining",    amount:    5.75, type: "expense", day:  6 },
      { n:  4, accountSlug: "checking", merchant: "GitHub Copilot",    category: "software",  amount:   10.00, type: "expense", day:  7 },
      { n:  5, accountSlug: "checking", merchant: "Whole Foods",       category: "groceries", amount:   62.40, type: "expense", day: 10 },
      { n:  6, accountSlug: "checking", merchant: "Udemy Course",      category: "education", amount:   19.99, type: "expense", day: 12 },
      { n:  7, accountSlug: "checking", merchant: "Subway",            category: "dining",    amount:    9.50, type: "expense", day: 14 },
      { n:  8, accountSlug: "checking", merchant: "Freelance Project", category: "freelance", amount:  800.00, type: "income",  day: 18 },
      { n:  9, accountSlug: "checking", merchant: "Trader Joe's",      category: "groceries", amount:   55.80, type: "expense", day: 20 },
      { n: 10, accountSlug: "checking", merchant: "Chipotle",          category: "dining",    amount:   12.75, type: "expense", day: 22 },
      { n: 11, accountSlug: "checking", merchant: "AWS Credits",       category: "software",  amount:   24.50, type: "expense", day: 25 },
      { n: 12, accountSlug: "checking", merchant: "Apartment Rent",    category: "rent",      amount: 1100.00, type: "expense", day: 31 },
      { n: 13, accountSlug: "checking", merchant: "Freelance Project", category: "freelance", amount:  950.00, type: "income",  day: 35 },
      { n: 14, accountSlug: "checking", merchant: "Trader Joe's",      category: "groceries", amount:   51.30, type: "expense", day: 38 },
      { n: 15, accountSlug: "checking", merchant: "Starbucks",         category: "dining",    amount:    6.25, type: "expense", day: 40 },
      { n: 16, accountSlug: "checking", merchant: "LinkedIn Premium",  category: "software",  amount:   39.99, type: "expense", day: 42 },
      { n: 17, accountSlug: "checking", merchant: "Whole Foods",       category: "groceries", amount:   58.60, type: "expense", day: 45 },
      { n: 18, accountSlug: "checking", merchant: "Apartment Rent",    category: "rent",      amount: 1100.00, type: "expense", day: 61 },
      { n: 19, accountSlug: "checking", merchant: "Freelance Project", category: "freelance", amount: 1500.00, type: "income",  day: 65 },
    ],
    budgets: [
      { category: "groceries", limit: 250 },
      { category: "dining",    limit: 120 },
      { category: "transport", limit: 100 },
    ],
    snapshots: [
      { monthsAgo: 2, assets:  9200, liabilities: 0 },
      { monthsAgo: 1, assets: 10400, liabilities: 0 },
      { monthsAgo: 0, assets: 11800, liabilities: 0 },
    ],
  },

  default: {
    accounts: [
      { slug: "checking", name: "Checking Account", type: "checking", institution: "Chase", balance: 2100 },
      { slug: "savings",  name: "Savings Account",  type: "savings",  institution: "Chase", balance: 5600 },
    ],
    transactions: [
      { n:  0, accountSlug: "checking", merchant: "Apartment Rent",   category: "rent",          amount: 1200.00, type: "expense", day:  1 },
      { n:  1, accountSlug: "checking", merchant: "Whole Foods",      category: "groceries",     amount:   72.40, type: "expense", day:  2 },
      { n:  2, accountSlug: "checking", merchant: "Monthly Salary",   category: "salary",        amount: 3500.00, type: "income",  day:  5 },
      { n:  3, accountSlug: "checking", merchant: "Starbucks",        category: "dining",        amount:    6.50, type: "expense", day:  6 },
      { n:  4, accountSlug: "checking", merchant: "Netflix",          category: "entertainment", amount:   15.99, type: "expense", day:  8 },
      { n:  5, accountSlug: "checking", merchant: "Trader Joe's",     category: "groceries",     amount:   58.30, type: "expense", day: 10 },
      { n:  6, accountSlug: "checking", merchant: "Uber",             category: "transport",     amount:   22.40, type: "expense", day: 12 },
      { n:  7, accountSlug: "checking", merchant: "Chipotle",         category: "dining",        amount:   14.25, type: "expense", day: 14 },
      { n:  8, accountSlug: "checking", merchant: "Target",           category: "shopping",      amount:   45.60, type: "expense", day: 16 },
      { n:  9, accountSlug: "checking", merchant: "Whole Foods",      category: "groceries",     amount:   68.20, type: "expense", day: 19 },
      { n: 10, accountSlug: "checking", merchant: "Subway Card",      category: "transport",     amount:   15.00, type: "expense", day: 21 },
      { n: 11, accountSlug: "checking", merchant: "Amazon",           category: "shopping",      amount:   34.99, type: "expense", day: 23 },
      { n: 12, accountSlug: "checking", merchant: "Spotify",          category: "entertainment", amount:    9.99, type: "expense", day: 25 },
      { n: 13, accountSlug: "checking", merchant: "Trader Joe's",     category: "groceries",     amount:   62.80, type: "expense", day: 27 },
      { n: 14, accountSlug: "savings",  merchant: "Monthly Savings",  category: "transfer",      amount:  300.00, type: "income",  day: 28 },
      { n: 15, accountSlug: "checking", merchant: "Apartment Rent",   category: "rent",          amount: 1200.00, type: "expense", day: 31 },
      { n: 16, accountSlug: "checking", merchant: "Monthly Salary",   category: "salary",        amount: 3500.00, type: "income",  day: 35 },
      { n: 17, accountSlug: "checking", merchant: "Whole Foods",      category: "groceries",     amount:   75.10, type: "expense", day: 37 },
      { n: 18, accountSlug: "checking", merchant: "Starbucks",        category: "dining",        amount:    7.25, type: "expense", day: 39 },
      { n: 19, accountSlug: "checking", merchant: "Uber Eats",        category: "dining",        amount:   28.50, type: "expense", day: 41 },
      { n: 20, accountSlug: "checking", merchant: "Trader Joe's",     category: "groceries",     amount:   54.60, type: "expense", day: 44 },
      { n: 21, accountSlug: "checking", merchant: "Netflix",          category: "entertainment", amount:   15.99, type: "expense", day: 46 },
      { n: 22, accountSlug: "checking", merchant: "Uber",             category: "transport",     amount:   19.80, type: "expense", day: 48 },
      { n: 23, accountSlug: "checking", merchant: "Target",           category: "shopping",      amount:   52.30, type: "expense", day: 51 },
      { n: 24, accountSlug: "savings",  merchant: "Monthly Savings",  category: "transfer",      amount:  300.00, type: "income",  day: 55 },
      { n: 25, accountSlug: "checking", merchant: "Apartment Rent",   category: "rent",          amount: 1200.00, type: "expense", day: 61 },
      { n: 26, accountSlug: "checking", merchant: "Monthly Salary",   category: "salary",        amount: 3500.00, type: "income",  day: 65 },
      { n: 27, accountSlug: "checking", merchant: "Whole Foods",      category: "groceries",     amount:   69.40, type: "expense", day: 67 },
      { n: 28, accountSlug: "checking", merchant: "Chipotle",         category: "dining",        amount:   13.75, type: "expense", day: 69 },
      { n: 29, accountSlug: "checking", merchant: "Trader Joe's",     category: "groceries",     amount:   58.90, type: "expense", day: 72 },
      { n: 30, accountSlug: "checking", merchant: "Amazon",           category: "shopping",      amount:   27.49, type: "expense", day: 75 },
      { n: 31, accountSlug: "checking", merchant: "Uber",             category: "transport",     amount:   24.60, type: "expense", day: 77 },
      { n: 32, accountSlug: "checking", merchant: "Spotify",          category: "entertainment", amount:    9.99, type: "expense", day: 79 },
      { n: 33, accountSlug: "savings",  merchant: "Monthly Savings",  category: "transfer",      amount:  300.00, type: "income",  day: 85 },
    ],
    budgets: [
      { category: "groceries",     limit: 350 },
      { category: "dining",        limit: 180 },
      { category: "transport",     limit: 120 },
      { category: "entertainment", limit:  80 },
    ],
    snapshots: [
      { monthsAgo: 2, assets: 7200, liabilities: 500 },
      { monthsAgo: 1, assets: 8100, liabilities: 450 },
      { monthsAgo: 0, assets: 9200, liabilities: 400 },
    ],
  },
};

async function seedFinance(db: Db, userId: string, role: Role) {
  const config = FINANCE_CONFIGS[role];

  // Accounts — deterministic IDs keep upserts stable across reruns.
  const accountIds: Record<string, string> = {};
  for (const acct of config.accounts) {
    const id = `seed-acct-${acct.slug}-${userId}`;
    await db.financialAccount.upsert({
      where: { id },
      update: { name: acct.name, balance: acct.balance },
      create: { id, userId, name: acct.name, type: acct.type, institution: acct.institution, balance: acct.balance, currency: "USD" },
    });
    accountIds[acct.slug] = id;
  }

  // Transactions — deterministic IDs via `seed-txn-{n}-{userId}`.
  for (const txn of config.transactions) {
    const id = `seed-txn-${txn.n}-${userId}`;
    await db.transaction.upsert({
      where: { id },
      update: { merchant: txn.merchant, amount: txn.amount, date: daysAgo(txn.day) },
      create: {
        id,
        userId,
        accountId: accountIds[txn.accountSlug],
        date: daysAgo(txn.day),
        merchant: txn.merchant,
        category: txn.category,
        amount: txn.amount,
        type: txn.type,
      },
    });
  }

  // Budgets — uses the schema composite unique [userId, category, period, month].
  const currentMonth = monthStart(0);
  for (const budget of config.budgets) {
    await db.budget.upsert({
      where: {
        userId_category_period_month: {
          userId,
          category: budget.category,
          period: "monthly",
          month: currentMonth,
        },
      },
      update: { limitAmount: budget.limit },
      create: { userId, category: budget.category, limitAmount: budget.limit, period: "monthly", month: currentMonth },
    });
  }

  // Net worth snapshots — deterministic IDs via `seed-nw-{monthsAgo}-{userId}`.
  for (const snap of config.snapshots) {
    const id = `seed-nw-${snap.monthsAgo}-${userId}`;
    const netWorth = snap.assets - snap.liabilities;
    await db.netWorthSnapshot.upsert({
      where: { id },
      update: { assets: snap.assets, liabilities: snap.liabilities, netWorth },
      create: { id, userId, date: monthStart(snap.monthsAgo), assets: snap.assets, liabilities: snap.liabilities, netWorth },
    });
  }
}

// ─── Career ───────────────────────────────────────────────────────────────────

type JobConfig   = { company: string; role: string; status: string };
type SkillConfig = { name: string; level: string };

const CAREER_CONFIGS: Record<Role, { jobs: JobConfig[]; skills: SkillConfig[] }> = {
  summer: {
    jobs: [
      { company: "Luminary Health Tech", role: "Frontend Developer",  status: "interview" },
      { company: "WellPath Agency",      role: "React Developer",     status: "applied"   },
    ],
    skills: [
      { name: "React",        level: "intermediate" },
      { name: "TypeScript",   level: "beginner"     },
      { name: "Tailwind CSS", level: "intermediate" },
    ],
  },
  jordan: {
    jobs: [
      { company: "Capital Investments Inc", role: "Financial Analyst", status: "applied"   },
      { company: "Fintech Corp",            role: "Data Analyst",      status: "rejected"  },
    ],
    skills: [
      { name: "Excel",  level: "advanced"      },
      { name: "SQL",    level: "intermediate"  },
      { name: "Python", level: "beginner"      },
    ],
  },
  kit: {
    jobs: [
      { company: "Stripe",      role: "Software Engineer",                  status: "applied"   },
      { company: "Linear",      role: "Frontend Engineer",                  status: "interview" },
      { company: "Vercel",      role: "Developer Experience Engineer",      status: "applied"   },
      { company: "Shopify",     role: "Full Stack Engineer",                status: "rejected"  },
      { company: "Notion",      role: "Product Engineer",                   status: "interview" },
      { company: "Figma",       role: "Software Engineer II",               status: "applied"   },
      { company: "Railway",     role: "Backend Engineer",                   status: "applied"   },
      { company: "Planetscale", role: "Developer Advocate",                 status: "rejected"  },
    ],
    skills: [
      { name: "JavaScript", level: "advanced"      },
      { name: "TypeScript", level: "intermediate"  },
      { name: "React",      level: "intermediate"  },
      { name: "Next.js",    level: "intermediate"  },
      { name: "Node.js",    level: "beginner"      },
      { name: "PostgreSQL", level: "beginner"      },
      { name: "Prisma",     level: "beginner"      },
      { name: "Git",        level: "intermediate"  },
    ],
  },
  default: {
    jobs: [
      { company: "Acme Corp",   role: "Junior Developer",    status: "applied"   },
      { company: "Tech Studio", role: "Frontend Developer",  status: "interview" },
      { company: "StartupXYZ", role: "Full Stack Engineer",  status: "rejected"  },
      { company: "Dev Agency",  role: "React Developer",     status: "applied"   },
    ],
    skills: [
      { name: "JavaScript", level: "intermediate" },
      { name: "React",      level: "intermediate" },
      { name: "Node.js",    level: "beginner"     },
      { name: "SQL",        level: "beginner"     },
    ],
  },
};

async function seedCareer(db: Db, userId: string, role: Role) {
  const config = CAREER_CONFIGS[role];
  for (const job of config.jobs) {
    const existing = await db.jobApplication.findFirst({ where: { userId, company: job.company, role: job.role } });
    if (existing) {
      await db.jobApplication.update({ where: { id: existing.id }, data: { status: job.status } });
    } else {
      await db.jobApplication.create({ data: { userId, company: job.company, role: job.role, status: job.status } });
    }
  }
  for (const skill of config.skills) {
    const existing = await db.skill.findFirst({ where: { userId, name: skill.name } });
    if (existing) {
      await db.skill.update({ where: { id: existing.id }, data: { level: skill.level } });
    } else {
      await db.skill.create({ data: { userId, name: skill.name, level: skill.level } });
    }
  }
}

// ─── Savings goals ────────────────────────────────────────────────────────────

const SAVINGS_CONFIGS: Record<Role, { title: string; targetAmount: number; currentAmount: number }[]> = {
  summer: [
    { title: "Emergency Fund", targetAmount: 4000, currentAmount: 2500 },
    { title: "Yoga Retreat",   targetAmount: 1500, currentAmount:  600 },
  ],
  jordan: [
    { title: "Emergency Fund",      targetAmount: 18000, currentAmount: 15000 },
    { title: "House Down Payment",  targetAmount: 60000, currentAmount: 28000 },
    { title: "New Car",             targetAmount: 25000, currentAmount:  8000 },
    { title: "Vacation Fund",       targetAmount:  5000, currentAmount:  2200 },
  ],
  kit: [
    { title: "Job Search Runway", targetAmount: 6000, currentAmount: 4500 },
    { title: "New Laptop",        targetAmount: 1200, currentAmount:  800 },
  ],
  default: [
    { title: "Emergency Fund", targetAmount: 3000, currentAmount: 1950 },
    { title: "New Laptop",     targetAmount: 1200, currentAmount:  400 },
  ],
};

async function seedSavings(db: Db, userId: string, role: Role) {
  for (const goal of SAVINGS_CONFIGS[role]) {
    const existing = await db.savingsGoal.findFirst({ where: { userId, title: goal.title } });
    if (existing) {
      await db.savingsGoal.update({
        where: { id: existing.id },
        data: { targetAmount: goal.targetAmount, currentAmount: goal.currentAmount },
      });
    } else {
      await db.savingsGoal.create({ data: { userId, ...goal } });
    }
  }
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

async function seedUser(db: Db, clerkUserId: string) {
  const role: Role = TEAMMATE_ROLES[clerkUserId] ?? "default";
  console.log(`  Role:    ${role}`);

  const user = await seedProfile(db, clerkUserId, role);
  console.log(`  Profile: ${user.name}`);

  await seedGoals(db, user.id);
  console.log(`  Goals:   done`);

  await seedHealth(db, user.id, role);
  console.log(`  Health:  done`);

  await seedFinance(db, user.id, role);
  console.log(`  Finance: done`);

  await seedCareer(db, user.id, role);
  console.log(`  Career:  done`);

  await seedSavings(db, user.id, role);
  console.log(`  Savings: done`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  if (targets.length === 0) {
    console.error("No Clerk user IDs provided.");
    console.error("Usage:  npm run seed:demo -- <clerkUserId> [<clerkUserId2> ...]");
    console.error("Or set SEED_CLERK_USER_ID in .env.local and run: npm run seed:demo");
    process.exit(1);
  }

  const { prisma } = await import("@/lib/prisma");

  console.log(`Seeding ${targets.length} account(s)...\n`);
  for (const clerkId of targets) {
    console.log(`[${clerkId}]`);
    await seedUser(prisma, clerkId);
    console.log();
  }

  console.log("Done. Log into the app to see your populated data.");
  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
