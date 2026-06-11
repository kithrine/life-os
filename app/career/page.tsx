import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SkillsSection } from "@/components/career/skills-section";
import { JobApplicationsSection } from "@/components/career/job-applications-section";

export default async function CareerPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId },
    include: {
      skills: { orderBy: { createdAt: "desc" } },
      jobApplications: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!profile) redirect("/onboarding");

  const skills = profile.skills ?? [];
  const applications = profile.jobApplications ?? [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">Career</h1>
      <SkillsSection initialSkills={skills} />
      <JobApplicationsSection initialApplications={applications} />
    </main>
  );
}
