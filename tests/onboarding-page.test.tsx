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
  it("renders all required onboarding fields", async () => {
    render(await OnboardingPage());

    expect(screen.getByLabelText(/life stage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current situation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/biggest challenge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/career goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/financial goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/health goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/personal growth goals/i)).toBeInTheDocument();
  });

  it("renders optional additional context", async () => {
    render(await OnboardingPage());

    expect(screen.getByLabelText(/additional context/i)).toBeInTheDocument();
  });
});
