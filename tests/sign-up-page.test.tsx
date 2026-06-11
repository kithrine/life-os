import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SignUpPage from "@/app/sign-up/page";
import { SignUp } from "@clerk/nextjs";

vi.mock("@clerk/nextjs", () => ({
  SignUp: vi.fn(() => <div data-testid="clerk-sign-up">Clerk SignUp</div>),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: {
    alt: string;
    fill?: boolean;
    priority?: boolean;
    src: string;
    [key: string]: unknown;
  }) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.priority;

    return <span aria-hidden={alt === "" ? "true" : undefined} data-src={src} {...imageProps} />;
  },
}));

describe("SignUpPage", () => {
  it("renders the sign-up page successfully", () => {
    render(<SignUpPage />);

    expect(
      screen.getByRole("heading", { name: /create your lifeos account/i })
    ).toBeInTheDocument();
  });

  it("renders Clerk sign-up configured for onboarding", () => {
    render(<SignUpPage />);

    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
    expect(SignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRedirectUrl: "/onboarding",
        fallbackRedirectUrl: "/onboarding",
        signInUrl: "/",
      }),
      undefined
    );
  });
});
