import Image from "next/image";
import { SignUp } from "@clerk/nextjs";
import { LifeOSLogo } from "@/components/auth/lifeos-logo";

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Image
        src="/images/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-white/10" />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-12 pb-16">
        <div className="mb-1 flex items-center gap-2">
          <LifeOSLogo size={40} />
          <span className="text-2xl font-bold tracking-tight text-gray-900">LifeOS</span>
        </div>
        <p className="mb-8 text-sm text-gray-500">Your life. Optimized.</p>

        <h1
          aria-label="Create your LifeOS account"
          className="mb-3 text-center text-4xl leading-tight font-extrabold text-gray-900 sm:text-5xl"
        >
          Create your
          <br />
          <em className="not-italic text-indigo-600">LifeOS account.</em>
        </h1>
        <p className="mb-10 max-w-sm text-center text-base text-gray-600">
          Start with a short assessment so LifeOS can shape your personal system.
        </p>

        <SignUp
          routing="path"
          path="/sign-up"
          forceRedirectUrl="/onboarding"
          fallbackRedirectUrl="/onboarding"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              cardBox: "w-full rounded-2xl shadow-xl",
              card: "rounded-2xl",
            },
          }}
        />
      </div>
    </main>
  );
}
