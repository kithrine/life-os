import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  getOrCreateUserProfileOnboardingStatus,
  isOnboardingComplete,
} from "@/lib/user-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await getOrCreateUserProfileOnboardingStatus(userId);

  if (!isOnboardingComplete(profile)) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* pt-14 clears the fixed mobile top bar rendered by Sidebar */}
      <main className="min-w-0 flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
