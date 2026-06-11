"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { addSkill, deleteSkill } from "@/actions/career";

type Skill = {
  id: string;
  name: string;
  level: string;
};

const LEVEL_STYLES: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
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
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 mb-1">
              Skill name
            </label>
            <input
              id="skill-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TypeScript"
              className={cn(
                "w-full px-3 py-2 rounded-lg border text-sm outline-none",
                "focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition",
                nameError ? "border-red-400" : "border-gray-300"
              )}
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>
          <div>
            <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              id="skill-level"
              aria-label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNameError(""); setName(""); }}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {initialSkills.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 italic">No skills added yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {initialSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{skill.name}</p>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                    LEVEL_STYLES[skill.level] ?? "bg-gray-100 text-gray-600"
                  )}
                >
                  {skill.level}
                </span>
              </div>
              <button
                type="button"
                aria-label="Delete skill"
                onClick={() => handleDelete(skill.id)}
                className="text-gray-400 hover:text-red-500 transition ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
