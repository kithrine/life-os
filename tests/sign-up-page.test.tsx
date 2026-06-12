import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SignUpPage from "@/app/sign-up/[[...sign-up]]/page";
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

  it("renders Clerk sign-up configured for onboarding", async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Carter" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
    expect(SignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRedirectUrl: "/onboarding",
        fallbackRedirectUrl: "/onboarding",
        signInUrl: "/sign-in",
      }),
      undefined
    );
  });

  it("renders a required first name field", () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeRequired();
  });

  it("renders a required last name field", () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeRequired();
  });

  it("does not render Clerk sign-up until required identity fields are submitted", async () => {
    render(<SignUpPage />);

    expect(screen.queryByTestId("clerk-sign-up")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.queryByTestId("clerk-sign-up")).not.toBeInTheDocument();
  });

  it("passes submitted first and last name values to Clerk sign-up", async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Carter" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument();
    expect(SignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRedirectUrl: "/onboarding",
        fallbackRedirectUrl: "/onboarding",
        signInUrl: "/sign-in",
        initialValues: {
          firstName: "John",
          lastName: "Carter",
        },
        unsafeMetadata: {
          firstName: "John",
          lastName: "Carter",
        },
      }),
      undefined
    );
  });
});
