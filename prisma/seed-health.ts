import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

// Midnight-normalized dates so HabitLog/MoodEntry unique constraints
// ([habitId, date] / [userId, date]) make reruns idempotent
function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  // The shared client reads DATABASE_URL at import time, so this import
  // must stay dynamic — after dotenv has populated the env above
  const { prisma } = await import("@/lib/prisma");

  console.log("Seeding health feature demo data...");

  const user = await prisma.userProfile.upsert({
    where: { clerkUserId: "demo-user-seed" },
    update: { name: "Demo User" },
    create: { clerkUserId: "demo-user-seed", name: "Demo User" },
  });

  // Habit has no unique constraint besides id, so deterministic ids
  // keep the upserts idempotent across runs
  const habits = [
    {
      id: "seed-habit-morning-run",
      title: "Morning Run",
      streak: 7,
      lastCompleted: daysAgo(0),
      logDays: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      id: "seed-habit-read-20-minutes",
      title: "Read 20 Minutes",
      streak: 3,
      lastCompleted: daysAgo(0),
      logDays: [0, 1, 2],
    },
    {
      id: "seed-habit-drink-water",
      title: "Drink Water",
      streak: 0,
      lastCompleted: daysAgo(3),
      logDays: [3, 4, 5],
    },
    {
      id: "seed-habit-evening-stretch",
      title: "Evening Stretch",
      streak: 0,
      lastCompleted: null,
      logDays: [],
    },
  ];

  for (const habit of habits) {
    await prisma.habit.upsert({
      where: { id: habit.id },
      update: {
        title: habit.title,
        streak: habit.streak,
        lastCompleted: habit.lastCompleted,
      },
      create: {
        id: habit.id,
        userId: user.id,
        title: habit.title,
        streak: habit.streak,
        lastCompleted: habit.lastCompleted,
      },
    });

    for (const day of habit.logDays) {
      await prisma.habitLog.upsert({
        where: { habitId_date: { habitId: habit.id, date: daysAgo(day) } },
        update: { completed: true },
        create: { habitId: habit.id, date: daysAgo(day), completed: true },
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
    `Done. Demo User seeded with ${habitCount} habits, ${logCount} habit logs, ${moodCount} mood entries.`
  );

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
