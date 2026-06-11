import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HabitForm } from "@/components/health/habit-form"

describe("HabitForm", () => {
  it("should render habit creation form", () => {
    render(<HabitForm />)
    expect(screen.getByRole("form")).toBeInTheDocument()
  })

  it("should validate empty habit title", () => {
    render(<HabitForm />)
    const submit = screen.getByRole("button", { name: /add/i })
    fireEvent.click(submit)
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })

  it("should submit valid habit", () => {
    render(<HabitForm />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Exercise" } })
    const submit = screen.getByRole("button", { name: /add/i })
    fireEvent.click(submit)
    expect(input).toHaveValue("")
  })
})
