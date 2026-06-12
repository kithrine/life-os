"use client";

import { FormEvent, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  readOnboardingFormData,
  type OnboardingErrors,
  type RequiredOnboardingField,
  validateOnboardingValues,
} from "./validation";

type OnboardingActionResult = {
  success: false;
  errors?: OnboardingErrors;
  message?: string;
};

type OnboardingFormProps = {
  action?: (formData: FormData) => Promise<OnboardingActionResult | void>;
};

type OptionGroup = {
  id: RequiredOnboardingField;
  label: string;
  helper: string;
  multiple: boolean;
  options: string[];
};

const optionGroups: OptionGroup[] = [
  {
    id: "lifeStage",
    label: "Life Stage",
    helper: "Choose the stage that feels closest right now.",
    multiple: false,
    options: [
      "Student",
      "Career transition",
      "Building stability",
      "Parent/caregiver",
      "Starting over",
      "Growing professionally",
      "Retired",
      "Other",
    ],
  },
  {
    id: "currentSituation",
    label: "Current Situation",
    helper: "Pick any that describe your current season.",
    multiple: true,
    options: [
      "I feel overwhelmed",
      "I need more structure",
      "I am rebuilding",
      "I am focused on career",
      "I am focused on finances",
      "I am focused on health",
      "I want better habits",
      "I am not sure yet",
    ],
  },
  {
    id: "biggestChallenge",
    label: "Biggest Challenge",
    helper: "Select the friction points LifeOS should keep in mind.",
    multiple: true,
    options: [
      "Staying consistent",
      "Managing time",
      "Money stress",
      "Career direction",
      "Health and energy",
      "Motivation",
      "Confidence",
      "Too many priorities",
    ],
  },
  {
    id: "careerGoals",
    label: "Career Goals",
    helper: "Choose what matters for work and professional direction.",
    multiple: true,
    options: [
      "Find a new job",
      "Build skills",
      "Change careers",
      "Start a business",
      "Grow in my current role",
      "Improve resume/interviewing",
      "Network more",
      "Not focused on career right now",
    ],
  },
  {
    id: "financialGoals",
    label: "Financial Goals",
    helper: "Select the money goals that feel most relevant.",
    multiple: true,
    options: [
      "Save money",
      "Build emergency fund",
      "Pay bills on time",
      "Reduce debt",
      "Increase income",
      "Budget better",
      "Track spending",
      "Not focused on finances right now",
    ],
  },
  {
    id: "healthGoals",
    label: "Health Goals",
    helper: "Choose the health areas you want to support.",
    multiple: true,
    options: [
      "Move more",
      "Eat better",
      "Sleep better",
      "Reduce stress",
      "Build routines",
      "Improve energy",
      "Track mood",
      "Not focused on health right now",
    ],
  },
  {
    id: "personalGrowthGoals",
    label: "Personal Growth Goals",
    helper: "Pick the personal growth themes that fit.",
    multiple: true,
    options: [
      "Build confidence",
      "Stay accountable",
      "Heal and reset",
      "Improve discipline",
      "Learn something new",
      "Strengthen relationships",
      "Find purpose",
      "Feel more in control",
    ],
  },
];

const emptySelections: Record<RequiredOnboardingField, string[]> = {
  lifeStage: [],
  currentSituation: [],
  biggestChallenge: [],
  careerGoals: [],
  financialGoals: [],
  healthGoals: [],
  personalGrowthGoals: [],
};

export function OnboardingForm({ action }: OnboardingFormProps) {
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selections, setSelections] =
    useState<Record<RequiredOnboardingField, string[]>>(emptySelections);

  async function submitFormData(formData: FormData) {
    if (!action) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await action(formData);
      if (result?.success === false) {
        setErrors(result.errors ?? {});
        setFormError(result.message ?? "");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors = validateOnboardingValues(readOnboardingFormData(formData));

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0 || !action) {
      return;
    }

    await submitFormData(formData);
  }

  async function handleSkip() {
    setErrors({});
    setFormError("");

    const formData = new FormData();
    formData.set("onboardingIntent", "skip");

    await submitFormData(formData);
  }

  function toggleOption(group: OptionGroup, option: string) {
    setSelections((current) => {
      const currentValues = current[group.id];
      const isSelected = currentValues.includes(option);
      const nextValues = group.multiple
        ? isSelected
          ? currentValues.filter((value) => value !== option)
          : [...currentValues, option]
        : [option];

      return {
        ...current,
        [group.id]: nextValues,
      };
    });

    if (errors[group.id]) {
      setErrors((current) => ({ ...current, [group.id]: undefined }));
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {optionGroups.map((group) => {
        const selectedValues = selections[group.id];
        const fieldError = errors[group.id];

        return (
          <fieldset
            key={group.id}
            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
            aria-describedby={`${group.id}-hint ${fieldError ? `${group.id}-error` : ""}`}
          >
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <legend className="text-sm font-bold text-gray-900">{group.label}</legend>
                <p id={`${group.id}-hint`} className="mt-1 text-xs leading-5 text-gray-500">
                  {group.helper}
                </p>
              </div>
              <span className="w-fit rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
                {group.multiple ? "Select all that apply" : "Choose one"}
              </span>
            </div>

            {selectedValues.map((value) => (
              <input key={`${group.id}-${value}`} type="hidden" name={group.id} value={value} />
            ))}

            <div className="grid gap-2 sm:grid-cols-2">
              {group.options.map((option) => {
                const isSelected = selectedValues.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleOption(group, option)}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
                      "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-200"
                        : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        isSelected
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-gray-300 bg-white text-transparent"
                      )}
                      aria-hidden="true"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {fieldError ? (
              <p id={`${group.id}-error`} className="mt-2 text-xs font-medium text-red-500">
                {fieldError}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      <div>
        <label htmlFor="futureVision" className="mb-1 block text-sm font-bold text-gray-900">
          Additional Information
          <span className="font-normal text-gray-400"> (optional)</span>
        </label>
        <textarea
          id="futureVision"
          name="futureVision"
          placeholder="Anything else you want LifeOS or the AI Coach to understand?"
          rows={4}
          className={cn(
            "w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none",
            "transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
          )}
        />
      </div>

      {formError ? <p className="text-center text-sm text-red-500">{formError}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSkip}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition",
            "hover:border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          Skip for now
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:min-w-40",
            "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          Continue
        </button>
      </div>
    </form>
  );
}
