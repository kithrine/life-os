"use client"

import { useState } from "react"
import { completeHabit } from "@/actions/habits"
import { StreakIndicator } from "@/components/health/streak-indicator"

type Habit = {
  id: string
  title: string
  streak: number
  lastCompleted: Date | null
  completed: boolean
}

export function HabitCard({ habits = [] }: { habits?: Habit[] }) {
  // Optimistic completion state, keyed by habit id
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({})
  // Local state for the sample row shown in the empty state
  const [sampleChecked, setSampleChecked] = useState(false)

  function handleComplete(habit: Habit) {
    if (habit.completed || completedIds[habit.id]) return
    setCompletedIds((prev) => ({ ...prev, [habit.id]: true }))
    completeHabit(habit.id).catch(() => {
      setCompletedIds((prev) => ({ ...prev, [habit.id]: false }))
    })
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Habits</h2>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Streak
        </span>
      </div>

      {habits.length === 0 ? (
        <div>
          <p className="mb-3 text-sm italic text-gray-400">No habits yet</p>
          <div className="flex items-center gap-3 rounded-md border border-dashed border-gray-300 px-3 py-2">
            <input
              type="checkbox"
              checked={sampleChecked}
              onChange={() => setSampleChecked(!sampleChecked)}
              className="h-4 w-4 accent-indigo-600"
            />
            <span className="flex-1 text-sm text-gray-500">Sample habit</span>
            <StreakIndicator streak={sampleChecked ? 1 : 0} />
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {habits.map((habit) => {
            const checked = habit.completed || !!completedIds[habit.id]
            const streak =
              habit.streak +
              (!habit.completed && completedIds[habit.id] ? 1 : 0)
            return (
              <li key={habit.id} className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleComplete(habit)}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span
                  className={
                    checked
                      ? "flex-1 text-sm text-gray-400 line-through"
                      : "flex-1 text-sm text-gray-800"
                  }
                >
                  {habit.title}
                </span>
                <StreakIndicator streak={streak} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
