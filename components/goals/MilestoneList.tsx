"use client";

import { FormEvent, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoalMilestoneItem } from "@/lib/goals";

type MilestoneListProps = {
  milestones: GoalMilestoneItem[];
  pending: boolean;
  onAdd: (title: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function MilestoneList({
  milestones,
  pending,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
}: MilestoneListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);

  function submitNewMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    onAdd(title);
    setNewTitle("");
  }

  function submitEditMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const title = editing.title.trim();
    if (!title) return;

    onUpdate(editing.id, title);
    setEditing(null);
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-2">
        {milestones.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
            No milestones yet. Add the first step for this goal.
          </div>
        ) : (
          milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
            >
              {editing?.id === milestone.id ? (
                <form onSubmit={submitEditMilestone} className="flex items-center gap-2">
                  <input
                    value={editing.title}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, title: event.target.value } : current
                      )
                    }
                    className="finance-input h-8"
                    aria-label="Milestone title"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    title="Save milestone"
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-indigo-600 disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Cancel milestone edit"
                    onClick={() => setEditing(null)}
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-gray-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      disabled={pending}
                      onChange={(event) => onToggle(milestone.id, event.currentTarget.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={cn(
                        "truncate",
                        milestone.completed && "text-gray-400 line-through"
                      )}
                    >
                      {milestone.title}
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Edit milestone"
                      onClick={() => setEditing({ id: milestone.id, title: milestone.title })}
                      className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-indigo-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete milestone"
                      onClick={() => onDelete(milestone.id)}
                      className="rounded-md p-1.5 text-gray-400 transition hover:bg-white hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={submitNewMilestone} className="flex items-center gap-2">
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Add a milestone"
          className="finance-input"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add milestone</span>
        </button>
      </form>
    </div>
  );
}
