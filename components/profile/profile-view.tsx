"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProfile, type ProfileFormData } from "@/actions/profile";

type ClerkUser = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
};

type ProfileData = {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  lifeStage: string | null;
  currentSituation: string | null;
  biggestChallenge: string | null;
  careerGoals: string | null;
  financialGoals: string | null;
  healthGoals: string | null;
  personalGrowthGoals: string | null;
  futureVision: string | null;
  createdAt: string;
};

type Counts = {
  goals: number;
  habits: number;
  skills: number;
  jobApplications: number;
};

interface ProfileViewProps {
  clerkUser: ClerkUser;
  profile: ProfileData;
  counts: Counts;
}

const LIFE_STAGES = [
  "student",
  "recent-grad",
  "early-career",
  "mid-career",
  "career-change",
  "senior",
  "retired",
];

const STORY_FIELDS = [
  { key: "currentSituation", label: "Current Situation" },
  { key: "biggestChallenge", label: "Biggest Challenge" },
  { key: "futureVision", label: "Future Vision" },
] as const;

const GOAL_FIELDS = [
  { key: "careerGoals", label: "Career Goals", badge: "career", color: "bg-blue-50 text-blue-700" },
  { key: "financialGoals", label: "Financial Goals", badge: "finance", color: "bg-green-50 text-green-700" },
  { key: "healthGoals", label: "Health Goals", badge: "health", color: "bg-red-50 text-red-700" },
  { key: "personalGrowthGoals", label: "Personal Growth Goals", badge: "growth", color: "bg-purple-50 text-purple-700" },
] as const;

export function ProfileView({ clerkUser, profile, counts }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormData>({
    name: profile.name ?? "",
    lifeStage: profile.lifeStage ?? "",
    currentSituation: profile.currentSituation ?? "",
    biggestChallenge: profile.biggestChallenge ?? "",
    careerGoals: profile.careerGoals ?? "",
    financialGoals: profile.financialGoals ?? "",
    healthGoals: profile.healthGoals ?? "",
    personalGrowthGoals: profile.personalGrowthGoals ?? "",
    futureVision: profile.futureVision ?? "",
  });

  const displayName =
    form.name ||
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    "Your Name";

  const initials = displayName.charAt(0).toUpperCase();

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateProfile(form);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      name: profile.name ?? "",
      lifeStage: profile.lifeStage ?? "",
      currentSituation: profile.currentSituation ?? "",
      biggestChallenge: profile.biggestChallenge ?? "",
      careerGoals: profile.careerGoals ?? "",
      financialGoals: profile.financialGoals ?? "",
      healthGoals: profile.healthGoals ?? "",
      personalGrowthGoals: profile.personalGrowthGoals ?? "",
      futureVision: profile.futureVision ?? "",
    });
    setIsEditing(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Header card */}
        <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-start gap-5">
            {clerkUser.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clerkUser.imageUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <p className="mt-0.5 text-sm text-gray-500">{clerkUser.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {form.lifeStage && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {form.lifeStage}
                  </span>
                )}
                <span className="text-xs text-gray-400">Member since {memberSince}</span>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Goals", value: counts.goals },
            { label: "Habits", value: counts.habits },
            { label: "Skills", value: counts.skills },
            { label: "Applications", value: counts.jobApplications },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-200"
            >
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            {/* Personal info edit */}
            <Section title="Personal Info">
              <div className="space-y-4">
                <FormField label="Display Name">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Life Stage">
                  <select
                    value={form.lifeStage}
                    onChange={(e) => setForm((f) => ({ ...f, lifeStage: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select a life stage</option>
                    {LIFE_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </Section>

            {/* My Story edit */}
            <Section title="My Story">
              <div className="space-y-4">
                {STORY_FIELDS.map(({ key, label }) => (
                  <FormField key={key} label={label}>
                    <textarea
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      className={cn(inputCls, "resize-none")}
                    />
                  </FormField>
                ))}
              </div>
            </Section>

            {/* My Goals edit */}
            <Section title="My Goals">
              <div className="space-y-4">
                {GOAL_FIELDS.map(({ key, label }) => (
                  <FormField key={key} label={label}>
                    <textarea
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      className={cn(inputCls, "resize-none")}
                    />
                  </FormField>
                ))}
              </div>
            </Section>

            {/* Save / Cancel */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* My Story view */}
            <Section title="My Story">
              <div className="space-y-5">
                {STORY_FIELDS.map(({ key, label }) => (
                  <ReadField key={key} label={label} value={profile[key]} />
                ))}
              </div>
            </Section>

            {/* My Goals view */}
            <Section title="My Goals">
              <div className="space-y-5">
                {GOAL_FIELDS.map(({ key, label, badge, color }) => (
                  <div key={key}>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          color
                        )}
                      >
                        {badge}
                      </span>
                      <p className="text-xs font-semibold text-gray-500">{label}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">
                      {profile[key] ?? <NotSetText />}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {value ? (
        <p className="mt-1 text-sm text-gray-800">{value}</p>
      ) : (
        <p className="mt-1 text-sm italic text-gray-400">Not set</p>
      )}
    </div>
  );
}

function NotSetText() {
  return <span className="italic text-gray-400">Not set</span>;
}
