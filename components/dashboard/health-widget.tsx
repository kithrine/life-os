import Link from "next/link";
import { Heart } from "lucide-react";

const RING_R = 32;
const RING_C = 2 * Math.PI * RING_R;
const SCORE = 74;

export function HealthWidget() {
  const offset = RING_C * (1 - SCORE / 100);

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
          <p className="text-3xl font-extrabold text-gray-900">{SCORE}</p>
          <p className="text-sm font-semibold text-green-500">Good</p>
          <p className="text-xs text-gray-400">Health score</p>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-50 pt-3">
        {[
          { label: "Steps today", value: "7,240", sub: "/ 10,000 goal" },
          { label: "Daily mood", value: "😊", sub: "Feeling good" },
          { label: "Sleep", value: "7.2h", sub: "Avg this week" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-semibold text-gray-700">
              {value} <span className="font-normal text-gray-400">{sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
