import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");

  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId },
    include: {
      goals: { orderBy: { createdAt: "desc" }, take: 3 },
      habits: { orderBy: { streak: "desc" }, take: 4 },
      savingsGoals: { orderBy: { createdAt: "asc" }, take: 1 },
      jobApplications: true,
      skills: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  const goals = (profile?.goals ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
    category: g.category ?? "personal",
  }));

  const habits = (profile?.habits ?? []).map((h) => ({
    id: h.id,
    name: h.title,
    streak: h.streak,
    icon: "✅",
  }));

  const savingsGoal = profile?.savingsGoals[0]
    ? {
        id: profile.savingsGoals[0].id,
        name: profile.savingsGoals[0].title,
        currentAmount: Number(profile.savingsGoals[0].currentAmount),
        targetAmount: Number(profile.savingsGoals[0].targetAmount),
      }
    : null;

  const savedThisMonth = savingsGoal?.currentAmount ?? null;
  const savingsPercent = savingsGoal
    ? Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100)
    : null;

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Hero banner */}
      <HeroBanner />

      {/* Page content — sits on top of (and below) the hero */}
      <div className="relative z-10 px-4 pb-12 sm:px-6 lg:px-8">
        {/* Greeting overlaid on hero */}
        <div className="pt-12 pb-6 sm:pt-16">
          <h1 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-white/80 drop-shadow">
            Here&apos;s how your life is looking today.
          </p>
        </div>

        {/* Life Score + Stats */}
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="shrink-0 lg:w-64">
            <LifeScoreCard />
          </div>
          <div className="flex-1">
            <StatsBar
              goalsCount={goals.length}
              habitsCount={habits.length}
              savedThisMonth={savedThisMonth}
              savingsPercent={savingsPercent}
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
          <FinanceWidget savingsGoal={savingsGoal} />
          <HealthWidget />
          <UpcomingWidget />
        </div>
      </div>
    </div>
  );
}
