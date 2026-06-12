import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { prisma } from "@/lib/prisma";
import { isOnboardingComplete, onboardingStatusSelect } from "@/lib/user-profile";

export default async function CareerLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: onboardingStatusSelect,
  });
  if (!isOnboardingComplete(profile)) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="min-w-0 flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
