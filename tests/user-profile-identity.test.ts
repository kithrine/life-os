import { beforeEach, describe, expect, it, vi } from "vitest";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUserProfileOnboardingStatus } from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      upsert: vi.fn(),
    },
  },
}));

const mockCurrentUser = currentUser as unknown as ReturnType<typeof vi.fn>;
const mockUpsert = prisma.userProfile.upsert as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsert.mockResolvedValue({
    id: "profile_123",
    firstName: "John",
    lastName: "Carter",
  });
});

describe("user profile identity creation", () => {
  it("saves the Clerk first name to the UserProfile when creating/loading onboarding status", async () => {
    mockCurrentUser.mockResolvedValueOnce({
      firstName: "John",
      lastName: "Carter",
      unsafeMetadata: {},
    });

    await getOrCreateUserProfileOnboardingStatus("user_123");

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          firstName: "John",
        }),
        update: expect.objectContaining({
          firstName: "John",
        }),
      })
    );
  });

  it("saves the Clerk last name to the UserProfile when creating/loading onboarding status", async () => {
    mockCurrentUser.mockResolvedValueOnce({
      firstName: "John",
      lastName: "Carter",
      unsafeMetadata: {},
    });

    await getOrCreateUserProfileOnboardingStatus("user_123");

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          lastName: "Carter",
          name: "John Carter",
        }),
        update: expect.objectContaining({
          lastName: "Carter",
          name: "John Carter",
        }),
      })
    );
  });
});
