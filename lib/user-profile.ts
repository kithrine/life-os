import { currentUser } from "@clerk/nextjs/server";
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
  firstName: true,
  lastName: true,
  name: true,
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

type UserIdentity = {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
};

function cleanNamePart(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function displayName(firstName: string | null, lastName: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ") || null;
}

async function getCurrentUserIdentity(): Promise<UserIdentity> {
  const user = await currentUser();
  const metadata = user?.unsafeMetadata as Record<string, unknown> | undefined;
  const firstName = cleanNamePart(user?.firstName) ?? cleanNamePart(metadata?.firstName);
  const lastName = cleanNamePart(user?.lastName) ?? cleanNamePart(metadata?.lastName);

  return {
    firstName,
    lastName,
    name: displayName(firstName, lastName),
  };
}

function updateIdentityData(identity: UserIdentity) {
  const data: Partial<UserIdentity> = {};

  if (identity.firstName) data.firstName = identity.firstName;
  if (identity.lastName) data.lastName = identity.lastName;
  if (identity.name) data.name = identity.name;

  return data;
}

export function isOnboardingComplete(profile: OnboardingStatusProfile | null | undefined) {
  return Boolean(
    profile &&
      onboardingFields.every((field) => {
        const value = profile[field];
        return typeof value === "string" && value.trim().length > 0;
      })
  );
}

export async function getOrCreateUserProfile(clerkUserId: string) {
  const identity = await getCurrentUserIdentity();

  return prisma.userProfile.upsert({
    where: { clerkUserId },
    update: updateIdentityData(identity),
    create: { clerkUserId, ...identity },
  });
}

export async function getOrCreateUserProfileOnboardingStatus(clerkUserId: string) {
  const identity = await getCurrentUserIdentity();

  return prisma.userProfile.upsert({
    where: { clerkUserId },
    update: updateIdentityData(identity),
    create: { clerkUserId, ...identity },
    select: onboardingStatusSelect,
  });
}
