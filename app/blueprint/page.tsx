import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LifeOSLogo } from "@/components/auth/lifeos-logo";

export default function BlueprintPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-4 flex items-center justify-center gap-2">
          <LifeOSLogo size={36} />
          <span className="text-xl font-bold tracking-tight text-gray-900">LifeOS</span>
        </div>

        <div className="mb-3 flex items-center justify-center gap-2 text-indigo-600">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">Life Blueprint</span>
        </div>

        <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
          Your blueprint is on its way
        </h1>
        <p className="mb-8 text-sm text-gray-600">
          AI blueprint generation is coming soon. In the meantime, head to your
          dashboard to start tracking goals, habits, finances, and your career.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
