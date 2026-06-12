"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Habit.userId references UserProfile.id, not the Clerk user id,
// so every action resolves the profile first
async function requireProfileId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  })
  if (!profile) throw new Error("Profile not found")
  return profile.id
}

export async function createHabit(title: string): Promise<void> {
  const profileId = await requireProfileId()
  await prisma.habit.create({ data: { userId: profileId, title } })
}

export async function completeHabit(habitId: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const existing = await prisma.habitLog.findFirst({
    where: { habitId, date: { gte: today } },
  })
  if (existing) return
  await prisma.habit.update({
    where: { id: habitId },
    data: { streak: { increment: 1 }, lastCompleted: new Date() },
  })
  await prisma.habitLog.create({ data: { habitId, completed: true } })
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  await prisma.habit.delete({ where: { id: habitId } })
}

export async function getHabits() {
  const profileId = await requireProfileId()
  return prisma.habit.findMany({ where: { userId: profileId } })
}
