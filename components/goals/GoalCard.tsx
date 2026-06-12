"use client";

import { CheckCircle2, Pencil, Target, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoalItem } from "@/lib/goals";
import { MilestoneList } from "./MilestoneList";

const CATEGORY_STYLES: Record<string, { badge: string; icon: string; bar: string }> = {
  career: {
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    icon: "bg-indigo-50 text-indigo-600",
    bar: "bg-indigo-500",
  },
  finance: {
    badge: "bg-green-50 text-green-700 ring-green-100",
    icon: "bg-green-50 text-green-600",
    bar: "bg-green-500",
  },
  health: {
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    icon: "bg-sky-50 text-sky-600",
    bar: "bg-sky-500",
  },
  personal: {
    badge: "bg-purple-50 text-purple-700 ring-purple-100",
    icon: "bg-purple-50 text-purple-600",
    bar: "bg-purple-500",
  },
  growth: {
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
  },
};

function categoryStyle(category: string) {
  return (
    CATEGORY_STYLES[category] ?? {
      badge: "bg-gray-50 text-gray-700 ring-gray-100",
      icon: "bg-gray-50 text-gray-600",
      bar: "bg-indigo-500",
    }
  );
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 100));
}

type GoalCardProps = {
  goal: GoalItem;
  pending: boolean;
  onEdit: (goal: GoalItem) => void;
  onDelete: (id: string) => void;
  onAddMilestone: (goalId: string, title: string) => void;
  onToggleMilestone: (id: string, completed: boolean) => void;
  onUpdateMilestone: (id: string, title: string) => void;
  onDeleteMilestone: (id: string) => void;
};

export function GoalCard({
  goal,
  pending,
  onEdit,
  onDelete,
  onAddMilestone,
  onToggleMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
}: GoalCardProps) {
  const style = categoryStyle(goal.category);

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn("flex h-9 w-9 items-center justify-center rounded-lg", style.icon)}
            >
              <Target className="h-4 w-4" />
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-1 text-xs font-semibold capitalize ring-1",
                style.badge
              )}
            >
              {goal.category}
            </span>
          </div>
          <h2 className="mt-3 truncate text-lg font-extrabold tracking-tight text-gray-900">
            {goal.title}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Edit goal"
            onClick={() => onEdit(goal)}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-indigo-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Delete goal"
            onClick={() => onDelete(goal.id)}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Progress
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
              {goal.progress}%
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            {goal.completedMilestones} / {goal.totalMilestones} complete
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full rounded-full transition-all", style.bar)}
            style={{ width: `${clampPercent(goal.progress)}%` }}
          />
        </div>
      </div>

      <MilestoneList
        milestones={goal.milestones}
        pending={pending}
        onAdd={(title) => onAddMilestone(goal.id, title)}
        onToggle={onToggleMilestone}
        onUpdate={onUpdateMilestone}
        onDelete={onDeleteMilestone}
      />
    </article>
  );
}
