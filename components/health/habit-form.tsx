"use client"

import { useState } from "react"

export function HabitForm() {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) {
      setError("Title is required")
      return
    }
    setValue("")
    setError("")
  }

  return (
    <form aria-label="habit form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {error && <span>{error}</span>}
      <button type="submit">Add</button>
    </form>
  )
}
