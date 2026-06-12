import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");

  const [clerkUser, profile] = await Promise.all([
    currentUser(),
    prisma.userProfile.findUnique({
      where: { clerkUserId },
      include: {
        _count: {
          select: {
            goals: true,
            habits: true,
            skills: true,
            jobApplications: true,
          },
        },
      },
    }),
  ]);

  if (!profile) redirect("/onboarding");

  return (
    <ProfileView
      clerkUser={{
        firstName: clerkUser?.firstName ?? null,
        lastName: clerkUser?.lastName ?? null,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser?.imageUrl ?? null,
      }}
      profile={{
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: profile.name,
        lifeStage: profile.lifeStage,
        currentSituation: profile.currentSituation,
        biggestChallenge: profile.biggestChallenge,
        careerGoals: profile.careerGoals,
        financialGoals: profile.financialGoals,
        healthGoals: profile.healthGoals,
        personalGrowthGoals: profile.personalGrowthGoals,
        futureVision: profile.futureVision,
        createdAt: profile.createdAt.toISOString(),
      }}
      counts={profile._count}
    />
  );
}
