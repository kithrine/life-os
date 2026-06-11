import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MoodTracker } from "@/components/health/mood-tracker"

describe("MoodTracker", () => {
  it("should render mood selector (1-5 buttons)", () => {
    render(<MoodTracker />)
    expect(screen.getAllByRole("button")).toHaveLength(5)
  })

  it("should highlight selected mood", () => {
    render(<MoodTracker />)
    const buttons = screen.getAllByRole("button")
    fireEvent.click(buttons[2])
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true")
  })

  it("should show mood trend chart", () => {
    render(<MoodTracker />)
    expect(screen.getByRole("img", { name: /mood trend/i })).toBeInTheDocument()
  })

  it("should submit mood entry", () => {
    render(<MoodTracker />)
    const buttons = screen.getAllByRole("button")
    fireEvent.click(buttons[0])
    const submit = screen.getByRole("button", { name: /save/i })
    fireEvent.click(submit)
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })
})
