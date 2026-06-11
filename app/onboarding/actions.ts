"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  readOnboardingFormData,
  type OnboardingErrors,
  validateOnboardingValues,
} from "./validation";

export type OnboardingActionResult = {
  success: false;
  errors?: OnboardingErrors;
  message?: string;
};

export async function completeOnboarding(formData: FormData): Promise<OnboardingActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to complete onboarding.",
    };
  }

  const values = readOnboardingFormData(formData);
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
