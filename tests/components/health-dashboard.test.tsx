import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HabitCard } from "@/components/health/habit-card"

describe("HealthDashboard", () => {
  it("should render empty state when no habits exist", () => {
    render(<HabitCard />)
    expect(screen.getByText(/no habits/i)).toBeInTheDocument()
  })

  it("should display habit list with streak counts", () => {
    render(<HabitCard />)
    expect(screen.getByText(/streak/i)).toBeInTheDocument()
  })

  it("should show streak flame icon for active streaks", () => {
    render(<HabitCard />)
    expect(screen.getByLabelText(/streak/i)).toBeInTheDocument()
  })

  it("should complete habit when checkbox clicked", () => {
    render(<HabitCard />)
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it("should update streak display after completion", () => {
    render(<HabitCard />)
    const checkbox = screen.getByRole("checkbox")
    fireEvent.click(checkbox)
    expect(screen.getByText(/1/)).toBeInTheDocument()
  })
})
