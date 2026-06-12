import { describe, expect, it } from "vitest";
import { calculateGoalProgress, countCompletedMilestones } from "@/lib/goals";

describe("goal progress calculation", () => {
  it("returns 0% when a goal has no milestones", () => {
    expect(calculateGoalProgress([])).toBe(0);
  });

  it("calculates rounded completion percentage from completed milestones", () => {
    const milestones = [
      { completed: true },
      { completed: false },
      { completed: true },
    ];

    expect(calculateGoalProgress(milestones)).toBe(67);
  });

  it("returns 100% when every milestone is complete", () => {
    expect(
      calculateGoalProgress([{ completed: true }, { completed: true }])
    ).toBe(100);
  });

  it("counts completed milestones", () => {
    expect(
      countCompletedMilestones([
        { completed: true },
        { completed: false },
        { completed: true },
      ])
    ).toBe(2);
  });
});
