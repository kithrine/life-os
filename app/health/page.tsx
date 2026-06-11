import { getHabits } from "@/actions/habits"
import { getMoodHistory } from "@/actions/mood"
import { getHealthScore } from "@/actions/life-score"
import { HabitCard } from "@/components/health/habit-card"
import { HabitForm } from "@/components/health/habit-form"
import { MoodTracker } from "@/components/health/mood-tracker"

type HabitRow = {
  id: string
  title: string
  streak: number
  lastCompleted: Date | null
  completed: boolean
}

type MoodRow = {
  mood: number
  date: Date
}

type HabitRecord = {
  id: string
  title: string
  streak: number
  lastCompleted: Date | null
}

export default async function HealthPage() {
  // Explicit type: getHabits' inferred return type is broken while
  // lib/prisma.ts is commented out
  let habits: HabitRecord[] = []
  let moodHistory: MoodRow[] = []
  let healthScore = 0

  try {
    habits = await getHabits()
  } catch {
    habits = []
  }
  try {
    moodHistory = await getMoodHistory()
  } catch {
    moodHistory = []
  }
  try {
    healthScore = await getHealthScore()
  } catch {
    healthScore = 0
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const habitRows: HabitRow[] = habits.map((h) => ({
    id: h.id,
    title: h.title,
    streak: h.streak,
    lastCompleted: h.lastCompleted ?? null,
    completed:
      h.lastCompleted != null && new Date(h.lastCompleted) >= startOfToday,
  }))

  const activeHabits = habitRows.filter((h) => h.streak > 0).length
  const bestStreak = habitRows.reduce((max, h) => Math.max(max, h.streak), 0)
  const latestMood = moodHistory[0]?.mood ?? null

  const stats = [
    { label: "Active Habits", value: String(activeHabits) },
    { label: "Best Streak", value: String(bestStreak) },
    { label: "Today's Mood", value: latestMood !== null ? `${latestMood} / 5` : "—" },
  ]

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
        <p className="text-sm text-gray-600">
          Health Score:{" "}
          <span className="text-lg font-semibold text-gray-900">{healthScore}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <HabitCard habits={habitRows} />
          <HabitForm />
        </div>
        <MoodTracker moodHistory={moodHistory} />
      </div>
    </main>
  )
}
