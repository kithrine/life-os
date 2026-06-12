import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getHealthDashboard } from "@/actions/health";
import { HealthDashboard } from "@/components/health/health-dashboard";

export default async function HealthPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const data = await getHealthDashboard();

  return <HealthDashboard data={data} />;
}
