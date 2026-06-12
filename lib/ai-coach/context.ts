import { prisma } from "@/lib/prisma";

type LifeOSRecord = Record<string, unknown>;

function withoutIds<T extends LifeOSRecord>(record: T, blockedKeys = ["id", "userId"]) {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !blockedKeys.includes(key))
  );
}

export async function getLifeOSContextForClerkUser(clerkUserId: string) {
  const profile = await prisma.userProfile.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
    select: {
      id: true,
      name: true,
      lifeStage: true,
      currentSituation: true,
      biggestChallenge: true,
      careerGoals: true,
      financialGoals: true,
      healthGoals: true,
      personalGrowthGoals: true,
      futureVision: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const [
    goals,
    habits,
    moodEntries,
    savingsGoals,
    financialAccounts,
    transactions,
    budgets,
    netWorthSnapshots,
    jobApplications,
    skills,
  ] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: profile.id },
      include: { milestones: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.habit.findMany({
      where: { userId: profile.id },
      include: { habitLogs: { orderBy: { date: "desc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.moodEntry.findMany({
      where: { userId: profile.id },
      orderBy: { date: "desc" },
    }),
    prisma.savingsGoal.findMany({
      where: { userId: profile.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.financialAccount.findMany({
      where: { userId: profile.id },
      orderBy: [{ isArchived: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.transaction.findMany({
      where: { userId: profile.id },
      include: { account: { select: { name: true, type: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.budget.findMany({
      where: { userId: profile.id },
      orderBy: [{ month: "desc" }, { category: "asc" }],
    }),
    prisma.netWorthSnapshot.findMany({
      where: { userId: profile.id },
      orderBy: { date: "desc" },
    }),
    prisma.jobApplication.findMany({
      where: { userId: profile.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.skill.findMany({
      where: { userId: profile.id },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    note:
      "This is a fresh just-in-time LifeOS database snapshot for the authenticated user. It was not loaded from a vector database, embedding index, or cache.",
    profile: withoutIds(profile, ["id"]),
    goals: goals.map((goal) => ({
      ...withoutIds(goal, ["id", "userId", "milestones"]),
      milestones: goal.milestones.map((milestone) =>
        withoutIds(milestone, ["id", "goalId"])
      ),
    })),
    habits: habits.map((habit) => ({
      ...withoutIds(habit, ["id", "userId", "habitLogs"]),
      habitLogs: habit.habitLogs.map((log) => withoutIds(log, ["id", "habitId"])),
    })),
    moodEntries: moodEntries.map((entry) => withoutIds(entry)),
    savingsGoals: savingsGoals.map((goal) => withoutIds(goal)),
    financialAccounts: financialAccounts.map((account) => withoutIds(account)),
    transactions: transactions.map((transaction) => ({
      ...withoutIds(transaction, ["id", "userId", "accountId", "account"]),
      account: transaction.account,
    })),
    budgets: budgets.map((budget) => withoutIds(budget)),
    netWorthSnapshots: netWorthSnapshots.map((snapshot) => withoutIds(snapshot)),
    healthMetricEntries: {
      schemaStatus: "unavailable",
      records: [],
      note: "The current Prisma schema does not define HealthMetricEntry.",
    },
    workoutEntries: {
      schemaStatus: "unavailable",
      records: [],
      note: "The current Prisma schema does not define WorkoutEntry.",
    },
    jobApplications: jobApplications.map((application) => withoutIds(application)),
    skills: skills.map((skill) => withoutIds(skill)),
  };
}

export type LifeOSContext = Awaited<ReturnType<typeof getLifeOSContextForClerkUser>>;
