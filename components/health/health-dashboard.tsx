"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  Flame,
  HeartPulse,
  ListChecks,
  Pencil,
  Plus,
  Smile,
  Sparkles,
  Trash2,
} from "lucide-react";
import { completeHabit, createHabit, deleteHabit, updateHabit } from "@/actions/habits";
import { deleteMoodEntry, logMood } from "@/actions/mood";
import { cn } from "@/lib/utils";
import type { HealthDashboardData, HealthHabit } from "./types";

type ActiveForm = "habit" | "mood";

const MOOD_OPTIONS = [
  { value: 1, label: "Rough" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

const MOOD_COLORS: Record<number, string> = {
  1: "bg-rose-50 text-rose-600",
  2: "bg-amber-50 text-amber-600",
  3: "bg-gray-100 text-gray-600",
  4: "bg-sky-50 text-sky-600",
  5: "bg-green-50 text-green-600",
};

function moodLabel(mood: number) {
  return MOOD_OPTIONS.find((option) => option.value === mood)?.label ?? `${mood}`;
}

function Sparkline({
  values,
  color = "#4f46e5",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length === 0) {
    return (
      <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
        <path d="M4 30 C24 20 40 36 58 26 S88 20 108 28" fill="none" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 5" />
      </svg>
    );
  }

  if (values.length === 1) {
    return (
      <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
        <line x1="10" y1="24" x2="102" y2="24" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
        <circle cx="56" cy="24" r="4" fill={color} />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = 6 + (index / (values.length - 1)) * 100;
    const y = 34 - ((value - min) / range) * 26;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 112 42" className="h-11 w-28" aria-hidden="true">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`6,36 106,36`} fill="none" stroke="#f3f4f6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
  iconBg,
  lineColor,
  series,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof HeartPulse;
  iconClass: string;
  iconBg: string;
  lineColor: string;
  series: number[];
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("h-4 w-4", iconClass)} />
            </span>
            <p className="text-sm font-medium text-gray-500">{label}</p>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </div>
        <Sparkline values={series} color={lineColor} />
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
      {text}
    </div>
  );
}

function WeeklyActivityChart({
  days,
}: {
  days: HealthDashboardData["weeklyActivity"];
}) {
  const maxCompleted = Math.max(...days.map((day) => day.completed), 1);
  const hasData = days.some((day) => day.completed > 0);

  return (
    <div>
      <div className="flex h-36 items-end justify-between gap-2">
        {days.map((day) => {
          const height = hasData ? Math.round((day.completed / maxCompleted) * 100) : 0;
          return (
            <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-gray-700">
                {day.completed > 0 ? day.completed : ""}
              </span>
              <div className="flex h-full w-full max-w-10 items-end overflow-hidden rounded-lg bg-gray-50">
                <div
                  className={cn(
                    "w-full rounded-lg transition-all",
                    day.completed > 0 ? "bg-indigo-500" : "bg-gray-100"
                  )}
                  style={{ height: `${Math.max(height, day.completed > 0 ? 12 : 4)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-400">{day.label}</span>
            </div>
          );
        })}
      </div>
      {!hasData && (
        <p className="mt-3 text-center text-sm text-gray-500">
          No habit check-ins in the last 7 days. Complete a habit to fill this chart.
        </p>
      )}
    </div>
  );
}

function MoodTrendChart({ values }: { values: number[] }) {
  if (values.length === 0) {
    return <EmptyInline text="No mood entries yet. Log today's mood to start your trend." />;
  }

  if (values.length === 1) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-6">
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold", MOOD_COLORS[values[0]])}>
          {values[0]}
        </span>
        <p className="text-sm text-gray-500">
          {moodLabel(values[0])} — need more entries for a trend.
        </p>
      </div>
    );
  }

  const points = values.map((value, index) => {
    const x = 8 + (index / (values.length - 1)) * 284;
    const y = 78 - ((value - 1) / 4) * 60;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 300 90" className="h-32 w-full" role="img" aria-label="Mood trend">
      {[1, 2, 3, 4, 5].map((level) => (
        <line
          key={level}
          x1="8"
          x2="292"
          y1={78 - ((level - 1) / 4) * 60}
          y2={78 - ((level - 1) / 4) * 60}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      ))}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point) => {
        const [x, y] = point.split(",");
        return <circle key={point} cx={x} cy={y} r="3" fill="#0ea5e9" />;
      })}
    </svg>
  );
}

export function HealthDashboard({ data }: { data: HealthDashboardData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeForm, setActiveForm] = useState<ActiveForm>("habit");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [habitTitle, setHabitTitle] = useState("");
  const [moodValue, setMoodValue] = useState(3);
  const [moodNote, setMoodNote] = useState("");

  const insightClasses = {
    neutral: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    positive: "bg-green-50 text-green-700 ring-green-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
  }[data.insight.tone];

  const metrics = [
    {
      label: "Health score",
      value: String(data.metrics.healthScore.value),
      detail: "Habit consistency plus mood, all time",
      icon: Activity,
      iconClass: "text-indigo-600",
      iconBg: "bg-indigo-50",
      lineColor: "#4f46e5",
      series: data.metrics.healthScore.series,
    },
    {
      label: "Today's habits",
      value:
        data.metrics.todayCompletion.percent === null
          ? "—"
          : `${data.metrics.todayCompletion.percent}%`,
      detail: `${data.metrics.todayCompletion.completed} of ${data.metrics.todayCompletion.total} completed today`,
      icon: CheckCircle2,
      iconClass: "text-green-600",
      iconBg: "bg-green-50",
      lineColor: "#10b981",
      series: data.metrics.todayCompletion.series,
    },
    {
      label: "Best streak",
      value: `${data.metrics.bestStreak.value} day${data.metrics.bestStreak.value === 1 ? "" : "s"}`,
      detail: data.metrics.bestStreak.habitTitle ?? "No habits yet",
      icon: Flame,
      iconClass: "text-amber-600",
      iconBg: "bg-amber-50",
      lineColor: "#d97706",
      series: data.metrics.bestStreak.series,
    },
    {
      label: "Mood (7-day avg)",
      value:
        data.metrics.mood.average === null ? "—" : `${data.metrics.mood.average} / 5`,
      detail:
        data.metrics.mood.latest === null
          ? "No mood entries yet"
          : `Latest: ${moodLabel(data.metrics.mood.latest)}`,
      icon: Smile,
      iconClass: "text-sky-600",
      iconBg: "bg-sky-50",
      lineColor: "#0284c7",
      series: data.metrics.mood.series,
    },
  ];

  function clearForms() {
    setEditingHabitId(null);
    setError(null);
    setHabitTitle("");
    setMoodValue(3);
    setMoodNote("");
  }

  function runAction(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        clearForms();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function editHabit(habit: HealthHabit) {
    setActiveForm("habit");
    setEditingHabitId(habit.id);
    setHabitTitle(habit.title);
  }

  function submitHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      if (editingHabitId) {
        await updateHabit(editingHabitId, habitTitle);
      } else {
        await createHabit(habitTitle);
      }
    });
  }

  function submitMood(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      await logMood(moodValue, moodNote.trim() || undefined);
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
              <HeartPulse className="h-4 w-4" />
              Health command center
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {data.todayLabel}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Habits, streaks, mood, and weekly activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveForm("habit");
                setEditingHabitId(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Habit
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveForm("mood");
                setEditingHabitId(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Smile className="h-4 w-4" />
              Log mood
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <SectionHeader
                  title="Weekly activity"
                  subtitle="Completed habit check-ins per day, last 7 days"
                />
                <WeeklyActivityChart days={data.weeklyActivity} />
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <SectionHeader
                  title="Mood trend"
                  subtitle="Chronological mood entries, scale 1 to 5"
                />
                <MoodTrendChart values={data.metrics.mood.series} />
              </section>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <SectionHeader title="Habits" subtitle="Daily completion, streaks, and last 7 days" />
              {data.habits.length === 0 ? (
                <EmptyInline text="No habits yet. Add a habit to start tracking streaks and daily completion." />
              ) : (
                <div className="space-y-3">
                  {data.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          title={habit.completedToday ? "Completed today" : "Mark complete for today"}
                          disabled={habit.completedToday || isPending}
                          onClick={() => runAction(() => completeHabit(habit.id))}
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm transition",
                            habit.completedToday
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-300 hover:text-green-600"
                          )}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {habit.title}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            {habit.weekLog.map((done, index) => (
                              <span
                                key={index}
                                className={cn(
                                  "h-1.5 w-4 rounded-full",
                                  done ? "bg-green-500" : "bg-gray-200"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                            habit.streak > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          <Flame className="h-3 w-3" />
                          {habit.streak}
                        </span>
                        <button
                          type="button"
                          title="Edit habit"
                          onClick={() => editHabit(habit)}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-indigo-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete habit"
                          onClick={() => runAction(() => deleteHabit(habit.id))}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <SectionHeader title="Recent mood entries" subtitle="Latest logged moods with notes" />
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-140 text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Mood</th>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {data.recentMoods.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          No mood entries yet. Log today&apos;s mood to populate the trend and averages.
                        </td>
                      </tr>
                    ) : (
                      data.recentMoods.map((entry) => (
                        <tr key={entry.id} className="align-middle">
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold",
                                MOOD_COLORS[entry.mood] ?? "bg-gray-100 text-gray-600"
                              )}
                            >
                              {entry.mood} / 5 · {moodLabel(entry.mood)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{entry.note ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                title="Delete mood entry"
                                onClick={() => runAction(() => deleteMoodEntry(entry.id))}
                                className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Quick add</h2>
                  <p className="text-xs text-gray-500">
                    {editingHabitId ? "Editing selected habit" : "Create health records"}
                  </p>
                </div>
                {editingHabitId && (
                  <button
                    type="button"
                    onClick={clearForms}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                {[
                  { key: "habit" as const, label: "Habit", icon: ListChecks },
                  { key: "mood" as const, label: "Mood", icon: Smile },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => {
                      setActiveForm(key);
                      setEditingHabitId(null);
                      setError(null);
                    }}
                    className={cn(
                      "flex h-9 items-center justify-center gap-1 rounded-lg text-xs font-semibold transition",
                      activeForm === key
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <div className="mt-4">
                {activeForm === "habit" && (
                  <form onSubmit={submitHabit} className="space-y-3">
                    <Field label="Habit">
                      <input
                        value={habitTitle}
                        onChange={(event) => setHabitTitle(event.target.value)}
                        placeholder="Drink water, stretch, walk"
                        className="finance-input"
                      />
                    </Field>
                    <SubmitRow pending={isPending} editing={editingHabitId !== null} />
                  </form>
                )}

                {activeForm === "mood" && (
                  <form onSubmit={submitMood} className="space-y-3">
                    <Field label="Today's mood">
                      <div className="grid grid-cols-5 gap-1">
                        {MOOD_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            onClick={() => setMoodValue(option.value)}
                            className={cn(
                              "flex h-12 flex-col items-center justify-center rounded-lg text-xs font-semibold transition",
                              moodValue === option.value
                                ? "bg-sky-600 text-white shadow-sm"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            )}
                          >
                            <span className="text-sm font-bold">{option.value}</span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Note">
                      <input
                        value={moodNote}
                        onChange={(event) => setMoodNote(event.target.value)}
                        placeholder="Optional"
                        className="finance-input"
                      />
                    </Field>
                    <SubmitRow pending={isPending} editing={false} />
                  </form>
                )}

              </div>
            </section>

            <section className={cn("rounded-2xl p-5 shadow-sm ring-1", insightClasses)}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <h2 className="text-sm font-bold">{data.insight.label}</h2>
              </div>
              <p className="mt-2 text-sm leading-6">{data.insight.message}</p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <SectionHeader title="Top streaks" subtitle="Longest active habit streaks" />
              {data.habits.length === 0 ? (
                <EmptyInline text="No streaks yet. Streaks grow each day you complete a habit." />
              ) : (
                <div className="space-y-4">
                  {[...data.habits]
                    .sort((a, b) => b.streak - a.streak)
                    .slice(0, 5)
                    .map((habit) => {
                      const best = Math.max(data.metrics.bestStreak.value, 1);
                      const percent = Math.round((habit.streak / best) * 100);
                      return (
                        <div key={habit.id}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {habit.title}
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-amber-600">
                              <Flame className="h-3.5 w-3.5" />
                              {habit.streak}
                            </span>
                          </div>
                          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitRow({ pending, editing }: { pending: boolean; editing: boolean }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {editing ? "Update" : "Add"}
      </button>
    </div>
  );
}
