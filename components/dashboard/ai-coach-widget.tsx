import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AiCoachWidget() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="text-base font-bold">AI Coach</h2>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-indigo-100">
        You&apos;re on a 12-day streak with your morning routine. Your consistency
        is building real momentum — keep showing up!
      </p>

      <div className="mt-4 rounded-xl bg-white/15 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
          Focus for today
        </p>
        <p className="mt-1 text-sm font-semibold">
          Review your top career goal and take one small action.
        </p>
      </div>

      <Link
        href="/ai-coach"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask AI Coach
      </Link>
    </div>
  );
}
