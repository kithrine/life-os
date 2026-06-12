import Link from "next/link";
import { Heart } from "lucide-react";

const RING_R = 32;
const RING_C = 2 * Math.PI * RING_R;

const MOOD_EMOJI: Record<number, string> = {
  1: "😔",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😄",
};

function healthLabel(score: number | null): string {
  if (score === null) return "";
  if (score >= 80) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs work";
}

type HealthWidgetProps = {
  healthScore: number | null;
  moodToday: number | null;
  habitsToday: { completed: number; total: number };
};

export function HealthWidget({ healthScore, moodToday, habitsToday }: HealthWidgetProps) {
  const score = healthScore ?? 0;
  const offset = RING_C * (1 - score / 100);
  const label = healthLabel(healthScore);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Heart className="h-4 w-4 text-rose-500" />
          </span>
          <h2 className="text-base font-bold text-gray-900">Health</h2>
        </div>
        <Link href="/health" className="text-xs font-medium text-indigo-600 hover:underline">
          View details
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
          <defs>
            <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r={RING_R} stroke="#fee2e2" strokeWidth="7" fill="none" />
          <circle
            cx="40"
            cy="40"
            r={RING_R}
            stroke="url(#health-gradient)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div>
          <p className="text-3xl font-extrabold text-gray-900">
            {healthScore !== null ? healthScore : "--"}
          </p>
          {label && <p className="text-sm font-semibold text-green-500">{label}</p>}
          <p className="text-xs text-gray-400">Health score</p>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-50 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Daily mood</span>
          <span className="text-xs font-semibold text-gray-700">
            {moodToday !== null ? MOOD_EMOJI[moodToday] ?? "😐" : "--"}
            {moodToday !== null && (
              <span className="font-normal text-gray-400 ml-1">
                {moodToday >= 4 ? "Feeling good" : moodToday >= 3 ? "Okay" : "Rough day"}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Habits today</span>
          <span className="text-xs font-semibold text-gray-700">
            {habitsToday.completed}/{habitsToday.total}
            <span className="font-normal text-gray-400 ml-1">completed</span>
          </span>
        </div>
      </div>
    </div>
  );
}
