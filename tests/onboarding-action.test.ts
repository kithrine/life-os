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

  formData.set("lifeStage", "Career transition");
  formData.append("currentSituation", "I need more structure");
  formData.append("currentSituation", "I want better habits");
  formData.append("biggestChallenge", "Staying consistent");
  formData.append("biggestChallenge", "Too many priorities");
  formData.append("careerGoals", "Build skills");
  formData.append("careerGoals", "Change careers");
  formData.append("financialGoals", "Save money");
  formData.append("financialGoals", "Budget better");
  formData.append("healthGoals", "Move more");
  formData.append("healthGoals", "Sleep better");
  formData.append("personalGrowthGoals", "Build confidence");
  formData.append("personalGrowthGoals", "Stay accountable");
  formData.set("futureVision", "Please remember that I prefer simple next steps.");

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
        lifeStage: "Career transition",
        currentSituation: "I need more structure, I want better habits",
        biggestChallenge: "Staying consistent, Too many priorities",
        careerGoals: "Build skills, Change careers",
        financialGoals: "Save money, Budget better",
        healthGoals: "Move more, Sleep better",
        personalGrowthGoals: "Build confidence, Stay accountable",
        futureVision: "Please remember that I prefer simple next steps.",
      }),
      update: expect.objectContaining({
        lifeStage: "Career transition",
        currentSituation: "I need more structure, I want better habits",
        biggestChallenge: "Staying consistent, Too many priorities",
        careerGoals: "Build skills, Change careers",
        financialGoals: "Save money, Budget better",
        healthGoals: "Move more, Sleep better",
        personalGrowthGoals: "Build confidence, Stay accountable",
        futureVision: "Please remember that I prefer simple next steps.",
      }),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/blueprint");
  });

  it("allows users to skip onboarding and continue through the existing redirect", async () => {
    const formData = new FormData();
    formData.set("onboardingIntent", "skip");

    mockAuth.mockResolvedValueOnce({ userId: "user_123" });
    mockUpsert.mockResolvedValueOnce({ id: "profile_123" });
    mockRedirect.mockImplementationOnce((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });

    await expect(completeOnboarding(formData)).rejects.toThrow("NEXT_REDIRECT:/blueprint");

    expect(mockUpsert).toHaveBeenCalledWith({
      where: { clerkUserId: "user_123" },
      create: expect.objectContaining({
        clerkUserId: "user_123",
        lifeStage: "Skipped for now",
        currentSituation: "Skipped for now",
        biggestChallenge: "Skipped for now",
        careerGoals: "Skipped for now",
        financialGoals: "Skipped for now",
        healthGoals: "Skipped for now",
        personalGrowthGoals: "Skipped for now",
        futureVision: "No additional information provided.",
      }),
      update: expect.objectContaining({
        lifeStage: "Skipped for now",
        currentSituation: "Skipped for now",
        biggestChallenge: "Skipped for now",
        careerGoals: "Skipped for now",
        financialGoals: "Skipped for now",
        healthGoals: "Skipped for now",
        personalGrowthGoals: "Skipped for now",
        futureVision: "No additional information provided.",
      }),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/blueprint");
  });
});
