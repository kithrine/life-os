import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { toggleMilestoneCompletion } from "@/actions/goals";
import { prisma } from "@/lib/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "clerk-user-1" }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn(),
    },
    milestone: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    goal: {
      update: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  userProfile: { findUnique: ReturnType<typeof vi.fn> };
  milestone: {
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  goal: { update: ReturnType<typeof vi.fn> };
};

describe("goals actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.userProfile.findUnique.mockResolvedValue({ id: "profile-1" });
  });

  it("updates goal progress when a milestone is toggled", async () => {
    mockPrisma.milestone.findFirst.mockResolvedValue({
      id: "milestone-1",
      goalId: "goal-1",
      completed: false,
    });
    mockPrisma.milestone.update.mockResolvedValue({ id: "milestone-1" });
    mockPrisma.milestone.findMany.mockResolvedValue([
      { completed: true },
      { completed: false },
    ]);
    mockPrisma.goal.update.mockResolvedValue({ id: "goal-1", progress: 50 });

    await toggleMilestoneCompletion("milestone-1", true);

    expect(mockPrisma.milestone.update).toHaveBeenCalledWith({
      where: { id: "milestone-1" },
      data: { completed: true },
    });
    expect(mockPrisma.goal.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: { progress: 50 },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/goals");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
