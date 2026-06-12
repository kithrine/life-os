"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const CLERK_ERROR_MAP: Record<string, string> = {
  form_password_incorrect: "Incorrect email or password",
  form_identifier_not_found: "No account found with that email",
  too_many_requests: "Too many attempts, please try again later",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type OAuthStrategy = "oauth_google" | "oauth_microsoft" | "oauth_apple";

export function LoginForm() {
  const { signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");

  function validate() {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setAuthError("");

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await signIn.password({ emailAddress: email, password });

      if (error) {
        const code = (error as { code?: string }).code ?? "";
        setAuthError(CLERK_ERROR_MAP[code] ?? "Something went wrong, please try again");
        return;
      }

      await signIn.finalize();
      window.location.href = "/dashboard";
    } catch {
      setAuthError("Something went wrong, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(strategy: OAuthStrategy) {
    if (!signIn) return;
    const { error } = await signIn.create({
      strategy,
      redirectUrl: `${window.location.origin}/sso-callback`,
      actionCompleteRedirectUrl: "/dashboard",
    });
    if (error) {
      setAuthError("OAuth sign-in failed. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">Welcome back 👋</h2>
        <p className="text-sm text-gray-500 mt-1">Log in to continue your journey.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none",
                "focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition",
                emailError ? "border-red-400" : "border-gray-300"
              )}
            />
          </div>
          {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm outline-none",
                "focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition",
                passwordError ? "border-red-400" : "border-gray-300"
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between mb-5">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember me
          </label>
          <a href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Auth error */}
        {authError && (
          <p className="text-sm text-red-500 mb-4 text-center">{authError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-2.5 rounded-lg text-white font-semibold text-sm transition",
            "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
            "disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          )}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Log in
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* OAuth buttons */}
      <div className="flex gap-3">
        <OAuthButton
          label="Google"
          onClick={() => handleOAuth("oauth_google")}
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
        />
        <OAuthButton
          label="Apple"
          onClick={() => handleOAuth("oauth_apple")}
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.4.07 2.37.74 3.18.8 1.21-.24 2.37-.93 3.66-.84 1.57.12 2.75.72 3.51 1.91-3.22 1.93-2.45 6.2.7 7.4-.51 1.37-1.19 2.72-2.05 3.61zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          }
        />
        <OAuthButton
          label="Microsoft"
          onClick={() => handleOAuth("oauth_microsoft")}
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#00A4EF" d="M13 1h10v10H13z" />
              <path fill="#7FBA00" d="M1 13h10v10H1z" />
              <path fill="#FFB900" d="M13 13h10v10H13z" />
            </svg>
          }
        />
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="text-indigo-600 font-medium hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

function OAuthButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex-1 flex items-center justify-center py-2.5 rounded-lg border border-gray-300",
        "hover:bg-gray-50 transition focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}
