"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, ListChecks, Plus, Target, TrendingUp } from "lucide-react";
import {
  createGoal,
  createMilestone,
  deleteGoal,
  deleteMilestone,
  toggleMilestoneCompletion,
  updateGoal,
  updateMilestone,
} from "@/actions/goals";
import type { GoalItem } from "@/lib/goals";
import { cn } from "@/lib/utils";
import { GoalCard } from "./GoalCard";
import { GoalForm, type GoalFormValues } from "./GoalForm";

const emptyGoalForm: GoalFormValues = {
  title: "",
  category: "personal",
};

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconClass,
  iconBg,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Target;
  iconClass: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconClass)} />
        </span>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
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

export function GoalsDashboard({
  goals,
  loadError,
}: {
  goals: GoalItem[];
  loadError?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [goalForm, setGoalForm] = useState<GoalFormValues>(emptyGoalForm);
  const [error, setError] = useState<string | null>(null);
  const [isFormHighlighted, setIsFormHighlighted] = useState(false);
  const formPanelRef = useRef<HTMLElement | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const metrics = useMemo(() => {
    const totalMilestones = goals.reduce((sum, goal) => sum + goal.totalMilestones, 0);
    const completedMilestones = goals.reduce(
      (sum, goal) => sum + goal.completedMilestones,
      0
    );
    const averageProgress =
      goals.length > 0
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
        : 0;
    const completedGoals = goals.filter(
      (goal) => goal.totalMilestones > 0 && goal.progress === 100
    ).length;

    return {
      totalMilestones,
      completedMilestones,
      averageProgress,
      completedGoals,
    };
  }, [goals]);

  function clearGoalForm() {
    setEditingGoal(null);
    setGoalForm(emptyGoalForm);
  }

  function drawAttentionToForm() {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    setIsFormHighlighted(true);
    formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    highlightTimerRef.current = setTimeout(() => {
      setIsFormHighlighted(false);
    }, 1800);
  }

  function startNewGoal() {
    clearGoalForm();
    drawAttentionToForm();
  }

  function runAction(action: () => Promise<void>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        after?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(
      async () => {
        if (editingGoal) {
          await updateGoal({ ...goalForm, id: editingGoal.id });
        } else {
          await createGoal(goalForm);
        }
      },
      () => clearGoalForm()
    );
  }

  function editGoal(goal: GoalItem) {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      category: goal.category,
    });
    drawAttentionToForm();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
              <Target className="h-4 w-4" />
              Goals command center
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Goals
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan outcomes, break them into milestones, and track progress automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={startNewGoal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New goal
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total goals"
            value={String(goals.length)}
            detail="Active goals in LifeOS"
            icon={Target}
            iconClass="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <MetricCard
            label="Average progress"
            value={`${metrics.averageProgress}%`}
            detail="Based on completed milestones"
            icon={TrendingUp}
            iconClass="text-green-600"
            iconBg="bg-green-50"
          />
          <MetricCard
            label="Milestones"
            value={`${metrics.completedMilestones}/${metrics.totalMilestones}`}
            detail="Completed across all goals"
            icon={ListChecks}
            iconClass="text-sky-600"
            iconBg="bg-sky-50"
          />
          <MetricCard
            label="Completed"
            value={String(metrics.completedGoals)}
            detail="Goals at 100%"
            icon={Flag}
            iconClass="text-amber-600"
            iconBg="bg-amber-50"
          />
        </section>

        {loadError ? (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="rounded-lg bg-rose-50 px-3 py-3 text-sm font-medium text-rose-700">
              {loadError}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {goals.length === 0 ? (
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <EmptyInline text="No goals yet. Create your first goal to start tracking milestones." />
              </section>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    pending={isPending}
                    onEdit={editGoal}
                    onDelete={(id) => runAction(() => deleteGoal(id))}
                    onAddMilestone={(goalId, title) =>
                      runAction(() => createMilestone({ goalId, title }))
                    }
                    onToggleMilestone={(id, completed) =>
                      runAction(() => toggleMilestoneCompletion(id, completed))
                    }
                    onUpdateMilestone={(id, title) =>
                      runAction(() => updateMilestone({ id, title }))
                    }
                    onDeleteMilestone={(id) => runAction(() => deleteMilestone(id))}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <section
              ref={formPanelRef}
              className={cn(
                "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-300",
                isFormHighlighted && "bg-indigo-50/40 shadow-md ring-2 ring-indigo-300"
              )}
            >
              <div className="mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  {editingGoal ? "Edit goal" : "Create goal"}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Categories keep your goals aligned with the rest of LifeOS.
                </p>
              </div>

              {error ? (
                <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}

              <GoalForm
                values={goalForm}
                editing={Boolean(editingGoal)}
                pending={isPending}
                onChange={setGoalForm}
                onCancel={clearGoalForm}
                onSubmit={submitGoal}
              />
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
