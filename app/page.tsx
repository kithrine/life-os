import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LifeOSLogo } from "@/components/auth/lifeos-logo";
import { LoginForm } from "@/components/auth/login-form";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />

      {/* Subtle overlay to ensure text is readable over the landscape */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Page content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-12 pb-16 min-h-screen">
        {/* Logo + tagline */}
        <div className="flex items-center gap-2 mb-1">
          <LifeOSLogo size={40} />
          <span className="text-5xl font-bold text-gray-900 tracking-tight">LifeOS</span>
        </div>
        <p className="text-sm text-gray-500 mb-8">Your life. Optimized.</p>

        {/* Hero copy */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center leading-tight mb-3 font-geist">
          One system.
          <br />
          Every part of{" "}
          <em className="not-italic text-indigo-600">your life.</em>
        </h1>
        <p className="text-base text-gray-600 text-center max-w-sm mb-10">
          Set goals, build habits, track progress, and get
          <br />
          AI-powered guidance—all in one place.
        </p>

        {/* Login card */}
        <LoginForm />
      </div>
    </main>
  );
}
