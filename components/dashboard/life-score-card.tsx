import { TrendingUp, Info } from "lucide-react";

const SCORE = 82;
const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function LifeScoreCard() {
  const ringOffset = RING_CIRCUMFERENCE * (1 - SCORE / 100);

  return (
    <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </span>
          <span className="text-sm font-semibold text-gray-900">Life Score</span>
        </div>
        <Info className="h-4 w-4 text-gray-300" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <p className="flex items-end gap-1">
            <span className="text-5xl font-extrabold text-gray-900">{SCORE}</span>
            <span className="pb-1.5 text-sm font-medium text-gray-400">/100</span>
          </p>
          <p className="mt-0.5 text-lg font-semibold text-green-500">Great</p>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className="h-3 w-3 text-green-500" />6 points from last week
          </p>
        </div>

        {/* Progress ring */}
        <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden>
          <defs>
            <linearGradient id="life-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <circle cx="52" cy="52" r={RING_RADIUS} stroke="#eef2ff" strokeWidth="9" fill="none" />
          <circle
            cx="52"
            cy="52"
            r={RING_RADIUS}
            stroke="url(#life-score-gradient)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            transform="rotate(-90 52 52)"
          />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl bg-indigo-50/70 p-3">
        <p className="flex-1 text-xs leading-5 text-gray-600">
          You&apos;re building momentum! Keep focusing on your priorities and stay
          consistent.
        </p>
        <span className="text-2xl" aria-hidden>
          🏔️
        </span>
      </div>
    </div>
  );
}
