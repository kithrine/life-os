import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHealthScore } from "@/actions/life-score";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { LifeScoreCard } from "@/components/dashboard/life-score-card";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { GoalsWidget } from "@/components/dashboard/goals-widget";
import { HabitsWidget } from "@/components/dashboard/habits-widget";
import { AiCoachWidget } from "@/components/dashboard/ai-coach-widget";
import { CareerOverviewWidget } from "@/components/dashboard/career-overview-widget";
import { FinanceWidget } from "@/components/dashboard/finance-widget";
import { HealthWidget } from "@/components/dashboard/health-widget";
import { UpcomingWidget } from "@/components/dashboard/upcoming-widget";
import { calculateGoalProgress } from "@/lib/goals";

function finiteNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function transactionKind(transaction: { amount: number; type: string | null }) {
  const type = transaction.type?.trim().toLowerCase();
  if (type === "expense" || type === "income" || type === "transfer" || type === "adjustment") {
    return type;
  }

  const amount = finiteNumber(transaction.amount);
  if (amount < 0) return "expense";
  if (amount > 0) return "income";
  return "adjustment";
}

function isLiabilityAccount(account: { type: string }) {
  const type = account.type.trim().toLowerCase();
  return type === "credit" || type === "loan";
}

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");

  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  const [profile, healthScore] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { clerkUserId },
      include: {
        goals: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { milestones: { select: { completed: true } } },
        },
        habits: {
          orderBy: { streak: "desc" },
          include: {
            habitLogs: {
              where: { date: { gte: todayStart, lt: todayEnd } },
            },
          },
        },
        savingsGoals: { orderBy: { createdAt: "asc" }, take: 1 },
        financialAccounts: { where: { isArchived: false } },
        transactions: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
            },
          },
        },
        moodEntries: {
          where: { date: { gte: todayStart, lt: todayEnd } },
          orderBy: { date: "desc" },
          take: 1,
        },
        jobApplications: true,
        skills: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    }),
    getHealthScore(),
  ]);

  const goals = (profile?.goals ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    progress: calculateGoalProgress(g.milestones),
    category: g.category ?? "personal",
  }));

  const allHabits = profile?.habits ?? [];
  const habits = allHabits.map((h) => ({
    id: h.id,
    name: h.title,
    streak: h.streak,
    icon: "✅",
  }));
  const habitsCompletedToday = allHabits.filter((h) =>
    h.habitLogs.some((l) => l.completed)
  ).length;
  const moodToday = profile?.moodEntries[0]?.mood ?? null;

  const savingsGoal = profile?.savingsGoals[0]
    ? {
        id: profile.savingsGoals[0].id,
        name: profile.savingsGoals[0].title,
        currentAmount: Math.max(finiteNumber(profile.savingsGoals[0].currentAmount), 0),
        targetAmount: Math.max(finiteNumber(profile.savingsGoals[0].targetAmount), 0),
      }
    : null;

  const monthlyTransactions = profile?.transactions ?? [];
  const monthlyIncome = monthlyTransactions
    .filter((tx) => transactionKind(tx) === "income")
    .reduce((sum, tx) => sum + Math.max(finiteNumber(tx.amount), 0), 0);
  const monthlySpending = monthlyTransactions
    .filter((tx) => transactionKind(tx) === "expense")
    .reduce((sum, tx) => sum + Math.abs(finiteNumber(tx.amount)), 0);
  const financeCashflow =
    monthlyTransactions.length > 0 ? monthlyIncome - monthlySpending : null;
  const financeSavingsRate =
    monthlyIncome > 0
      ? Math.round(((monthlyIncome - monthlySpending) / monthlyIncome) * 100)
      : null;

  const financialAccounts = profile?.financialAccounts ?? [];
  const derivedAssets = financialAccounts.reduce((sum, account) => {
    if (isLiabilityAccount(account)) return sum;
    return sum + Math.max(finiteNumber(account.balance), 0);
  }, 0);
  const derivedLiabilities = financialAccounts.reduce((sum, account) => {
    const balance = finiteNumber(account.balance);
    if (isLiabilityAccount(account)) {
      return sum + Math.abs(balance);
    }
    return balance < 0 ? sum + Math.abs(balance) : sum;
  }, 0);
  const netWorth = financialAccounts.length > 0 ? derivedAssets - derivedLiabilities : null;
  const hasFinanceData =
    financialAccounts.length > 0 || monthlyTransactions.length > 0 || savingsGoal !== null;

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Hero banner */}
      <HeroBanner />

      {/* Page content — sits on top of (and below) the hero */}
      <div className="relative z-10 px-4 pb-12 sm:px-6 lg:px-8">
        {/* Greeting overlaid on hero */}
        <div className="pt-6 pb-6 sm:pt-8">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Hello, there!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here&apos;s how your life is looking today.
          </p>
        </div>

        {/* Life Score + Stats */}
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="shrink-0 lg:w-64">
            <LifeScoreCard />
          </div>
          <div className="flex-1">
            <StatsBar
              goalsCount={goals.length}
              habitsCount={habits.length}
              financeCashflow={financeCashflow}
              financeSavingsRate={financeSavingsRate}
              healthScore={healthScore}
            />
          </div>
        </div>

        {/* Main widget grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <GoalsWidget goals={goals} />
          <HabitsWidget habits={habits} />
          <AiCoachWidget />
        </div>

        {/* Bottom widget row */}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CareerOverviewWidget
            jobApplications={profile?.jobApplications ?? []}
            skills={profile?.skills ?? []}
          />
          <FinanceWidget
            savingsGoal={savingsGoal}
            summary={{
              monthlyIncome,
              monthlySpending,
              cashflow: financeCashflow ?? 0,
              savingsRate: financeSavingsRate,
              netWorth,
              hasData: hasFinanceData,
            }}
          />
          <HealthWidget
            healthScore={healthScore}
            moodToday={moodToday}
            habitsToday={{ completed: habitsCompletedToday, total: allHabits.length }}
          />
          <UpcomingWidget />
        </div>
      </div>
    </div>
  );
}
