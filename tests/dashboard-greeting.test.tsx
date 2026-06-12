import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { prisma } from "@/lib/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_123" }),
  currentUser: vi.fn().mockResolvedValue({ firstName: null }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/components/dashboard/hero-banner", () => ({
  HeroBanner: () => <div data-testid="hero-banner" />,
}));

vi.mock("@/components/dashboard/life-score-card", () => ({
  LifeScoreCard: () => <div data-testid="life-score-card" />,
}));

vi.mock("@/components/dashboard/stats-bar", () => ({
  StatsBar: () => <div data-testid="stats-bar" />,
}));

vi.mock("@/components/dashboard/goals-widget", () => ({
  GoalsWidget: () => <div data-testid="goals-widget" />,
}));

vi.mock("@/components/dashboard/habits-widget", () => ({
  HabitsWidget: () => <div data-testid="habits-widget" />,
}));

vi.mock("@/components/dashboard/ai-coach-widget", () => ({
  AiCoachWidget: () => <div data-testid="ai-coach-widget" />,
}));

vi.mock("@/components/dashboard/career-overview-widget", () => ({
  CareerOverviewWidget: () => <div data-testid="career-widget" />,
}));

vi.mock("@/components/dashboard/finance-widget", () => ({
  FinanceWidget: () => <div data-testid="finance-widget" />,
}));

vi.mock("@/components/dashboard/health-widget", () => ({
  HealthWidget: () => <div data-testid="health-widget" />,
}));

vi.mock("@/components/dashboard/upcoming-widget", () => ({
  UpcomingWidget: () => <div data-testid="upcoming-widget" />,
}));

const mockFindUnique = prisma.userProfile.findUnique as unknown as ReturnType<typeof vi.fn>;

describe("Dashboard greeting", () => {
  it("displays the saved profile first name when Clerk does not provide one", async () => {
    mockFindUnique.mockResolvedValueOnce({
      firstName: "John",
      goals: [],
      habits: [],
      savingsGoals: [],
      financialAccounts: [],
      transactions: [],
      jobApplications: [],
      skills: [],
    });

    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: /hello, john!/i })).toBeInTheDocument();
  });
});
