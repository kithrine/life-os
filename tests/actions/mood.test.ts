import { describe, it, expect, vi } from "vitest"
import { logMood, getMoodHistory } from "@/actions/mood"

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
    moodEntry: {
      create: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
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
})
