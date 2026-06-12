"use client";

import { FormEvent, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type Identity = {
  firstName: string;
  lastName: string;
};

const emptyIdentity: Identity = {
  firstName: "",
  lastName: "",
};

export function SignUpIdentityForm() {
  const [identity, setIdentity] = useState<Identity>(emptyIdentity);
  const [submittedIdentity, setSubmittedIdentity] = useState<Identity | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Identity, string>>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextIdentity = {
      firstName: identity.firstName.trim(),
      lastName: identity.lastName.trim(),
    };
    const nextErrors: Partial<Record<keyof Identity, string>> = {};

    if (!nextIdentity.firstName) nextErrors.firstName = "First name is required";
    if (!nextIdentity.lastName) nextErrors.lastName = "Last name is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmittedIdentity(nextIdentity);
  }

  if (submittedIdentity) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-2xl bg-white/95 p-4 text-center shadow-xl ring-1 ring-gray-100 backdrop-blur">
          <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            Account for
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {submittedIdentity.firstName} {submittedIdentity.lastName}
          </p>
          <button
            type="button"
            onClick={() => setSubmittedIdentity(null)}
            className="mt-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Edit name
          </button>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          forceRedirectUrl="/onboarding"
          fallbackRedirectUrl="/onboarding"
          signInUrl="/sign-in"
          initialValues={submittedIdentity}
          unsafeMetadata={submittedIdentity}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-md",
              cardBox: "mx-auto w-full rounded-2xl shadow-xl",
              card: "rounded-2xl",
            },
          }}
        />
      </div>
    );
  }

  return (
    <form
      className="mx-auto w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-xl ring-1 ring-gray-100 backdrop-blur"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="mb-5 text-center">
        <p className="text-sm font-semibold text-indigo-600">First, what should LifeOS call you?</p>
        <p className="mt-1 text-sm text-gray-500">
          This helps personalize greetings and your profile.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={identity.firstName}
            onChange={(event) =>
              setIdentity((current) => ({ ...current, firstName: event.target.value }))
            }
            aria-invalid={errors.firstName ? "true" : undefined}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition",
              "focus:border-transparent focus:ring-2 focus:ring-indigo-500",
              errors.firstName ? "border-red-400" : "border-gray-300"
            )}
          />
          {errors.firstName ? (
            <p id="firstName-error" className="mt-1 text-xs font-medium text-red-500">
              {errors.firstName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={identity.lastName}
            onChange={(event) =>
              setIdentity((current) => ({ ...current, lastName: event.target.value }))
            }
            aria-invalid={errors.lastName ? "true" : undefined}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition",
              "focus:border-transparent focus:ring-2 focus:ring-indigo-500",
              errors.lastName ? "border-red-400" : "border-gray-300"
            )}
          />
          {errors.lastName ? (
            <p id="lastName-error" className="mt-1 text-xs font-medium text-red-500">
              {errors.lastName}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        className={cn(
          "mt-5 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white transition",
          "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        Continue
      </button>
    </form>
  );
}
