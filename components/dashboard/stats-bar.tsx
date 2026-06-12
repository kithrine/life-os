import { CircleCheck, DollarSign, Flame, Heart } from "lucide-react";

type StatsBarProps = {
  goalsCount: number;
  habitsCount: number;
  financeCashflow: number | null;
  financeSavingsRate: number | null;
};

export function StatsBar({
  goalsCount,
  habitsCount,
  financeCashflow,
  financeSavingsRate,
}: StatsBarProps) {
  const financeValue =
    financeCashflow !== null
      ? `${financeCashflow >= 0 ? "+" : "-"}$${Math.abs(financeCashflow).toLocaleString("en-US")}`
      : "$0";

  const stats = [
    {
      label: "Goals",
      icon: CircleCheck,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      value: String(goalsCount || 6),
      sub1: "Active",
      sub2: "2 due soon",
    },
    {
      label: "Habits",
      icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      value: String(habitsCount || 4),
      sub1: "On track",
      sub2: "2 perfect weeks",
    },
    {
      label: "Finance",
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      value: financeValue,
      sub1: financeCashflow !== null ? "Monthly cashflow" : "No finance data",
      sub2:
        financeSavingsRate !== null
          ? `${financeSavingsRate}% savings rate`
          : "Add income and expenses",
    },
    {
      label: "Health",
      icon: Heart,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      value: "74",
      sub1: "Health score",
      sub2: "Good",
      sub2Color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 divide-gray-100 rounded-2xl bg-white shadow-lg sm:grid-cols-4 sm:divide-x">
      {stats.map((stat) => (
        <div key={stat.label} className="p-5">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.iconBg}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </span>
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">{stat.value}</p>
          <p className="mt-0.5 text-sm text-gray-600">{stat.sub1}</p>
          <p className={`text-xs ${stat.sub2Color ?? "text-gray-400"}`}>{stat.sub2}</p>
        </div>
      ))}
    </div>
  );
}
