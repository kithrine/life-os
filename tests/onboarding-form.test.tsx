import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";

function selectMinimumAnswers() {
  [
    "Student",
    "I need more structure",
    "I want better habits",
    "Staying consistent",
    "Build skills",
    "Save money",
    "Move more",
    "Build confidence",
  ].forEach((label) => {
    const optionButton = screen.getByText(label).closest("button");
    expect(optionButton).toBeTruthy();
    fireEvent.click(optionButton!);
  });
}

describe("OnboardingForm validation", () => {
  it("uses selectable options and keeps additional information as the only textbox", () => {
    render(<OnboardingForm action={vi.fn()} />);

    expect(screen.getByRole("button", { name: /student/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /i need more structure/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save money/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip for now/i })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: /additional information/i })).toBeInTheDocument();
  });

  it("rejects missing required selections and keeps additional information optional", async () => {
    const action = vi.fn();

    render(<OnboardingForm action={action} />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/life stage is required/i)).toBeInTheDocument();
    expect(screen.getByText(/current situation is required/i)).toBeInTheDocument();
    expect(screen.getByText(/biggest challenge is required/i)).toBeInTheDocument();
    expect(screen.getByText(/career goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/financial goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/health goals are required/i)).toBeInTheDocument();
    expect(screen.getByText(/personal growth goals are required/i)).toBeInTheDocument();
    expect(screen.queryByText(/additional information is required/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(action).not.toHaveBeenCalled();
    });
  });

  it("submits selected options through the existing action flow", async () => {
    const action = vi.fn().mockResolvedValue(undefined);

    render(<OnboardingForm action={action} />);
    selectMinimumAnswers();
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    const formData = action.mock.calls[0][0] as FormData;
    expect(formData.get("lifeStage")).toBe("Student");
    expect(formData.getAll("currentSituation")).toEqual([
      "I need more structure",
      "I want better habits",
    ]);
    expect(formData.get("futureVision")).toBe("");
  });

  it("allows users to skip onboarding", async () => {
    const action = vi.fn().mockResolvedValue(undefined);

    render(<OnboardingForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    const formData = action.mock.calls[0][0] as FormData;
    expect(formData.get("onboardingIntent")).toBe("skip");
  });
});
