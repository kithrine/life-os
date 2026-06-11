import { LifeOSLogo } from "@/components/auth/lifeos-logo";
import { completeOnboarding } from "./actions";
import { OnboardingForm } from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <div className="mb-8 flex items-center gap-2">
          <LifeOSLogo size={36} />
          <span className="text-2xl font-bold tracking-tight text-gray-900">LifeOS</span>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-indigo-600">Onboarding assessment</p>
            <h1 className="text-3xl leading-tight font-extrabold text-gray-900 sm:text-4xl">
              Build your personal operating system
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Share the essentials so LifeOS can tailor your first blueprint around the parts of
              life you want to improve.
            </p>
          </div>

          <OnboardingForm action={completeOnboarding} />
        </section>
      </div>
    </main>
  );
}
