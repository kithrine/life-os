"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  readOnboardingFormData,
  type OnboardingErrors,
  type OnboardingValues,
  validateOnboardingValues,
} from "./validation";

export type OnboardingActionResult = {
  success: false;
  errors?: OnboardingErrors;
  message?: string;
};

const SKIPPED_ONBOARDING_VALUE = "Skipped for now";
const EMPTY_ADDITIONAL_INFORMATION = "No additional information provided.";

function valuesForPersistence(values: OnboardingValues) {
  return {
    lifeStage: values.lifeStage,
    currentSituation: values.currentSituation,
    biggestChallenge: values.biggestChallenge,
    careerGoals: values.careerGoals,
    financialGoals: values.financialGoals,
    healthGoals: values.healthGoals,
    personalGrowthGoals: values.personalGrowthGoals,
    futureVision: values.futureVision || EMPTY_ADDITIONAL_INFORMATION,
  };
}

function skippedOnboardingValues() {
  return {
    lifeStage: SKIPPED_ONBOARDING_VALUE,
    currentSituation: SKIPPED_ONBOARDING_VALUE,
    biggestChallenge: SKIPPED_ONBOARDING_VALUE,
    careerGoals: SKIPPED_ONBOARDING_VALUE,
    financialGoals: SKIPPED_ONBOARDING_VALUE,
    healthGoals: SKIPPED_ONBOARDING_VALUE,
    personalGrowthGoals: SKIPPED_ONBOARDING_VALUE,
    futureVision: EMPTY_ADDITIONAL_INFORMATION,
  };
}

export async function completeOnboarding(formData: FormData): Promise<OnboardingActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to complete onboarding.",
    };
  }

  const shouldSkip = formData.get("onboardingIntent") === "skip";
  const values = shouldSkip
    ? skippedOnboardingValues()
    : valuesForPersistence(readOnboardingFormData(formData));
  const errors = validateOnboardingValues(values);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please complete the required onboarding fields.",
    };
  }

  await prisma.userProfile.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      lifeStage: values.lifeStage,
      currentSituation: values.currentSituation,
      biggestChallenge: values.biggestChallenge,
      careerGoals: values.careerGoals,
      financialGoals: values.financialGoals,
      healthGoals: values.healthGoals,
      personalGrowthGoals: values.personalGrowthGoals,
      futureVision: values.futureVision,
    },
    update: {
      lifeStage: values.lifeStage,
      currentSituation: values.currentSituation,
      biggestChallenge: values.biggestChallenge,
      careerGoals: values.careerGoals,
      financialGoals: values.financialGoals,
      healthGoals: values.healthGoals,
      personalGrowthGoals: values.personalGrowthGoals,
      futureVision: values.futureVision,
    },
  });

  redirect("/blueprint");
}
