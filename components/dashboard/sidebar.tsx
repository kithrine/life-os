"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  BarChart2,
  Briefcase,
  ChevronRight,
  DollarSign,
  Heart,
  LayoutDashboard,
  Menu,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LifeOSLogo } from "@/components/auth/lifeos-logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Finance", href: "/finance", icon: DollarSign },
  { label: "Career", href: "/career", icon: Briefcase },
  { label: "Health", href: "/health", icon: Heart },
  { label: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { label: "Insights", href: "/insights", icon: BarChart2 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();

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
      </nav>

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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-gray-200 bg-white md:block">
        <SidebarContent />
      </aside>

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
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

    </>
  );
}
