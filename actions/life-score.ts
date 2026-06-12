"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getHealthScore(): Promise<number> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Health data is keyed by UserProfile.id, not the Clerk user id;
  // no profile yet means no health data
  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  })
  if (!profile) return 0

  const habits = await prisma.habit.findMany({ where: { userId: profile.id } }) ?? []
  const habitLogs = await prisma.habitLog.findMany({
    where: { habit: { userId: profile.id }, completed: true },
  }) ?? []
  const moodEntries = await prisma.moodEntry.findMany({
    where: { userId: profile.id },
  }) ?? []

  if (!habits.length && !moodEntries.length) return 0

  let habitScore = 0
  if (habits.length > 0) {
    const completionRate = habitLogs.length / (habits.length * 7)
    habitScore = Math.min(completionRate, 1) * 50
  }

  let moodScore = 0
  if (moodEntries.length > 0) {
    const avgMood =
      moodEntries.reduce((sum: number, e: { mood: number }) => sum + e.mood, 0) /
      moodEntries.length
    moodScore = (avgMood / 5) * 50
  }

  return Math.round(habitScore + moodScore)
}
