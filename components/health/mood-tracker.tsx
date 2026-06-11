"use client"

import { useState } from "react"

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  return (
    <div>
      {[1, 2, 3, 4, 5].map((mood) => (
        <button
          key={mood}
          aria-pressed={selectedMood === mood}
          onClick={() => setSelectedMood(mood)}
        />
      ))}
      <div role="img" aria-label="mood trend" />
      {selectedMood !== null && (
        <button onClick={() => setSaved(true)}>Save</button>
      )}
      {saved && <span>Saved</span>}
    </div>
  )
}
