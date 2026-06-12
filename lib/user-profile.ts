import { prisma } from "@/lib/prisma";

const onboardingFields = [
  "lifeStage",
  "currentSituation",
  "biggestChallenge",
  "careerGoals",
  "financialGoals",
  "healthGoals",
  "personalGrowthGoals",
  "futureVision",
] as const;

export const onboardingStatusSelect = {
  id: true,
  lifeStage: true,
  currentSituation: true,
  biggestChallenge: true,
  careerGoals: true,
  financialGoals: true,
  healthGoals: true,
  personalGrowthGoals: true,
  futureVision: true,
};

type OnboardingStatusProfile = {
  [key in (typeof onboardingFields)[number]]: string | null;
};

export function isOnboardingComplete(profile: OnboardingStatusProfile | null | undefined) {
  return Boolean(
    profile &&
      onboardingFields.every((field) => {
        const value = profile[field];
        return typeof value === "string" && value.trim().length > 0;
      })
  );
}

export function getOrCreateUserProfile(clerkUserId: string) {
  return prisma.userProfile.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
  });
}

export function getOrCreateUserProfileOnboardingStatus(clerkUserId: string) {
  return prisma.userProfile.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId },
    select: onboardingStatusSelect,
  });
}
