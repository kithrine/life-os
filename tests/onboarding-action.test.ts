import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/onboarding/actions";
import { prisma } from "@/lib/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      upsert: vi.fn(),
    },
  },
}));

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;
const mockUpsert = prisma.userProfile.upsert as unknown as ReturnType<typeof vi.fn>;

function validOnboardingFormData() {
  const formData = new FormData();

  formData.set("lifeStage", "early-career");
  formData.set("currentSituation", "Building a new personal system.");
  formData.set("biggestChallenge", "Staying consistent across priorities.");
  formData.set("careerGoals", "Grow into a product leadership role.");
  formData.set("financialGoals", "Build a stronger emergency fund.");
  formData.set("healthGoals", "Improve sleep and training consistency.");
  formData.set("personalGrowthGoals", "Read, reflect, and communicate better.");
  formData.set("futureVision", "Create a calmer and more intentional life.");

  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("completeOnboarding auth protection", () => {
  it("rejects unauthenticated submissions", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    const result = await completeOnboarding(new FormData());

    expect(result).toEqual({
      success: false,
      message: "You must be signed in to complete onboarding.",
    });
  });
});

describe("completeOnboarding save and redirect", () => {
  it("saves onboarding data to the authenticated Clerk user and redirects", async () => {
    mockAuth.mockResolvedValueOnce({ userId: "user_123" });
    mockUpsert.mockResolvedValueOnce({ id: "profile_123" });
    mockRedirect.mockImplementationOnce((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });

    await expect(completeOnboarding(validOnboardingFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/blueprint"
    );

    expect(mockUpsert).toHaveBeenCalledWith({
      where: { clerkUserId: "user_123" },
      create: expect.objectContaining({
        clerkUserId: "user_123",
        lifeStage: "early-career",
        currentSituation: "Building a new personal system.",
        biggestChallenge: "Staying consistent across priorities.",
        careerGoals: "Grow into a product leadership role.",
        financialGoals: "Build a stronger emergency fund.",
        healthGoals: "Improve sleep and training consistency.",
        personalGrowthGoals: "Read, reflect, and communicate better.",
        futureVision: "Create a calmer and more intentional life.",
      }),
      update: expect.objectContaining({
        lifeStage: "early-career",
        currentSituation: "Building a new personal system.",
        biggestChallenge: "Staying consistent across priorities.",
        careerGoals: "Grow into a product leadership role.",
        financialGoals: "Build a stronger emergency fund.",
        healthGoals: "Improve sleep and training consistency.",
        personalGrowthGoals: "Read, reflect, and communicate better.",
        futureVision: "Create a calmer and more intentional life.",
      }),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/blueprint");
  });
});
