"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  BarChart2,
  Bot,
  Briefcase,
  ChevronRight,
  DollarSign,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LifeOSLogo } from "@/components/auth/lifeos-logo";
import { AiCoachDrawer } from "@/components/ai-coach/ai-coach-drawer";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Finance", href: "/finance", icon: DollarSign },
  { label: "Career", href: "/career", icon: Briefcase },
  { label: "Health", href: "/health", icon: Heart },
];

const SECONDARY_NAV_ITEMS = [
  { label: "Insights", href: "/insights", icon: BarChart2 },
];

function SidebarContent({
  onNavigate,
  onOpenAiCoach,
  aiCoachOpen,
}: {
  onNavigate?: () => void;
  onOpenAiCoach: () => void;
  aiCoachOpen: boolean;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const firstName = user?.firstName ?? "there";
  const fullName = user?.fullName ?? "Your profile";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <LifeOSLogo size={32} />
          <span className="text-xl font-bold tracking-tight text-gray-900">LifeOS</span>
        </div>
        <p className="mt-1 pl-10 text-xs text-gray-400">Your life. Optimized.</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 pt-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-pressed={aiCoachOpen}
          onClick={() => {
            onOpenAiCoach();
            onNavigate?.();
          }}
          className={cn(
            "group relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            aiCoachOpen
              ? "bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm ring-1 ring-indigo-100"
              : "bg-indigo-50/70 text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 hover:ring-1 hover:ring-indigo-100"
          )}
        >
          <span className="absolute inset-y-1 left-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 opacity-0 transition group-hover:opacity-100" />
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-indigo-100">
            <Bot className="h-4 w-4 text-indigo-600" />
          </span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AI Coach
          </span>
          <Sparkles className="ml-auto h-3.5 w-3.5 text-violet-500" />
        </button>
        {SECONDARY_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {/* Profile + motivation card */}
      <div className="px-3 pb-5">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-gray-100"
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-400">View profile</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>

        <div className="mt-3 rounded-xl bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Keep going, {firstName}! 👋
          </p>
          <p className="mt-1 text-xs text-gray-600">
            You&apos;re making great progress toward your goals.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-indigo-100">
              <div className="h-full w-4/5 rounded-full bg-indigo-500" />
            </div>
            <span className="text-xs font-medium text-gray-600">80%</span>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">This week&apos;s progress</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiCoachOpen, setAiCoachOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-gray-200 bg-white md:block">
        <SidebarContent
          aiCoachOpen={aiCoachOpen}
          onOpenAiCoach={() => setAiCoachOpen((open) => !open)}
        />
      </aside>
      <AiCoachDrawer open={aiCoachOpen} onClose={() => setAiCoachOpen(false)} />

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <LifeOSLogo size={28} />
          <span className="text-lg font-bold tracking-tight text-gray-900">LifeOS</span>
        </div>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              aiCoachOpen={aiCoachOpen}
              onNavigate={() => setMobileOpen(false)}
              onOpenAiCoach={() => setAiCoachOpen((open) => !open)}
            />
          </aside>
        </div>
      )}

    </>
  );
}
