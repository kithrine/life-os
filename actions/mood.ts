"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

// MoodEntry.userId references UserProfile.id, not the Clerk user id
async function requireProfileId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  })
  if (!profile) throw new Error("Profile not found")
  return profile.id
}

export async function logMood(mood: number, note?: string): Promise<void> {
  if (mood < 1 || mood > 5) throw new Error("Mood must be between 1 and 5")
  const profileId = await requireProfileId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  await prisma.moodEntry.upsert({
    where: { userId_date: { userId: profileId, date: today } },
    update: { mood, note },
    create: { userId: profileId, mood, note, date: today },
  })
  revalidatePath("/health")
  revalidatePath("/dashboard")
}

export async function getMoodHistory() {
  const profileId = await requireProfileId()
  return await prisma.moodEntry.findMany({
    where: { userId: profileId },
    orderBy: { date: "desc" },
  }) ?? []
}
