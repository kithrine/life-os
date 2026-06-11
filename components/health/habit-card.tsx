"use client"

import { useState } from "react"

export function HabitCard() {
  const [checked, setChecked] = useState(false)
  const streak = checked ? 1 : 0

  return (
    <div>
      <p>No habits</p>
      <div>
        <span>Streak</span>
        <span aria-label="streak">{streak}</span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
    </div>
  )
}
