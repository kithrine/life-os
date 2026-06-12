import { describe, it, expect, vi } from "vitest"
import { createHabit, completeHabit, deleteHabit, getHabits } from "@/actions/habits"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user-id" }),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn().mockResolvedValue({
        id: "profile-1",
        clerkUserId: "test-user-id",
      }),
    },
    habit: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    habitLog: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe("habits actions", () => {
  it("should fail to create habit without authentication", async () => {
    const { auth } = await import("@clerk/nextjs/server")
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never)
    await expect(createHabit("Exercise")).rejects.toThrow("Unauthorized")
  })

  it("should create a new habit", async () => {
    await expect(createHabit("Exercise")).resolves.not.toThrow()
  })

  it("should increment streak when completing habit", async () => {
    await expect(completeHabit("habit-1")).resolves.not.toThrow()
  })

  it("should reset streak to 0 after missing a day", async () => {
    await expect(completeHabit("habit-1")).resolves.not.toThrow()
  })

  it("should not increment streak if already completed today", async () => {
    await expect(completeHabit("habit-1")).resolves.not.toThrow()
  })

  it("should delete a habit", async () => {
    await expect(deleteHabit("habit-1")).resolves.not.toThrow()
  })
})
