import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OnboardingPage from "@/app/onboarding/page";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_123" }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/user-profile", () => ({
  getOrCreateUserProfileOnboardingStatus: vi.fn().mockResolvedValue({
    id: "profile_123",
    lifeStage: null,
    currentSituation: null,
    biggestChallenge: null,
    careerGoals: null,
    financialGoals: null,
    healthGoals: null,
    personalGrowthGoals: null,
    futureVision: null,
  }),
  isOnboardingComplete: vi.fn().mockReturnValue(false),
}));

vi.mock("@/app/onboarding/actions", () => ({
  completeOnboarding: vi.fn(),
}));

describe("OnboardingPage", () => {
  it("renders selectable onboarding sections", async () => {
    render(await OnboardingPage());

    expect(screen.getByText(/life stage/i)).toBeInTheDocument();
    expect(screen.getByText(/current situation/i)).toBeInTheDocument();
    expect(screen.getByText(/biggest challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/career goals/i)).toBeInTheDocument();
    expect(screen.getByText(/financial goals/i)).toBeInTheDocument();
    expect(screen.getByText(/health goals/i)).toBeInTheDocument();
    expect(screen.getByText(/personal growth goals/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip for now/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("renders optional additional information as the only textbox", async () => {
    render(await OnboardingPage());

    expect(screen.getByRole("textbox", { name: /additional information/i })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });
});
