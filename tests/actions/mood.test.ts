import { describe, it, expect, vi } from "vitest"
import { logMood, getMoodHistory, deleteMoodEntry } from "@/actions/mood"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user-id" }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn().mockResolvedValue({
        id: "profile-1",
        clerkUserId: "test-user-id",
      }),
    },
    moodEntry: {
      create: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue({ id: "mood-1", userId: "profile-1" }),
      delete: vi.fn(),
    },
  },
}))

describe("mood actions", () => {
  it("should fail to log mood without authentication", async () => {
    const { auth } = await import("@clerk/nextjs/server")
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never)
    await expect(logMood(3)).rejects.toThrow("Unauthorized")
  })

  it("should log mood entry (1-5 scale)", async () => {
    await expect(logMood(4)).resolves.not.toThrow()
  })

  it("should reject invalid mood values (<1 or >5)", async () => {
    await expect(logMood(0)).rejects.toThrow()
    await expect(logMood(6)).rejects.toThrow()
  })

  it("should update mood if already logged for today", async () => {
    await expect(logMood(3)).resolves.not.toThrow()
  })

  it("should fetch mood history", async () => {
    await expect(getMoodHistory()).resolves.toBeDefined()
  })

  it("should delete an owned mood entry", async () => {
    await expect(deleteMoodEntry("mood-1")).resolves.not.toThrow()
  })

  it("should reject deleting a mood entry that is not found", async () => {
    const { prisma } = await import("@/lib/prisma")
    vi.mocked(prisma.moodEntry.findFirst).mockResolvedValueOnce(null)
    await expect(deleteMoodEntry("mood-x")).rejects.toThrow("Mood entry not found")
  })
})
