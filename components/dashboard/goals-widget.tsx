import Link from "next/link";

type GoalItem = {
  id: string;
  title: string;
  progress: number;
  category: string;
};

const PLACEHOLDER_GOALS: GoalItem[] = [
  { id: "ph-1", title: "Save $10,000", progress: 62, category: "finance" },
  { id: "ph-2", title: "Run a Half Marathon", progress: 75, category: "health" },
  { id: "ph-3", title: "Read 24 Books", progress: 58, category: "personal" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  finance: "🐷",
  health: "👟",
  career: "💼",
  personal: "📚",
};

const CATEGORY_BAR: Record<string, string> = {
  finance: "bg-green-500",
  health: "bg-blue-500",
  career: "bg-indigo-500",
  personal: "bg-purple-500",
};

export function GoalsWidget({ goals }: { goals: GoalItem[] }) {
  const items = goals.length > 0 ? goals : PLACEHOLDER_GOALS;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Goals</h2>
        <Link href="/goals" className="text-xs font-medium text-indigo-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-5">
        {items.map((goal) => (
          <div key={goal.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-lg">
              {CATEGORY_EMOJI[goal.category] ?? "🎯"}
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
                  className={`h-full rounded-full ${CATEGORY_BAR[goal.category] ?? "bg-indigo-500"}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
