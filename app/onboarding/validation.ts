export const requiredOnboardingFields = [
  {
    id: "lifeStage",
    label: "Life Stage",
    errorMessage: "Life stage is required",
  },
  {
    id: "currentSituation",
    label: "Current Situation",
    errorMessage: "Current situation is required",
  },
  {
    id: "biggestChallenge",
    label: "Biggest Challenge",
    errorMessage: "Biggest challenge is required",
  },
  {
    id: "careerGoals",
    label: "Career Goals",
    errorMessage: "Career goals are required",
  },
  {
    id: "financialGoals",
    label: "Financial Goals",
    errorMessage: "Financial goals are required",
  },
  {
    id: "healthGoals",
    label: "Health Goals",
    errorMessage: "Health goals are required",
  },
  {
    id: "personalGrowthGoals",
    label: "Personal Growth Goals",
    errorMessage: "Personal growth goals are required",
  },
] as const;

export const optionalOnboardingFields = ["futureVision"] as const;

export type RequiredOnboardingField = (typeof requiredOnboardingFields)[number]["id"];
export type OptionalOnboardingField = (typeof optionalOnboardingFields)[number];
export type OnboardingField = RequiredOnboardingField | OptionalOnboardingField;
export type OnboardingValues = Record<OnboardingField, string>;
export type OnboardingErrors = Partial<Record<RequiredOnboardingField, string>>;

function formValue(formData: FormData, key: OnboardingField) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function joinedFormValues(formData: FormData, key: RequiredOnboardingField) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
}

export function readOnboardingFormData(formData: FormData): OnboardingValues {
  return {
    lifeStage: formValue(formData, "lifeStage"),
    currentSituation: joinedFormValues(formData, "currentSituation"),
    biggestChallenge: joinedFormValues(formData, "biggestChallenge"),
    careerGoals: joinedFormValues(formData, "careerGoals"),
    financialGoals: joinedFormValues(formData, "financialGoals"),
    healthGoals: joinedFormValues(formData, "healthGoals"),
    personalGrowthGoals: joinedFormValues(formData, "personalGrowthGoals"),
    futureVision: formValue(formData, "futureVision"),
  };
}

export function validateOnboardingValues(values: OnboardingValues): OnboardingErrors {
  return requiredOnboardingFields.reduce<OnboardingErrors>((errors, field) => {
    if (!values[field.id]) {
      errors[field.id] = field.errorMessage;
    }

    return errors;
  }, {});
}
