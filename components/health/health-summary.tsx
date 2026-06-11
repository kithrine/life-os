"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

type Props = {
  activeHabits?: number
  bestStreak?: number
  todayMood?: number | null
}

export function HealthSummary({
  activeHabits = 0,
  bestStreak = 0,
  todayMood = null,
}: Props) {
  const stats = [
    { label: "Active Habits", value: String(activeHabits) },
    { label: "Best Streak", value: String(bestStreak) },
    { label: "Today's Mood", value: todayMood !== null ? `${todayMood} / 5` : "—" },
  ]

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Health</h2>
        <Link
          href="/health"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View health
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
