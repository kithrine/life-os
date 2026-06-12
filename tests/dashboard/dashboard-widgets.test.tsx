import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// ── Module stubs ──────────────────────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

import { GoalsWidget } from "@/components/dashboard/goals-widget";
import { HabitsWidget } from "@/components/dashboard/habits-widget";
import { AiCoachWidget } from "@/components/dashboard/ai-coach-widget";
import { CareerOverviewWidget } from "@/components/dashboard/career-overview-widget";
import { FinanceWidget } from "@/components/dashboard/finance-widget";
import { HealthWidget } from "@/components/dashboard/health-widget";
import { UpcomingWidget } from "@/components/dashboard/upcoming-widget";
import { StatsBar } from "@/components/dashboard/stats-bar";

// ── StatsBar ──────────────────────────────────────────────────────────────────
describe("StatsBar", () => {
  it("renders all four category labels", () => {
    render(
      <StatsBar
        goalsCount={3}
        habitsCount={4}
        financeCashflow={1350}
        financeSavingsRate={32}
      />
    );
    expect(screen.getByText("Goals")).toBeTruthy();
    expect(screen.getByText("Habits")).toBeTruthy();
    expect(screen.getByText("Finance")).toBeTruthy();
    expect(screen.getByText("Health")).toBeTruthy();
  });

  it("displays real goals count when provided", () => {
    render(
      <StatsBar goalsCount={7} habitsCount={2} financeCashflow={null} financeSavingsRate={null} />
    );
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("displays formatted cashflow when financeCashflow is provided", () => {
    render(
      <StatsBar goalsCount={3} habitsCount={4} financeCashflow={5000} financeSavingsRate={80} />
    );
    expect(screen.getByText("+$5,000")).toBeTruthy();
  });

  it("shows zero finance data when financeCashflow is null", () => {
    render(
      <StatsBar goalsCount={0} habitsCount={0} financeCashflow={null} financeSavingsRate={null} />
    );
    expect(screen.getByText("$0")).toBeTruthy();
    expect(screen.getByText("No finance data")).toBeTruthy();
  });
});

// ── GoalsWidget ───────────────────────────────────────────────────────────────
describe("GoalsWidget", () => {
  const realGoals = [
    { id: "g1", title: "Launch my startup", progress: 45, category: "career" },
    { id: "g2", title: "Save $20k", progress: 30, category: "finance" },
  ];

  it("renders section heading and View all link", () => {
    render(<GoalsWidget goals={[]} />);
    expect(screen.getByText("Goals")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view all/i })).toBeTruthy();
  });

  it("shows an empty state when no goals are passed", () => {
    render(<GoalsWidget goals={[]} />);
    expect(screen.getByText(/no goals yet/i)).toBeTruthy();
  });

  it("shows real goals when provided", () => {
    render(<GoalsWidget goals={realGoals} />);
    expect(screen.getByText("Launch my startup")).toBeTruthy();
    expect(screen.getByText("Save $20k")).toBeTruthy();
  });

  it("does not show placeholders when real goals exist", () => {
    render(<GoalsWidget goals={realGoals} />);
    expect(screen.queryByText("Save $10,000")).toBeNull();
    expect(screen.queryByText(/no goals yet/i)).toBeNull();
  });

  it("displays progress percentages", () => {
    render(<GoalsWidget goals={realGoals} />);
    expect(screen.getByText("45%")).toBeTruthy();
    expect(screen.getByText("30%")).toBeTruthy();
  });
});

// ── HabitsWidget ──────────────────────────────────────────────────────────────
describe("HabitsWidget", () => {
  const realHabits = [
    { id: "h1", name: "Cold Shower", streak: 5, icon: "🚿" },
    { id: "h2", name: "Journal", streak: 20, icon: "📓" },
  ];

  it("renders section heading and View all link", () => {
    render(<HabitsWidget habits={[]} />);
    expect(screen.getByText("Habits")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view all/i })).toBeTruthy();
  });

  it("shows placeholder habits when no habits are passed", () => {
    render(<HabitsWidget habits={[]} />);
    expect(screen.getByText("Morning Run")).toBeTruthy();
    expect(screen.getByText("Meditate")).toBeTruthy();
  });

  it("shows real habits when provided", () => {
    render(<HabitsWidget habits={realHabits} />);
    expect(screen.getByText("Cold Shower")).toBeTruthy();
    expect(screen.getByText("Journal")).toBeTruthy();
  });

  it("does not show placeholders when real habits exist", () => {
    render(<HabitsWidget habits={realHabits} />);
    expect(screen.queryByText("Morning Run")).toBeNull();
  });

  it("displays streak counts", () => {
    render(<HabitsWidget habits={realHabits} />);
    // Exact string avoids multiple-match error from ancestor divs containing "5d"
    expect(screen.getByText("🔥 5d")).toBeTruthy();
    expect(screen.getByText("🔥 20d")).toBeTruthy();
  });
});

// ── AiCoachWidget ─────────────────────────────────────────────────────────────
describe("AiCoachWidget", () => {
  it("renders AI Coach heading", () => {
    render(<AiCoachWidget />);
    expect(screen.getByText("AI Coach")).toBeTruthy();
  });

  it("renders Ask AI Coach button linking to /ai-coach", () => {
    render(<AiCoachWidget />);
    const link = screen.getByRole("link", { name: /ask ai coach/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/ai-coach");
  });

  it("renders a focus-for-today section", () => {
    render(<AiCoachWidget />);
    expect(screen.getByText(/focus for today/i)).toBeTruthy();
  });
});

// ── CareerOverviewWidget ──────────────────────────────────────────────────────
describe("CareerOverviewWidget", () => {
  const apps = [
    { id: "a1", status: "applied" },
    { id: "a2", status: "interviewing" },
    { id: "a3", status: "rejected" },
  ];
  const skills = [
    { id: "s1", name: "TypeScript", level: "advanced" },
    { id: "s2", name: "React", level: "intermediate" },
  ];

  it("renders Career heading and View details link", () => {
    render(<CareerOverviewWidget jobApplications={[]} skills={[]} />);
    expect(screen.getByText("Career")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view details/i })).toBeTruthy();
  });

  it("shows empty state when no data provided", () => {
    render(<CareerOverviewWidget jobApplications={[]} skills={[]} />);
    expect(screen.getByText(/no career data yet/i)).toBeTruthy();
  });

  it("counts active applications correctly (excludes rejected)", () => {
    render(<CareerOverviewWidget jobApplications={apps} skills={skills} />);
    // applied + interviewing = 2 active
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("counts interviews correctly", () => {
    render(<CareerOverviewWidget jobApplications={apps} skills={skills} />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("renders skill names", () => {
    render(<CareerOverviewWidget jobApplications={apps} skills={skills} />);
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.getByText("React")).toBeTruthy();
  });

  it("renders skill level labels", () => {
    render(<CareerOverviewWidget jobApplications={apps} skills={skills} />);
    expect(screen.getByText("advanced")).toBeTruthy();
    expect(screen.getByText("intermediate")).toBeTruthy();
  });
});

// ── FinanceWidget ─────────────────────────────────────────────────────────────
describe("FinanceWidget", () => {
  const goal = {
    id: "sg1",
    name: "Emergency Fund",
    currentAmount: 4000,
    targetAmount: 5000,
  };
  const summary = {
    monthlyIncome: 4200,
    monthlySpending: 2850,
    cashflow: 1350,
    savingsRate: 32,
    netWorth: 12000,
    hasData: true,
  };

  it("renders Finance heading and View details link", () => {
    render(<FinanceWidget savingsGoal={null} summary={{ ...summary, hasData: false }} />);
    expect(screen.getByText("Finance")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view details/i })).toBeTruthy();
  });

  it("shows empty savings goal state when savingsGoal is null", () => {
    render(<FinanceWidget savingsGoal={null} summary={{ ...summary, hasData: false }} />);
    expect(screen.getByText("No savings goal yet")).toBeTruthy();
  });

  it("shows real goal name when provided", () => {
    render(<FinanceWidget savingsGoal={{ ...goal, name: "House Down Payment" }} summary={summary} />);
    expect(screen.getByText("House Down Payment")).toBeTruthy();
  });

  it("shows calculated percentage", () => {
    render(<FinanceWidget savingsGoal={goal} summary={summary} />);
    expect(screen.getByText("80%")).toBeTruthy();
  });

  it("does not divide by zero for savings goals without a target", () => {
    render(<FinanceWidget savingsGoal={{ ...goal, targetAmount: 0 }} summary={summary} />);
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("renders income, expenses, and cashflow rows", () => {
    render(<FinanceWidget savingsGoal={null} summary={summary} />);
    expect(screen.getByText("Monthly Income")).toBeTruthy();
    expect(screen.getByText("Expenses")).toBeTruthy();
    expect(screen.getByText("Cashflow")).toBeTruthy();
    expect(screen.getByText("+$1,350")).toBeTruthy();
  });
});

// ── HealthWidget ──────────────────────────────────────────────────────────────
describe("HealthWidget", () => {
  it("renders Health heading and View details link", () => {
    render(<HealthWidget />);
    expect(screen.getByText("Health")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view details/i })).toBeTruthy();
  });

  it("renders the health score", () => {
    render(<HealthWidget />);
    expect(screen.getByText("74")).toBeTruthy();
  });

  it("renders stats rows", () => {
    render(<HealthWidget />);
    expect(screen.getByText("Steps today")).toBeTruthy();
    expect(screen.getByText("Daily mood")).toBeTruthy();
    expect(screen.getByText("Sleep")).toBeTruthy();
  });
});

// ── UpcomingWidget ────────────────────────────────────────────────────────────
describe("UpcomingWidget", () => {
  it("renders Upcoming heading", () => {
    render(<UpcomingWidget />);
    expect(screen.getByText("Upcoming")).toBeTruthy();
  });

  it("renders View calendar link", () => {
    render(<UpcomingWidget />);
    expect(screen.getByRole("link", { name: /view calendar/i })).toBeTruthy();
  });

  it("renders placeholder events", () => {
    render(<UpcomingWidget />);
    expect(screen.getByText("Job Interview — Vercel")).toBeTruthy();
    expect(screen.getByText("Goal Review Session")).toBeTruthy();
    expect(screen.getByText("5K Run")).toBeTruthy();
    expect(screen.getByText("Monthly Budget Review")).toBeTruthy();
  });
});
