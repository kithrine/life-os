"use client";

import type { FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";

export const GOAL_CATEGORIES = ["career", "finance", "health", "personal", "growth"];

export type GoalFormValues = {
  title: string;
  category: string;
};

type GoalFormProps = {
  values: GoalFormValues;
  editing: boolean;
  pending: boolean;
  onChange: (values: GoalFormValues) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function GoalForm({
  values,
  editing,
  pending,
  onChange,
  onCancel,
  onSubmit,
}: GoalFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Goal title
        </span>
        <input
          value={values.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
          placeholder="Launch portfolio, run a 10K, build emergency fund"
          className="finance-input"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Category
        </span>
        <select
          value={values.category}
          onChange={(event) => onChange({ ...values, category: event.target.value })}
          className="finance-input capitalize"
        >
          {GOAL_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? "Update goal" : "Create goal"}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
