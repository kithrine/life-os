import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFinanceDashboard } from "@/actions/finance";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

type FinancePageProps = {
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const month = Array.isArray(params?.month) ? params?.month[0] : params?.month;
  const data = await getFinanceDashboard(month);

  return <FinanceDashboard data={data} />;
}
