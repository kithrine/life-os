"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ProfileFormData = {
  name: string;
  lifeStage: string;
  currentSituation: string;
  biggestChallenge: string;
  careerGoals: string;
  financialGoals: string;
  healthGoals: string;
  personalGrowthGoals: string;
  futureVision: string;
};

export async function updateProfile(data: ProfileFormData) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  await prisma.userProfile.update({
    where: { clerkUserId: userId },
    data,
  });
  revalidatePath("/profile");
}
