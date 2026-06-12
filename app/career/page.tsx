import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isOnboardingComplete } from "@/lib/user-profile";
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
  if (!isOnboardingComplete(profile)) redirect("/onboarding");

  const skills = profile.skills ?? [];
  const applications = profile.jobApplications ?? [];

  // Stats derived from DB records (no hardcoded values)
  const totalApps = applications.length;
  const interviewing = applications.filter((a) => a.status === "interviewing").length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const skillsCount = skills.length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Page header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Career</h1>
              <p className="mt-0.5 line-clamp-1 text-sm text-indigo-200">
                {profile.careerGoals ?? "Track your skills and job applications"}
              </p>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 right-16 h-20 w-20 rounded-full bg-white/5" />
        </div>

        {/* Stats bar — all values derived from DB records */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Applications", value: totalApps },
            { label: "Interviewing", value: interviewing },
            { label: "Offers", value: offers },
            { label: "Skills", value: skillsCount },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-200"
            >
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <SkillsSection initialSkills={skills} />
        <JobApplicationsSection initialApplications={applications} />
      </div>
    </div>
  );
}
