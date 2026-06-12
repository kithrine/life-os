import { describe, it, expect, vi, beforeEach } from "vitest"
import { createHabit, completeHabit } from "@/actions/habits"
import { getHealthScore } from "@/actions/life-score"

// Mock fns are hoisted so they can be asserted on without importing
// @/lib/prisma (currently not a module while it is commented out)
const mocks = vi.hoisted(() => ({
  userProfileFindUnique: vi.fn(),
  habitCreate: vi.fn(),
  habitFindMany: vi.fn(),
  habitUpdate: vi.fn(),
  habitDelete: vi.fn(),
  habitLogFindFirst: vi.fn(),
  habitLogCreate: vi.fn(),
  habitLogFindMany: vi.fn(),
  moodEntryFindMany: vi.fn(),
  moodEntryUpsert: vi.fn(),
}))

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user-id" }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: mocks.userProfileFindUnique,
    },
    habit: {
      create: mocks.habitCreate,
      findMany: mocks.habitFindMany,
      update: mocks.habitUpdate,
      delete: mocks.habitDelete,
    },
    habitLog: {
      findFirst: mocks.habitLogFindFirst,
      create: mocks.habitLogCreate,
      findMany: mocks.habitLogFindMany,
    },
    moodEntry: {
      findMany: mocks.moodEntryFindMany,
      upsert: mocks.moodEntryUpsert,
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()

  mocks.userProfileFindUnique.mockResolvedValue({
    id: "profile-1",
    clerkUserId: "test-user-id",
  })
  mocks.habitCreate.mockResolvedValue({
    id: "habit-1",
    userId: "test-user-id",
    title: "Exercise",
    streak: 0,
    lastCompleted: null,
  })
  mocks.habitFindMany.mockResolvedValue([
    {
      id: "habit-1",
      userId: "test-user-id",
      title: "Exercise",
      streak: 1,
      lastCompleted: new Date(),
    },
  ])
  mocks.habitUpdate.mockResolvedValue({
    id: "habit-1",
    streak: 1,
    lastCompleted: new Date(),
  })
  mocks.habitLogFindFirst.mockResolvedValue(null)
  mocks.habitLogCreate.mockResolvedValue({
    id: "log-1",
    habitId: "habit-1",
    completed: true,
  })
  mocks.habitLogFindMany.mockResolvedValue([
    { id: "log-1", habitId: "habit-1", completed: true },
  ])
  mocks.moodEntryFindMany.mockResolvedValue([])
})

describe("health flow integration", () => {
  it("should complete full habit creation -> tracking -> streak flow", async () => {
    await expect(createHabit("Exercise")).resolves.not.toThrow()
    await expect(completeHabit("habit-1")).resolves.not.toThrow()

    expect(mocks.habitCreate).toHaveBeenCalledWith({
      data: { userId: "profile-1", title: "Exercise" },
    })
    expect(mocks.habitUpdate).toHaveBeenCalledWith({
      where: { id: "habit-1" },
      data: { streak: { increment: 1 }, lastCompleted: expect.any(Date) },
    })
    expect(mocks.habitLogCreate).toHaveBeenCalledWith({
      data: { habitId: "habit-1", completed: true },
    })
  })

  it("should update life score when habits are completed", async () => {
    await completeHabit("habit-1")
    const score = await getHealthScore()

    expect(typeof score).toBe("number")
    expect(score).toBeGreaterThan(0)
  })
})
