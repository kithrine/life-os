import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OnboardingPage from "@/app/onboarding/page";

vi.mock("@/app/onboarding/actions", () => ({
  completeOnboarding: vi.fn(),
}));

describe("OnboardingPage", () => {
  it("renders all required onboarding fields", () => {
    render(<OnboardingPage />);

    expect(screen.getByLabelText(/life stage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current situation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/biggest challenge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/career goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/financial goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/health goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/personal growth goals/i)).toBeInTheDocument();
  });

  it("renders optional additional context", () => {
    render(<OnboardingPage />);

    expect(screen.getByLabelText(/additional context/i)).toBeInTheDocument();
  });
});
