import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

// @/lib/prisma creates its pg Pool from DATABASE_URL at module load, so it is
// imported dynamically inside main() after dotenv has populated process.env.
import type { prisma as PrismaInstance } from "@/lib/prisma";
type Db = typeof PrismaInstance;

// Ties all seed data to a real Clerk account when SEED_CLERK_USER_ID is set
// (e.g. in .env.local), so the demo user sees seeded data after a normal login.
const DEMO_CLERK_USER_ID = process.env.SEED_CLERK_USER_ID ?? "demo-seed-user";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// Logs and mood entries upsert on a date-based unique key, so their dates are
// normalized to local midnight to stay stable across same-day re-runs.
const dayStart = (n: number) => {
  const d = daysAgo(n);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function upsertGoal(
  db: Db,
  userId: string,
  goal: { title: string; category: string; progress: number },
  milestones: { title: string; completed: boolean }[],
) {
  const existing = await db.goal.findFirst({
    where: { userId, title: goal.title },
  });
  const saved = existing
    ? await db.goal.update({
        where: { id: existing.id },
        data: { category: goal.category, progress: goal.progress },
      })
    : await db.goal.create({ data: { userId, ...goal } });

  for (const milestone of milestones) {
    const found = await db.milestone.findFirst({
      where: { goalId: saved.id, title: milestone.title },
    });
    if (found) {
      await db.milestone.update({
        where: { id: found.id },
        data: { completed: milestone.completed },
      });
    } else {
      await db.milestone.create({ data: { goalId: saved.id, ...milestone } });
    }
  }
  return saved;
}

async function upsertHabit(
  db: Db,
  userId: string,
  habit: { title: string; streak: number; lastCompleted: Date | null },
) {
  const existing = await db.habit.findFirst({
    where: { userId, title: habit.title },
  });
  return existing
    ? db.habit.update({
        where: { id: existing.id },
        data: { streak: habit.streak, lastCompleted: habit.lastCompleted },
      })
    : db.habit.create({ data: { userId, ...habit } });
}

async function main() {
  const { prisma } = await import("@/lib/prisma");

  console.log("Seeding LifeOS demo data...");

  const profileData = {
    name: "Demo User",
    lifeStage: "early-career",
    currentSituation: "Building skills and exploring career options",
    biggestChallenge: "Staying consistent with habits and managing finances",
    careerGoals: "Land a junior developer role within 6 months",
    financialGoals: "Build a 3-month emergency fund",
    healthGoals: "Exercise consistently and improve sleep",
    personalGrowthGoals: "Read more and reduce screen time",
    futureVision: "Work remotely as a full-stack developer",
  };

  const user = await prisma.userProfile.upsert({
    where: { clerkUserId: DEMO_CLERK_USER_ID },
    update: profileData,
    create: { clerkUserId: DEMO_CLERK_USER_ID, ...profileData },
  });

  // Goals with milestones
  await upsertGoal(
    prisma,
    user.id,
    { title: "Get First Dev Job", category: "career", progress: 40 },
    [
      { title: "Update portfolio", completed: true },
      { title: "Apply to 10 jobs", completed: false },
      { title: "Complete take-home project", completed: false },
    ],
  );
  await upsertGoal(
    prisma,
    user.id,
    { title: "Build Emergency Fund", category: "finance", progress: 65 },
    [
      { title: "Save first $500", completed: true },
      { title: "Reach $1000", completed: true },
      { title: "Reach $3000", completed: false },
    ],
  );
  await upsertGoal(
    prisma,
    user.id,
    { title: "Improve Sleep Schedule", category: "health", progress: 55 },
    [
      { title: "Sleep by midnight 5 days", completed: true },
      { title: "No phone 1hr before bed", completed: false },
    ],
  );

  // Habits
  const morningRun = await upsertHabit(prisma, user.id, {
    title: "Morning Run",
    streak: 7,
    lastCompleted: new Date(),
  });
  const readTwenty = await upsertHabit(prisma, user.id, {
    title: "Read 20 Minutes",
    streak: 3,
    lastCompleted: new Date(),
  });
  const drinkWater = await upsertHabit(prisma, user.id, {
    title: "Drink Water",
    streak: 0,
    lastCompleted: daysAgo(3),
  });
  await upsertHabit(prisma, user.id, {
    title: "Evening Stretch",
    streak: 0,
    lastCompleted: null,
  });

  // Habit logs (Evening Stretch intentionally has none)
  const habitLogs: { habitId: string; day: number }[] = [
    ...[0, 1, 2, 3, 4, 5, 6].map((day) => ({ habitId: morningRun.id, day })),
    ...[0, 1, 2].map((day) => ({ habitId: readTwenty.id, day })),
    // Gap on days 0-3 causes the Drink Water streak reset
    ...[4, 5, 6, 7].map((day) => ({ habitId: drinkWater.id, day })),
  ];
  for (const log of habitLogs) {
    const date = dayStart(log.day);
    await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: log.habitId, date } },
      update: { completed: true },
      create: { habitId: log.habitId, date, completed: true },
    });
  }

  // Mood entries (last 7 entries, 1-5 scale)
  const moods: { day: number; mood: number }[] = [
    { day: 7, mood: 3 },
    { day: 6, mood: 4 },
    { day: 5, mood: 2 },
    { day: 4, mood: 5 },
    { day: 3, mood: 3 },
    { day: 2, mood: 4 },
    { day: 0, mood: 4 },
  ];
  for (const entry of moods) {
    const date = dayStart(entry.day);
    await prisma.moodEntry.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: { mood: entry.mood },
      create: { userId: user.id, date, mood: entry.mood },
    });
  }

  // Savings goals
  const savingsGoals = [
    { title: "Emergency Fund", targetAmount: 3000, currentAmount: 1950 },
    { title: "New Laptop", targetAmount: 1200, currentAmount: 400 },
  ];
  for (const goal of savingsGoals) {
    const existing = await prisma.savingsGoal.findFirst({
      where: { userId: user.id, title: goal.title },
    });
    if (existing) {
      await prisma.savingsGoal.update({
        where: { id: existing.id },
        data: { targetAmount: goal.targetAmount, currentAmount: goal.currentAmount },
      });
    } else {
      await prisma.savingsGoal.create({ data: { userId: user.id, ...goal } });
    }
  }

  // Job applications
  const jobApplications = [
    { company: "Acme Corp", role: "Junior Developer", status: "applied" },
    { company: "Tech Studio", role: "Frontend Developer", status: "interview" },
    { company: "StartupXYZ", role: "Full Stack Engineer", status: "rejected" },
    { company: "Dev Agency", role: "React Developer", status: "applied" },
  ];
  for (const application of jobApplications) {
    const existing = await prisma.jobApplication.findFirst({
      where: { userId: user.id, company: application.company, role: application.role },
    });
    if (existing) {
      await prisma.jobApplication.update({
        where: { id: existing.id },
        data: { status: application.status },
      });
    } else {
      await prisma.jobApplication.create({ data: { userId: user.id, ...application } });
    }
  }

  // Skills
  const skills = [
    { name: "JavaScript", level: "intermediate" },
    { name: "React", level: "intermediate" },
    { name: "Node.js", level: "beginner" },
    { name: "SQL", level: "beginner" },
  ];
  for (const skill of skills) {
    const existing = await prisma.skill.findFirst({
      where: { userId: user.id, name: skill.name },
    });
    if (existing) {
      await prisma.skill.update({
        where: { id: existing.id },
        data: { level: skill.level },
      });
    } else {
      await prisma.skill.create({ data: { userId: user.id, ...skill } });
    }
  }

  console.log(`Done. Demo data seeded for clerkUserId "${DEMO_CLERK_USER_ID}".`);
  return prisma;
}

main()
  .then((prisma) => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
