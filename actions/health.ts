"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getHealthScore } from "@/actions/life-score"
import type {
  HealthDashboardData,
  HealthHabit,
  HealthMoodEntry,
  HealthWeeklyDay,
} from "@/components/health/types"

const DAY_MS = 24 * 60 * 60 * 1000
const SERIES_DAYS = 14
const WEEK_DAYS = 7

// Health data is keyed by UserProfile.id, not the Clerk user id
async function requireProfileId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  })
  if (!profile) throw new Error("Profile not found")
  return profile.id
}

function startOfDay(date: Date): Date {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

export async function getHealthDashboard(): Promise<HealthDashboardData> {
  const profileId = await requireProfileId()

  const today = startOfDay(new Date())
  const seriesStart = new Date(today.getTime() - (SERIES_DAYS - 1) * DAY_MS)

  const [habits, completedLogs, moods, healthScore] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: profileId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.habitLog.findMany({
      where: {
        habit: { userId: profileId },
        completed: true,
        date: { gte: seriesStart },
      },
      orderBy: { date: "asc" },
    }),
    prisma.moodEntry.findMany({
      where: { userId: profileId },
      orderBy: { date: "desc" },
      take: 30,
    }),
    getHealthScore(),
  ])

  // Index 0 is the oldest day in the 14-day window, index 13 is today
  const dayIndex = (date: Date) =>
    Math.round((startOfDay(date).getTime() - seriesStart.getTime()) / DAY_MS)

  const completionByDay = Array.from({ length: SERIES_DAYS }, () => 0)
  const completedTodayIds = new Set<string>()
  for (const log of completedLogs) {
    const index = dayIndex(new Date(log.date))
    if (index < 0 || index >= SERIES_DAYS) continue
    completionByDay[index] += 1
    if (index === SERIES_DAYS - 1) completedTodayIds.add(log.habitId)
  }

  const habitRows: HealthHabit[] = habits.map((habit) => {
    const weekLog = Array.from({ length: WEEK_DAYS }, () => false)
    for (const log of completedLogs) {
      if (log.habitId !== habit.id) continue
      const weekOffset = dayIndex(new Date(log.date)) - (SERIES_DAYS - WEEK_DAYS)
      if (weekOffset >= 0 && weekOffset < WEEK_DAYS) weekLog[weekOffset] = true
    }
    return {
      id: habit.id,
      title: habit.title,
      streak: habit.streak,
      lastCompleted: habit.lastCompleted?.toISOString() ?? null,
      completedToday: completedTodayIds.has(habit.id),
      weekLog,
    }
  })

  const totalHabits = habits.length
  const completedToday = completedTodayIds.size
  const completionSeries = completionByDay.map((count) =>
    totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0
  )

  const bestStreakHabit = habitRows.reduce<HealthHabit | null>(
    (best, habit) => (best === null || habit.streak > best.streak ? habit : best),
    null
  )
  const bestStreakSeries =
    bestStreakHabit === null
      ? []
      : completedLogs
          .filter((log) => log.habitId === bestStreakHabit.id)
          .reduce((series, log) => {
            const index = dayIndex(new Date(log.date))
            if (index >= 0 && index < SERIES_DAYS) series[index] = 1
            return series
          }, Array.from({ length: SERIES_DAYS }, () => 0))

  const weekStartIndex = SERIES_DAYS - WEEK_DAYS
  const weeklyActivity: HealthWeeklyDay[] = Array.from(
    { length: WEEK_DAYS },
    (_, offset) => {
      const date = new Date(seriesStart.getTime() + (weekStartIndex + offset) * DAY_MS)
      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed: completionByDay[weekStartIndex + offset],
        total: totalHabits,
      }
    }
  )

  const weekAgo = new Date(today.getTime() - (WEEK_DAYS - 1) * DAY_MS)
  const weekMoods = moods.filter((entry) => entry.date >= weekAgo)
  const moodAverage =
    weekMoods.length > 0
      ? Math.round(
          (weekMoods.reduce((sum, entry) => sum + entry.mood, 0) / weekMoods.length) * 10
        ) / 10
      : null
  const moodSeries = moods
    .slice(0, SERIES_DAYS)
    .map((entry) => entry.mood)
    .reverse()

  const recentMoods: HealthMoodEntry[] = moods.slice(0, 8).map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString(),
    mood: entry.mood,
    note: entry.note ?? null,
  }))

  const weekCompletions = completionByDay
    .slice(weekStartIndex)
    .reduce((sum, count) => sum + count, 0)

  let insight: HealthDashboardData["insight"]
  if (totalHabits === 0 && moods.length === 0) {
    insight = {
      label: "Getting started",
      tone: "neutral",
      message:
        "No health data yet. Add your first habit and log today's mood to start building your trends.",
    }
  } else if (totalHabits > 0 && completedToday === totalHabits) {
    insight = {
      label: "Perfect day",
      tone: "positive",
      message: `All ${totalHabits} habit${totalHabits === 1 ? "" : "s"} completed today. You logged ${weekCompletions} check-in${weekCompletions === 1 ? "" : "s"} over the last 7 days.`,
    }
  } else if (totalHabits > 0 && weekCompletions < totalHabits * WEEK_DAYS * 0.4) {
    insight = {
      label: "Consistency check",
      tone: "warning",
      message: `You completed ${weekCompletions} of ${totalHabits * WEEK_DAYS} possible habit check-ins in the last 7 days. Small daily wins rebuild streaks fastest.`,
    }
  } else {
    insight = {
      label: "This week",
      tone: "neutral",
      message: `${weekCompletions} habit check-in${weekCompletions === 1 ? "" : "s"} in the last 7 days${moodAverage !== null ? ` with an average mood of ${moodAverage} / 5` : ""}.`,
    }
  }

  return {
    todayLabel: today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    metrics: {
      healthScore: { value: healthScore, series: completionByDay },
      todayCompletion: {
        percent: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : null,
        completed: completedToday,
        total: totalHabits,
        series: completionSeries,
      },
      bestStreak: {
        value: bestStreakHabit?.streak ?? 0,
        habitTitle: bestStreakHabit?.title ?? null,
        series: bestStreakSeries,
      },
      mood: {
        average: moodAverage,
        latest: moods[0]?.mood ?? null,
        series: moodSeries,
      },
    },
    weeklyActivity,
    habits: habitRows,
    recentMoods,
    insight,
  }
}
