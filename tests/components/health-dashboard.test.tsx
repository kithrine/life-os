import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HealthDashboard } from "@/components/health/health-dashboard"
import type { HealthDashboardData } from "@/components/health/types"
import { completeHabit, createHabit } from "@/actions/habits"
import { logMood } from "@/actions/mood"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock("@/actions/habits", () => ({
  createHabit: vi.fn().mockResolvedValue(undefined),
  completeHabit: vi.fn().mockResolvedValue(undefined),
  deleteHabit: vi.fn().mockResolvedValue(undefined),
  updateHabit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/actions/mood", () => ({
  logMood: vi.fn().mockResolvedValue(undefined),
  deleteMoodEntry: vi.fn().mockResolvedValue(undefined),
}))

const WEEK_LABELS = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]

function makeData(overrides: Partial<HealthDashboardData> = {}): HealthDashboardData {
  return {
    todayLabel: "Thursday, June 12",
    metrics: {
      healthScore: { value: 0, series: [] },
      todayCompletion: { percent: null, completed: 0, total: 0, series: [] },
      bestStreak: { value: 0, habitTitle: null, series: [] },
      mood: { average: null, latest: null, series: [] },
    },
    weeklyActivity: WEEK_LABELS.map((label) => ({ label, completed: 0, total: 0 })),
    habits: [],
    recentMoods: [],
    insight: {
      label: "Getting started",
      message: "No health data yet.",
      tone: "neutral",
    },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("HealthDashboard", () => {
  it("should render structural empty states when no data exists", () => {
    render(<HealthDashboard data={makeData()} />)
    expect(screen.getByText(/no habits yet\. add a habit/i)).toBeInTheDocument()
    expect(screen.getByText(/no mood entries yet\. log today's mood to populate/i)).toBeInTheDocument()
    expect(screen.getByText(/no streaks yet/i)).toBeInTheDocument()
    expect(screen.getByText(/no habit check-ins in the last 7 days/i)).toBeInTheDocument()
  })

  it("should display habit rows with streak counts", () => {
    render(
      <HealthDashboard
        data={makeData({
          habits: [
            {
              id: "habit-1",
              title: "Exercise",
              streak: 4,
              lastCompleted: new Date().toISOString(),
              completedToday: false,
              weekLog: [false, true, true, true, true, false, false],
            },
          ],
          metrics: {
            ...makeData().metrics,
            bestStreak: { value: 4, habitTitle: "Exercise", series: [] },
          },
        })}
      />
    )
    expect(screen.getAllByText("Exercise").length).toBeGreaterThan(0)
    expect(screen.getAllByText("4").length).toBeGreaterThan(0)
  })

  it("should complete a habit when the check button is clicked", () => {
    render(
      <HealthDashboard
        data={makeData({
          habits: [
            {
              id: "habit-1",
              title: "Exercise",
              streak: 0,
              lastCompleted: null,
              completedToday: false,
              weekLog: [false, false, false, false, false, false, false],
            },
          ],
        })}
      />
    )
    fireEvent.click(screen.getByTitle(/mark complete for today/i))
    expect(completeHabit).toHaveBeenCalledWith("habit-1")
  })

  it("should create a habit from the quick add form", () => {
    render(<HealthDashboard data={makeData()} />)
    fireEvent.change(screen.getByPlaceholderText(/drink water/i), {
      target: { value: "Meditate" },
    })
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }))
    expect(createHabit).toHaveBeenCalledWith("Meditate")
  })

  it("should log a mood from the quick add form", () => {
    render(<HealthDashboard data={makeData()} />)
    fireEvent.click(screen.getByRole("button", { name: "Mood" }))
    fireEvent.click(screen.getByTitle("Great"))
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }))
    expect(logMood).toHaveBeenCalledWith(5, undefined)
  })

  it("should show the mood trend chart when entries exist", () => {
    render(
      <HealthDashboard
        data={makeData({
          metrics: {
            ...makeData().metrics,
            mood: { average: 3.5, latest: 4, series: [3, 4] },
          },
        })}
      />
    )
    expect(screen.getByRole("img", { name: /mood trend/i })).toBeInTheDocument()
  })

  it("should render recent mood entries with notes", () => {
    render(
      <HealthDashboard
        data={makeData({
          recentMoods: [
            { id: "mood-1", date: new Date().toISOString(), mood: 4, note: "Slept well" },
          ],
        })}
      />
    )
    expect(screen.getByText(/slept well/i)).toBeInTheDocument()
    expect(screen.getByText(/4 \/ 5/)).toBeInTheDocument()
  })
})
