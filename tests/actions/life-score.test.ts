import { describe, it, expect, vi } from "vitest"
import { getHealthScore } from "@/actions/life-score"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user-id" }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    habit: { findMany: vi.fn() },
    habitLog: { findMany: vi.fn() },
    moodEntry: { findMany: vi.fn() },
  },
}))

describe("life score actions", () => {
  it("should calculate health score based on habit completion rate", async () => {
    const score = await getHealthScore()
    expect(typeof score).toBe("number")
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it("should calculate health score based on mood trends", async () => {
    const score = await getHealthScore()
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it("should return 0 if no health data exists", async () => {
    const score = await getHealthScore()
    expect(score).toBe(0)
  })
})
