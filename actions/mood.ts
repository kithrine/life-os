"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function logMood(mood: number, note?: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  if (mood < 1 || mood > 5) throw new Error("Mood must be between 1 and 5")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  await prisma.moodEntry.upsert({
    where: { userId_date: { userId, date: today } },
    update: { mood, note },
    create: { userId, mood, note, date: today },
  })
}

export async function getMoodHistory() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  return await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  }) ?? []
}
