import { describe, expect, it } from "vitest";
import { resolveMilestoneCompletion } from "@/lib/goals";

describe("milestone completion logic", () => {
  it("toggles incomplete milestones to complete", () => {
    expect(resolveMilestoneCompletion(false)).toBe(true);
  });

  it("toggles complete milestones to incomplete", () => {
    expect(resolveMilestoneCompletion(true)).toBe(false);
  });

  it("uses an explicit completion value when provided", () => {
    expect(resolveMilestoneCompletion(false, false)).toBe(false);
    expect(resolveMilestoneCompletion(true, true)).toBe(true);
  });
});
