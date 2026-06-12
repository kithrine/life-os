import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/profile", () => ({
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

import { ProfileView } from "@/components/profile/profile-view";

const mockClerkUser = {
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex@example.com",
  imageUrl: null,
};

const mockProfile: {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  lifeStage: string | null;
  currentSituation: string | null;
  biggestChallenge: string | null;
  careerGoals: string | null;
  financialGoals: string | null;
  healthGoals: string | null;
  personalGrowthGoals: string | null;
  futureVision: string | null;
  createdAt: string;
} = {
  firstName: "Alex",
  lastName: "Johnson",
  name: "Alex Johnson",
  lifeStage: "student",
  currentSituation: "Finishing a CS degree",
  biggestChallenge: "Balancing coursework",
  careerGoals: "Land a frontend role",
  financialGoals: "Save $10,000",
  healthGoals: "Run a half marathon",
  personalGrowthGoals: "Read 24 books",
  futureVision: "Senior engineer",
  createdAt: "2025-01-01T00:00:00.000Z",
};

const mockCounts = {
  goals: 3,
  habits: 4,
  skills: 2,
  jobApplications: 5,
};

function setup(profileOverrides?: Partial<typeof mockProfile>) {
  return render(
    <ProfileView
      clerkUser={mockClerkUser}
      profile={{ ...mockProfile, ...profileOverrides }}
      counts={mockCounts}
    />
  );
}

describe("ProfileView — view mode", () => {
  it("renders the user display name", () => {
    setup();
    expect(screen.getByText("Alex Johnson")).toBeTruthy();
  });

  it("renders saved profile first and last name when Clerk names are missing", () => {
    render(
      <ProfileView
        clerkUser={{ ...mockClerkUser, firstName: null, lastName: null }}
        profile={{ ...mockProfile, name: null, firstName: "Taylor", lastName: "Morgan" }}
        counts={mockCounts}
      />
    );

    expect(screen.getByText("Taylor Morgan")).toBeTruthy();
  });

  it("renders the user email", () => {
    setup();
    expect(screen.getByText("alex@example.com")).toBeTruthy();
  });

  it("renders the life stage badge", () => {
    setup();
    expect(screen.getByText("student")).toBeTruthy();
  });

  it("renders the member since date", () => {
    setup();
    expect(screen.getByText(/January 2025/)).toBeTruthy();
  });

  it("renders goals count in stats bar", () => {
    setup();
    expect(screen.getByText("Goals")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders habits count in stats bar", () => {
    setup();
    expect(screen.getByText("Habits")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("renders skills count in stats bar", () => {
    setup();
    expect(screen.getByText("Skills")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders applications count in stats bar", () => {
    setup();
    expect(screen.getByText("Applications")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders My Story fields", () => {
    setup();
    expect(screen.getByText("Finishing a CS degree")).toBeTruthy();
    expect(screen.getByText("Balancing coursework")).toBeTruthy();
    expect(screen.getByText("Senior engineer")).toBeTruthy();
  });

  it("shows 'Not set' for null fields", () => {
    setup({ currentSituation: null });
    expect(screen.getByText("Not set")).toBeTruthy();
  });

  it("renders My Goals fields", () => {
    setup();
    expect(screen.getByText("Land a frontend role")).toBeTruthy();
    expect(screen.getByText("Save $10,000")).toBeTruthy();
    expect(screen.getByText("Run a half marathon")).toBeTruthy();
    expect(screen.getByText("Read 24 books")).toBeTruthy();
  });
});

describe("ProfileView — edit mode", () => {
  it("Edit Profile button switches to edit mode", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByRole("button", { name: /save changes/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeTruthy();
  });

  it("Cancel button exits edit mode and restores view", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeTruthy();
  });

  it("edit form name input is pre-filled with current name", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByDisplayValue("Alex Johnson")).toBeTruthy();
  });

  it("edit form career goals textarea is pre-filled", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByDisplayValue("Land a frontend role")).toBeTruthy();
  });
});
