"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { createHabit } from "@/actions/habits"

export function HabitForm() {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const title = value.trim()
    if (!title) {
      setError("Title is required")
      return
    }
    setValue("")
    setError("")
    createHabit(title).catch(() => {})
  }

  return (
    <form
      aria-label="habit form"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <label
        htmlFor="habit-title"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        New habit
      </label>
      <div className="flex gap-2">
        <input
          id="habit-title"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Drink water"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </form>
  )
}
