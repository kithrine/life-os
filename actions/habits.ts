"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
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
  const trimmedTitle = title.trim()
  if (!trimmedTitle) throw new Error("Habit title is required")
  await prisma.habit.create({ data: { userId: profileId, title: trimmedTitle } })
  revalidatePath("/health")
  revalidatePath("/dashboard")
}

export async function completeHabit(habitId: string): Promise<void> {
  const profileId = await requireProfileId()
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: profileId },
  })
  if (!habit) throw new Error("Habit not found")

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
  revalidatePath("/health")
  revalidatePath("/dashboard")
}

export async function deleteHabit(habitId: string): Promise<void> {
  const profileId = await requireProfileId()
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: profileId },
  })
  if (!habit) throw new Error("Habit not found")

  await prisma.habit.delete({ where: { id: habitId } })
  revalidatePath("/health")
  revalidatePath("/dashboard")
}

export async function getHabits() {
  const profileId = await requireProfileId()
  return prisma.habit.findMany({ where: { userId: profileId } })
}
