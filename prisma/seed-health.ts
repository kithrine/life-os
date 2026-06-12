import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import type { prisma as PrismaInstance } from "@/lib/prisma";

const DEMO_CLERK_ID = "demo-user-seed";

// Usage: npx tsx prisma/seed-health.ts [clerkUserId ...]
// With no arguments, seeds the synthetic demo user
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [DEMO_CLERK_ID];

// Midnight-normalized dates so HabitLog/MoodEntry unique constraints
// ([habitId, date] / [userId, date]) make reruns idempotent
function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function seedHealthFor(prisma: typeof PrismaInstance, clerkUserId: string) {
  const isDemo = clerkUserId === DEMO_CLERK_ID;
  const user = await prisma.userProfile.upsert({
    where: { clerkUserId },
    update: isDemo ? { name: "Demo User" } : {},
    create: { clerkUserId, name: isDemo ? "Demo User" : null },
  });

  // Habit has no unique constraint besides id, so deterministic
  // per-profile ids keep the upserts idempotent across runs
  const habits = [
    {
      slug: "morning-run",
      title: "Morning Run",
      streak: 7,
      lastCompleted: daysAgo(0),
      logDays: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      slug: "read-20-minutes",
      title: "Read 20 Minutes",
      streak: 3,
      lastCompleted: daysAgo(0),
      logDays: [0, 1, 2],
    },
    {
      slug: "drink-water",
      title: "Drink Water",
      streak: 0,
      lastCompleted: daysAgo(3),
      logDays: [3, 4, 5],
    },
    {
      slug: "evening-stretch",
      title: "Evening Stretch",
      streak: 0,
      lastCompleted: null,
      logDays: [],
    },
  ];

  for (const habit of habits) {
    const habitId = `seed-${habit.slug}-${user.id}`;
    await prisma.habit.upsert({
      where: { id: habitId },
      update: {
        title: habit.title,
        streak: habit.streak,
        lastCompleted: habit.lastCompleted,
      },
      create: {
        id: habitId,
        userId: user.id,
        title: habit.title,
        streak: habit.streak,
        lastCompleted: habit.lastCompleted,
      },
    });

    for (const day of habit.logDays) {
      await prisma.habitLog.upsert({
        where: { habitId_date: { habitId, date: daysAgo(day) } },
        update: { completed: true },
        create: { habitId, date: daysAgo(day), completed: true },
      });
    }
  }

  // Last 7 days, oldest first: varied moods, most recent day last
  const moods = [3, 4, 2, 5, 3, 4, 4];
  for (let i = 0; i < moods.length; i++) {
    const date = daysAgo(moods.length - 1 - i);
    await prisma.moodEntry.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: { mood: moods[i] },
      create: { userId: user.id, mood: moods[i], date },
    });
  }

  const habitCount = await prisma.habit.count({ where: { userId: user.id } });
  const logCount = await prisma.habitLog.count({
    where: { habit: { userId: user.id } },
  });
  const moodCount = await prisma.moodEntry.count({ where: { userId: user.id } });
  console.log(
    `  ${clerkUserId}: ${habitCount} habits, ${logCount} habit logs, ${moodCount} mood entries.`
  );
}

async function main() {
  // The shared client reads DATABASE_URL at import time, so this import
  // must stay dynamic — after dotenv has populated the env above
  const { prisma } = await import("@/lib/prisma");

  // Remove seed habits from before ids were per-profile (cascades to logs)
  await prisma.habit.deleteMany({
    where: {
      id: {
        in: [
          "seed-habit-morning-run",
          "seed-habit-read-20-minutes",
          "seed-habit-drink-water",
          "seed-habit-evening-stretch",
        ],
      },
    },
  });

  console.log("Seeding health feature demo data...");
  for (const clerkUserId of targets) {
    await seedHealthFor(prisma, clerkUserId);
  }
  console.log("Done.");

  await prisma.$disconnect();
}

main()
  .then(() => {
    // The shared client's pg pool is not exported, so it cannot be ended
    // here; exit explicitly so the open pool does not hang the process
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
