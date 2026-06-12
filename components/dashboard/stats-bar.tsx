import { CircleCheck, DollarSign, Flame, Heart } from "lucide-react";

type StatsBarProps = {
  goalsCount: number;
  habitsCount: number;
  financeCashflow: number | null;
  financeSavingsRate: number | null;
  healthScore: number | null;
};

function healthLabel(score: number | null): string {
  if (score === null) return "";
  if (score >= 80) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs work";
}

export function StatsBar({
  goalsCount,
  habitsCount,
  financeCashflow,
  financeSavingsRate,
  healthScore,
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
      value: String(goalsCount),
      sub1: "Active",
      sub2: "",
    },
    {
      label: "Habits",
      icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      value: String(habitsCount),
      sub1: "On track",
      sub2: "",
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
      value: healthScore !== null ? String(healthScore) : "--",
      sub1: "Health score",
      sub2: healthLabel(healthScore),
      sub2Color: healthScore !== null ? "text-green-500" : "text-gray-400",
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
          {stat.sub2 && (
            <p className={`text-xs ${stat.sub2Color ?? "text-gray-400"}`}>{stat.sub2}</p>
          )}
        </div>
      ))}
    </div>
  );
}
