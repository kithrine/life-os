"use client"

import { useState } from "react"
import { logMood } from "@/actions/mood"

type MoodPoint = {
  mood: number
  date: Date | string
}

const MOODS = [1, 2, 3, 4, 5]

function MoodTrend({ history }: { history: MoodPoint[] }) {
  // History arrives newest-first; chart reads left-to-right chronologically
  const points = [...history].reverse().slice(-14)

  if (points.length < 2) {
    return (
      <div
        role="img"
        aria-label="mood trend"
        className="flex h-16 items-center justify-center rounded-md bg-gray-50 text-xs text-gray-400"
      >
        Not enough data for a trend yet
      </div>
    )
  }

  const width = 200
  const height = 48
  const step = width / (points.length - 1)
  const coords = points
    .map((p, i) => {
      const x = i * step
      const y = height - ((p.mood - 1) / 4) * (height - 8) - 4
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      role="img"
      aria-label="mood trend"
      viewBox={`0 0 ${width} ${height}`}
      className="h-16 w-full rounded-md bg-gray-50"
      preserveAspectRatio="none"
    >
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo-500"
      />
    </svg>
  )
}

export function MoodTracker({ moodHistory = [] }: { moodHistory?: MoodPoint[] }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (selectedMood === null) return
    setSaved(true)
    logMood(selectedMood).catch(() => {})
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Mood Tracker</h2>

      <p className="mb-2 text-sm text-gray-600">How are you feeling today?</p>
      <div className="mb-4 flex gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood}
            type="button"
            aria-pressed={selectedMood === mood}
            onClick={() => {
              setSelectedMood(mood)
              setSaved(false)
            }}
            className={
              selectedMood === mood
                ? "h-10 w-10 rounded-lg bg-indigo-600 text-sm font-semibold text-white"
                : "h-10 w-10 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            }
          >
            {mood}
          </button>
        ))}
      </div>

      {selectedMood !== null && (
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save
          </button>
          {saved && <span className="text-sm font-medium text-green-600">Saved</span>}
        </div>
      )}

      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Trend
      </p>
      <MoodTrend history={moodHistory} />
    </section>
  )
}
