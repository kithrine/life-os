import Link from "next/link";
import { DollarSign, TrendingUp } from "lucide-react";

type SavingsGoal = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
};

type FinanceSummary = {
  monthlyIncome: number;
  monthlySpending: number;
  cashflow: number;
  savingsRate: number | null;
  netWorth: number | null;
  hasData: boolean;
};

export function FinanceWidget({
  savingsGoal,
  summary,
}: {
  savingsGoal: SavingsGoal | null;
  summary: FinanceSummary;
}) {
  const pct = savingsGoal
    ? Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100)
    : 0;

  const cashflowLabel = `${summary.cashflow >= 0 ? "+" : "-"}$${Math.abs(
    summary.cashflow
  ).toLocaleString("en-US")}`;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50">
            <DollarSign className="h-4 w-4 text-green-600" />
          </span>
          <h2 className="text-base font-bold text-gray-900">Finance</h2>
        </div>
        <Link href="/finance" className="text-xs font-medium text-indigo-600 hover:underline">
          View details
        </Link>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-gray-500">
            {savingsGoal ? savingsGoal.name : "No savings goal yet"}
          </p>
          <span className="text-sm font-bold text-green-600">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>${(savingsGoal?.currentAmount ?? 0).toLocaleString()}</span>
          <span>${(savingsGoal?.targetAmount ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-50 pt-3">
        {[
          {
            label: "Monthly Income",
            value: `$${summary.monthlyIncome.toLocaleString("en-US")}`,
            color: "text-green-600",
          },
          {
            label: "Expenses",
            value: `$${summary.monthlySpending.toLocaleString("en-US")}`,
            color: "text-red-500",
          },
          {
            label: "Cashflow",
            value: cashflowLabel,
            color: summary.cashflow >= 0 ? "text-green-600" : "text-red-500",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-xs font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
        <TrendingUp className="h-3 w-3 text-green-500" />
        {summary.hasData
          ? summary.savingsRate !== null
            ? `${summary.savingsRate}% savings rate`
            : "Add income to calculate savings rate"
          : "Add finance records to activate this widget"}
      </div>
    </div>
  );
}
