"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Code2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addSkill, deleteSkill } from "@/actions/career";

type Skill = {
  id: string;
  name: string;
  level: string;
};

const LEVEL_DOT: Record<string, string> = {
  beginner: "bg-green-400",
  intermediate: "bg-yellow-400",
  advanced: "bg-indigo-500",
};

export function SkillsSection({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("beginner");
  const [nameError, setNameError] = useState("");

  function handleAdd() {
    if (!name.trim()) {
      setNameError("Skill name is required");
      return;
    }
    setNameError("");
    startTransition(async () => {
      await addSkill({ name: name.trim(), level });
      setName("");
      setLevel("beginner");
      setShowForm(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSkill(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Code2 className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Skills</h2>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-5 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <label htmlFor="skill-name" className="mb-1 block text-sm font-medium text-gray-700">
              Skill name
            </label>
            <input
              id="skill-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TypeScript"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
                "focus:border-transparent focus:ring-2 focus:ring-indigo-500",
                nameError ? "border-red-400" : "border-gray-300"
              )}
            />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </div>
          <div>
            <label htmlFor="skill-level" className="mb-1 block text-sm font-medium text-gray-700">
              Level
            </label>
            <select
              id="skill-level"
              aria-label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNameError(""); setName(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills grid or empty state */}
      {initialSkills.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Code2 className="h-8 w-8 text-gray-200" />
          <p className="text-sm text-gray-400">No skills added yet</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Add your first skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {initialSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:bg-white"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{skill.name}</p>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 capitalize">
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full",
                      LEVEL_DOT[skill.level] ?? "bg-gray-400"
                    )}
                  />
                  {skill.level}
                </span>
              </div>
              <button
                type="button"
                aria-label="Delete skill"
                onClick={() => handleDelete(skill.id)}
                className="ml-2 shrink-0 text-gray-400 transition hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
