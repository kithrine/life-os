import Link from "next/link";
import { Target } from "lucide-react";

type GoalItem = {
  id: string;
  title: string;
  progress: number;
  category: string;
};

const CATEGORY_BAR: Record<string, string> = {
  finance: "bg-green-500",
  health: "bg-sky-500",
  career: "bg-indigo-500",
  personal: "bg-purple-500",
  growth: "bg-amber-500",
};

const CATEGORY_ICON: Record<string, string> = {
  finance: "bg-green-50 text-green-600",
  health: "bg-sky-50 text-sky-600",
  career: "bg-indigo-50 text-indigo-600",
  personal: "bg-purple-50 text-purple-600",
  growth: "bg-amber-50 text-amber-600",
};

export function GoalsWidget({ goals }: { goals: GoalItem[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Goals</h2>
        <Link href="/goals" className="text-xs font-medium text-indigo-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-5">
        {goals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            No goals yet. Create a goal to start tracking milestones.
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  CATEGORY_ICON[goal.category] ?? "bg-gray-50 text-gray-600"
                }`}
              >
                <Target className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-800">{goal.title}</p>
                  <span className="shrink-0 text-xs font-semibold text-gray-500">
                    {goal.progress}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      CATEGORY_BAR[goal.category] ?? "bg-indigo-500"
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
