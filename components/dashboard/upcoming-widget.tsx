import Link from "next/link";
import { Briefcase, Target, Activity, DollarSign, Calendar, type LucideIcon } from "lucide-react";

type EventItem = { id: number; title: string; date: string; time: string; icon: LucideIcon };

const EVENTS: EventItem[] = [
  { id: 1, title: "Job Interview — Vercel", date: "Tomorrow", time: "10:00 AM", icon: Briefcase },
  { id: 2, title: "Goal Review Session",    date: "Wed",      time: "6:00 PM",  icon: Target    },
  { id: 3, title: "5K Run",                 date: "Sat",      time: "7:30 AM",  icon: Activity  },
  { id: 4, title: "Monthly Budget Review",  date: "Jun 15",   time: "8:00 PM",  icon: DollarSign },
];

export function UpcomingWidget() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
            <Calendar className="h-4 w-4 text-purple-600" />
          </span>
          <h2 className="text-base font-bold text-gray-900">Upcoming</h2>
        </div>
        <Link href="/dashboard" className="text-xs font-medium text-indigo-600 hover:underline">
          View calendar
        </Link>
      </div>

      <div className="space-y-3">
        {EVENTS.map((event) => (
          <div key={event.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <event.icon className="h-5 w-5 text-gray-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{event.title}</p>
              <p className="text-xs text-gray-400">
                {event.date} · {event.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
