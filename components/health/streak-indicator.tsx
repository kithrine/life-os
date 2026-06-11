"use client"

import { Flame } from "lucide-react"

export function StreakIndicator({ streak = 0 }: { streak?: number }) {
  const active = streak > 0

  return (
    <span
      aria-label="streak"
      className={
        active
          ? "inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-sm font-medium text-orange-700"
          : "inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-400"
      }
    >
      {active && <Flame className="h-4 w-4 text-orange-500" />}
      <span>{streak}</span>
    </span>
  )
}
