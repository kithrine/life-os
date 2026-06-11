import Link from "next/link";

type HabitItem = {
  id: string;
  name: string;
  streak: number;
  icon: string;
};

const PLACEHOLDER_HABITS: HabitItem[] = [
  { id: "ph-1", name: "Morning Run", streak: 12, icon: "🏃" },
  { id: "ph-2", name: "Read 30 mins", streak: 8, icon: "📚" },
  { id: "ph-3", name: "Meditate", streak: 6, icon: "🧘" },
  { id: "ph-4", name: "Drink 8 glasses", streak: 3, icon: "💧" },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function HabitsWidget({ habits }: { habits: HabitItem[] }) {
  const items = habits.length > 0 ? habits : PLACEHOLDER_HABITS;
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Habits</h2>
        <Link href="/health" className="text-xs font-medium text-indigo-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((habit) => (
          <div key={habit.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-lg">
              {habit.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-gray-800">{habit.name}</p>
                <span className="shrink-0 text-xs text-orange-500 font-semibold">
                  🔥 {habit.streak}d
                </span>
              </div>
              <div className="mt-1.5 flex gap-1">
                {DAYS.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`h-4 w-4 rounded-full text-center text-[9px] leading-4 font-bold ${
                        i <= todayIndex
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {day}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
