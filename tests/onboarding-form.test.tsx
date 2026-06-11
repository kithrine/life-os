import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";

describe("OnboardingForm validation", () => {
  it("rejects missing required fields and keeps additional context optional", async () => {
    const action = vi.fn();

    render(<OnboardingForm action={action} />);

    fireEvent.click(screen.getByRole("button", { name: /complete onboarding/i }));

    expect(await screen.findByText(/life stage is required/i)).toBeInTheDocument();
    expect(screen.getByText(/current situation is required/i)).toBeInTheDocument();
    expect(screen.getByText(/biggest challenge is required/i)).toBeInTheDocument();
    expect(screen.getByText(/career goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/financial goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/health goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/personal growth goals are required/i)).toBeInTheDocument();
    expect(screen.queryByText(/additional context is required/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(action).not.toHaveBeenCalled();
    });
  });
});
