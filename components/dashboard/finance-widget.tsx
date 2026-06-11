import Link from "next/link";
import { DollarSign, TrendingUp } from "lucide-react";

type SavingsGoal = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
};

const PLACEHOLDER: SavingsGoal = {
  id: "ph",
  name: "Emergency Fund",
  currentAmount: 3800,
  targetAmount: 5000,
};

export function FinanceWidget({ savingsGoal }: { savingsGoal: SavingsGoal | null }) {
  const goal = savingsGoal ?? PLACEHOLDER;
  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);

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
          <p className="text-sm text-gray-500">{goal.name}</p>
          <span className="text-sm font-bold text-green-600">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>${goal.currentAmount.toLocaleString()}</span>
          <span>${goal.targetAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-50 pt-3">
        {[
          { label: "Monthly Income", value: "$4,200", color: "text-green-600" },
          { label: "Expenses", value: "$2,850", color: "text-red-500" },
          { label: "Net Savings", value: "+$1,350", color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className={`text-xs font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
        <TrendingUp className="h-3 w-3 text-green-500" />
        On track for savings goal
      </div>
    </div>
  );
}
