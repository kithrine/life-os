"use client";

import { useState } from "react";
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

type RequiredTextField = Exclude<RequiredOnboardingField, "lifeStage">;

type TextField =
  | {
      id: RequiredTextField;
      label: string;
      placeholder: string;
      optional?: false;
    }
  | {
      id: "futureVision";
      label: string;
      placeholder: string;
      optional: true;
    };

const textFields: TextField[] = [
  {
    id: "currentSituation",
    label: "Current Situation",
    placeholder: "What is life like right now?",
  },
  {
    id: "biggestChallenge",
    label: "Biggest Challenge",
    placeholder: "What is the main thing you want to solve?",
  },
  {
    id: "careerGoals",
    label: "Career Goals",
    placeholder: "What do you want your work life to move toward?",
  },
  {
    id: "financialGoals",
    label: "Financial Goals",
    placeholder: "What financial outcomes matter most right now?",
  },
  {
    id: "healthGoals",
    label: "Health Goals",
    placeholder: "What would better health look like for you?",
  },
  {
    id: "personalGrowthGoals",
    label: "Personal Growth Goals",
    placeholder: "What do you want to learn, strengthen, or become?",
  },
  {
    id: "futureVision",
    label: "Additional Context",
    placeholder: "Optional: share a free-form vision for your next chapter.",
    optional: true,
  },
];

export function OnboardingForm({ action }: OnboardingFormProps) {
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors = validateOnboardingValues(readOnboardingFormData(formData));

    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0 || !action) {
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="lifeStage" className="mb-1 block text-sm font-medium text-gray-700">
          Life Stage
        </label>
        <select
          id="lifeStage"
          name="lifeStage"
          aria-required="true"
          aria-invalid={errors.lifeStage ? "true" : undefined}
          aria-describedby={errors.lifeStage ? "lifeStage-error" : undefined}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none",
            "transition focus:border-transparent focus:ring-2 focus:ring-indigo-500",
            errors.lifeStage ? "border-red-400" : "border-gray-300"
          )}
          defaultValue=""
        >
          <option value="" disabled>
            Select your current stage
          </option>
          <option value="student">Student</option>
          <option value="early-career">Early career</option>
          <option value="mid-career">Mid-career</option>
          <option value="career-transition">Career transition</option>
          <option value="family-focused">Family-focused</option>
          <option value="retired">Retired</option>
        </select>
        {errors.lifeStage ? (
          <p id="lifeStage-error" className="mt-1 text-xs text-red-500">
            {errors.lifeStage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {textFields.map((field) => {
          const fieldError = field.optional ? undefined : errors[field.id];

          return (
            <div key={field.id} className={field.optional ? "md:col-span-2" : undefined}>
              <label htmlFor={field.id} className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
                {field.optional ? (
                  <span className="font-normal text-gray-400"> (optional)</span>
                ) : null}
              </label>
              <textarea
                id={field.id}
                name={field.id}
                aria-required={field.optional ? undefined : "true"}
                aria-invalid={fieldError ? "true" : undefined}
                aria-describedby={fieldError ? `${field.id}-error` : undefined}
                placeholder={field.placeholder}
                rows={field.optional ? 4 : 3}
                className={cn(
                  "w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none",
                  "transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500",
                  fieldError ? "border-red-400" : "border-gray-300"
                )}
              />
              {fieldError ? (
                <p id={`${field.id}-error`} className="mt-1 text-xs text-red-500">
                  {fieldError}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {formError ? <p className="text-center text-sm text-red-500">{formError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white transition",
          "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        Complete onboarding
      </button>
    </form>
  );
}
