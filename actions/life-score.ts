"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getHealthScore(): Promise<number> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const habits = await prisma.habit.findMany({ where: { userId } }) ?? []
  const habitLogs = await prisma.habitLog.findMany({
    where: { habit: { userId }, completed: true },
  }) ?? []
  const moodEntries = await prisma.moodEntry.findMany({ where: { userId } }) ?? []

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
